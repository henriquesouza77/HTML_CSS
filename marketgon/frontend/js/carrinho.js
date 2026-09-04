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

// Estado global do Cupom
let cupomAtivo = false;

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

  // CÁLCULO DE SUB-TOTAL, DESCONTO E TOTAL
  const subtotal = carrinho.reduce((soma, item) => soma + item.preco_unitario * item.quantidade, 0);
  const valorDesconto = cupomAtivo ? subtotal * 0.20 : 0; // 20% de desconto
  const subtotalComDesconto = subtotal - valorDesconto;
  const frete = subtotal >= VALOR_MINIMO_SEM_FRETE || subtotal === 0 ? 0 : FRETE_PADRAO;
  const total = subtotalComDesconto + frete;

  // Atualização na Interface
  document.getElementById('valor-pedidos').textContent = formatarPreco(subtotal);
  document.getElementById('valor-frete').textContent = formatarPreco(frete);
  document.getElementById('valor-total').textContent = formatarPreco(total);

  // Exibição da linha de Desconto
  const linhaDesconto = document.getElementById('linha-desconto');
  const elValorDesconto = document.getElementById('valor-desconto');
  if (linhaDesconto && elValorDesconto) {
    if (cupomAtivo && subtotal > 0) {
      linhaDesconto.style.display = 'flex';
      elValorDesconto.textContent = `- ${formatarPreco(valorDesconto)}`;
    } else {
      linhaDesconto.style.display = 'none';
    }
  }

  // Atualização da Box de Economia
  const elEconomizou = document.getElementById('valor-economizou');
  const elEconomiaCupons = document.getElementById('valor-economia-cupons');
  if (elEconomizou) elEconomizou.textContent = formatarPreco(valorDesconto);
  if (elEconomiaCupons) elEconomiaCupons.textContent = formatarPreco(valorDesconto);

  const avisoFrete = document.getElementById('aviso-frete');
  if (avisoFrete) {
    avisoFrete.style.display = subtotal >= VALOR_MINIMO_SEM_FRETE || subtotal === 0 ? 'none' : 'block';
  }
}

// APLICAÇÃO DO CUPOM "GON171"
document.getElementById('btn-aplicar-cupom')?.addEventListener('click', () => {
  const input = document.getElementById('input-cupom');
  const msg = document.getElementById('msg-cupom');
  const codigo = input ? input.value.trim().toLowerCase() : '';

  if (codigo === 'gon171') {
    cupomAtivo = true;
    if (msg) {
      msg.textContent = '✓ Cupom GON171 aplicado! (20% de desconto)';
      msg.style.color = '#16a34a';
    }
    renderizarCarrinho();
  } else {
    cupomAtivo = false;
    if (msg) {
      msg.textContent = '❌ Cupom inválido ou expirado.';
      msg.style.color = '#ef4444';
    }
    renderizarCarrinho();
  }
});

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

document.getElementById('esvaziar-carrinho')?.addEventListener('click', (e) => {
  e.preventDefault();
  cupomAtivo = false;
  const msg = document.getElementById('msg-cupom');
  if (msg) msg.textContent = '';
  const input = document.getElementById('input-cupom');
  if (input) input.value = '';
  salvarCarrinho([]);
});

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
  const container = document.getElementById('lista-enderecos-modal');
  const enderecoJSON = localStorage.getItem('mg_endereco_checkout');
  
  if (!enderecoJSON) {
    container.innerHTML = '<p style="color:#ef4444; font-size:14px;">Nenhum endereço selecionado. Feche e clique em "Alterar" para adicionar um endereço.</p>';
    document.getElementById('form-novo-endereco-modal').classList.add('hidden');
    document.getElementById('btn-exibir-form-endereco').classList.add('hidden');
  } else {
    const end = JSON.parse(enderecoJSON);
    container.innerHTML = `
      <label style="display:flex; align-items:center; gap:10px; background:#f8fafc; padding:12px; border:1px solid #cbd5e1; border-radius:4px; margin-bottom:8px; cursor:pointer;">
        <input type="radio" name="endereco_selecionado" value="0" checked>
        <span style="font-size:14px; color:#334155;"><strong>${end.endereco}, ${end.numero}</strong> - ${end.bairro} (CEP: ${end.cep})</span>
      </label>
    `;
    document.getElementById('form-novo-endereco-modal').classList.add('hidden');
    document.getElementById('btn-exibir-form-endereco').classList.add('hidden');
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
  
  localStorage.setItem('mg_usuario', JSON.stringify(usuario));
  document.getElementById('form-novo-endereco-modal').reset();
  carregarEnderecosModal();
});

