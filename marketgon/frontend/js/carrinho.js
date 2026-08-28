function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function obterCarrinho() {
  return JSON.parse(localStorage.getItem('mg_carrinho') || '[]');
}
function salvarCarrinho(carrinho) {
  localStorage.setItem('mg_carrinho', JSON.stringify(carrinho));
  renderizarCarrinho();
}

const FRETE_PADRAO = 10;
const VALOR_MINIMO_SEM_FRETE = 30;

function renderizarCarrinho() {
  const lista = document.getElementById('lista-itens');
  const carrinho = obterCarrinho();
  lista.innerHTML = '';

  if (carrinho.length === 0) {
    lista.innerHTML = '<p>Seu carrinho está vazio.</p>';
  }

  carrinho.forEach((item, indice) => {
    const linha = document.createElement('div');
    linha.className = 'item-carrinho';
    linha.innerHTML = `
      <img src="${urlImagem(item.imagem)}" alt="${item.nome}" onerror="this.onerror=null; this.src=urlImagem('placeholder.svg')">
      <div class="nome-item">${item.nome}</div>
      <div class="qtd-controle">
        <button data-acao="menos">-</button>
        <span>${item.quantidade}</span>
        <button data-acao="mais">+</button>
      </div>
      <div class="preco-com-desconto">${formatarPreco(item.preco_unitario * item.quantidade)}</div>
      <button data-acao="remover" title="Remover">✕</button>
    `;
    linha.querySelector('[data-acao="menos"]').addEventListener('click', () => alterarQuantidade(indice, -1));
    linha.querySelector('[data-acao="mais"]').addEventListener('click', () => alterarQuantidade(indice, 1));
    linha.querySelector('[data-acao="remover"]').addEventListener('click', () => removerItem(indice));
    lista.appendChild(linha);
  });

  document.getElementById('contagem-itens').textContent = `${carrinho.length} Iten${carrinho.length === 1 ? '' : 's'}`;

  const subtotal = carrinho.reduce((soma, item) => soma + item.preco_unitario * item.quantidade, 0);
  const frete = subtotal >= VALOR_MINIMO_SEM_FRETE || subtotal === 0 ? 0 : FRETE_PADRAO;
  const total = subtotal + frete;

  document.getElementById('valor-pedidos').textContent = formatarPreco(subtotal);
  document.getElementById('valor-frete').textContent = formatarPreco(frete);
  document.getElementById('valor-total').textContent = formatarPreco(total);

  const avisoFrete = document.getElementById('aviso-frete');
  avisoFrete.style.display = subtotal >= VALOR_MINIMO_SEM_FRETE || subtotal === 0 ? 'none' : 'block';
}

function alterarQuantidade(indice, delta) {
  const carrinho = obterCarrinho();
  carrinho[indice].quantidade = Math.max(1, carrinho[indice].quantidade + delta);
  salvarCarrinho(carrinho);
}
function removerItem(indice) {
  const carrinho = obterCarrinho();
  carrinho.splice(indice, 1);
  salvarCarrinho(carrinho);
}
document.getElementById('esvaziar-carrinho')?.addEventListener('click', () => salvarCarrinho([]));

// Substitua o document.getElementById('ir-para-pagamento')?.addEventListener(...) inteiro por isto:

document.getElementById('ir-para-pagamento')?.addEventListener('click', (e) => {
  e.preventDefault();
  const carrinho = obterCarrinho();
  if (carrinho.length === 0) return alert('Seu carrinho está vazio.');

  const usuario = obterUsuarioLogado();
  if (!usuario) {
    alert('Faça login para continuar.');
    window.location.href = 'login.html';
    return;
  }

  carregarEnderecosModal();
  document.getElementById('modal-checkout').classList.remove('hidden');
});

// Controle de Endereços no Modal
function carregarEnderecosModal() {
  const usuario = obterUsuarioLogado();
  const container = document.getElementById('lista-enderecos-modal');
  const enderecos = usuario.enderecos || [];
  
  if (enderecos.length === 0) {
    container.innerHTML = '<p style="color:#64748b; font-size:14px;">Nenhum endereço cadastrado para entrega.</p>';
    document.getElementById('form-novo-endereco-modal').classList.remove('hidden');
    document.getElementById('btn-exibir-form-endereco').classList.add('hidden');
  } else {
    container.innerHTML = enderecos.map((end, idx) => `
      <label style="display:flex; align-items:center; gap:10px; background:#f8fafc; padding:12px; border:1px solid #cbd5e1; border-radius:4px; margin-bottom:8px; cursor:pointer;">
        <input type="radio" name="endereco_selecionado" value="${idx}" ${idx === 0 ? 'checked' : ''}>
        <span style="font-size:14px; color:#334155;"><strong>${end.rua}, ${end.numero}</strong> - ${end.bairro} (CEP: ${end.cep})</span>
      </label>
    `).join('');
    document.getElementById('form-novo-endereco-modal').classList.add('hidden');
    document.getElementById('btn-exibir-form-endereco').classList.remove('hidden');
  }
}

document.getElementById('btn-exibir-form-endereco')?.addEventListener('click', () => {
  document.getElementById('form-novo-endereco-modal').classList.remove('hidden');
});

document.getElementById('btn-salvar-endereco-modal')?.addEventListener('click', () => {
  const cep = document.getElementById('end-cep').value.trim();
  const rua = document.getElementById('end-rua').value.trim();
  const numero = document.getElementById('end-num').value.trim();
  const bairro = document.getElementById('end-bairro').value.trim();

  if (!cep || !rua || !numero || !bairro) return alert('Preencha todos os campos obrigatórios do endereço.');
  
  const usuario = obterUsuarioLogado();
  if (!usuario.enderecos) usuario.enderecos = [];
  usuario.enderecos.push({ cep, rua, numero, bairro });
  
  // Atualiza no localStorage
  localStorage.setItem('mg_usuario', JSON.stringify(usuario));
  
  // Limpa o form
  document.getElementById('form-novo-endereco-modal').reset();
  carregarEnderecosModal();
});

// Finalização da Compra
document.getElementById('btn-confirmar-pedido-modal')?.addEventListener('click', async () => {
  const usuario = obterUsuarioLogado();
  const carrinho = obterCarrinho();
  
  if (!usuario.enderecos || usuario.enderecos.length === 0) {
    return alert('Por favor, cadastre e selecione um endereço de entrega antes de prosseguir.');
  }

  const subtotal = carrinho.reduce((soma, item) => soma + item.preco_unitario * item.quantidade, 0);
  const frete = subtotal >= VALOR_MINIMO_SEM_FRETE ? 0 : FRETE_PADRAO;
  const metodoPagamento = document.querySelector('input[name="pagamento"]:checked').value;

  try {
    await apiFetch('/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        cliente: usuario.nome,
        frete,
        desconto: 0,
        metodo_pagamento: metodoPagamento,
        itens: carrinho.map((i) => ({
          produto_id: i.produto_id,
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario
        }))
      })
    });
    
    salvarCarrinho([]);
    alert(`Pedido finalizado com sucesso! Forma de pagamento: ${metodoPagamento.toUpperCase()}`);
    window.location.href = 'index.html';
  } catch (erro) {
    alert('Erro ao finalizar pedido: ' + erro.message);
  }
});
document.addEventListener('DOMContentLoaded', renderizarCarrinho);