// Finalização da Compra
document.getElementById('btn-confirmar-pedido-modal')?.addEventListener('click', async () => {
  const usuario = obterUsuarioLogado();
  const carrinho = obterCarrinho();
  const enderecoJSON = localStorage.getItem('mg_endereco_checkout');
  const dataHoraJSON = localStorage.getItem('mg_data_hora_entrega');
  
  if (!enderecoJSON) {
    return alert('Por favor, defina um endereço de entrega antes de finalizar o pedido.');
  }

  const subtotal = carrinho.reduce((soma, item) => soma + item.preco_unitario * item.quantidade, 0);
  const valorDesconto = cupomAtivo ? subtotal * 0.20 : 0;
  const frete = subtotal >= VALOR_MINIMO_SEM_FRETE ? 0 : FRETE_PADRAO;
  const metodoPagamento = document.querySelector('input[name="pagamento"]:checked').value;

  try {
    await apiFetch('/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        cliente: usuario ? usuario.nome : 'Visitante',
        endereco_entrega: JSON.parse(enderecoJSON),
        agendamento: dataHoraJSON ? JSON.parse(dataHoraJSON) : null,
        frete,
        desconto: valorDesconto, // Envia o valor em R$ do desconto para a API
        metodo_pagamento: metodoPagamento,
        itens: carrinho.map((i) => ({
          produto_id: i.produto_id,
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario
        }))
      })
    });
    
    salvarCarrinho([]);
    localStorage.removeItem('mg_data_hora_entrega');
    
    alert(`Pedido finalizado com sucesso! Forma de pagamento: ${metodoPagamento.toUpperCase()}`);
    window.location.href = 'index.html';
  } catch (erro) {
    alert('Erro ao finalizar pedido: ' + erro.message);
  }
});

// --- FUNCIONALIDADES: ENDEREÇO E DATA/HORA ---
function carregarEnderecoSalvo() {
  const enderecoJSON = localStorage.getItem('mg_endereco_checkout');
  const textoEndereco = document.getElementById('texto-endereco-entrega');
  
  if (enderecoJSON && textoEndereco) {
    const end = JSON.parse(enderecoJSON);
    textoEndereco.textContent = `${end.endereco}, ${end.numero} - ${end.bairro}`;
  }
}

document.getElementById('btn-data-hora')?.addEventListener('click', () => {
  document.getElementById('modal-data-hora').classList.remove('hidden');
});

document.getElementById('btn-salvar-data-hora')?.addEventListener('click', () => {
  const data = document.getElementById('input-data-entrega').value;
  const hora = document.getElementById('input-hora-entrega').value;

  if (!data || !hora) {
    alert('Por favor, selecione uma data e um horário.');
    return;
  }

  const dataFormatada = data.split('-').reverse().join('/');
  const textoDataHora = document.getElementById('texto-data-hora');
  textoDataHora.textContent = `📅 Agendado para: ${dataFormatada} às ${hora}`;
  textoDataHora.style.display = 'block';

  localStorage.setItem('mg_data_hora_entrega', JSON.stringify({ data: dataFormatada, hora }));
  document.getElementById('modal-data-hora').classList.add('hidden');
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderizarCarrinho();
  carregarEnderecoSalvo();
});