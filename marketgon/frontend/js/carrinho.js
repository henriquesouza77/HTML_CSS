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
      <img src="assets/${item.imagem || 'placeholder.svg'}" onerror="this.src='assets/placeholder.svg'">
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

document.getElementById('ir-para-pagamento')?.addEventListener('click', async () => {
  const carrinho = obterCarrinho();
  if (carrinho.length === 0) return;

  const usuario = JSON.parse(localStorage.getItem('mg_usuario') || 'null');
  const subtotal = carrinho.reduce((soma, item) => soma + item.preco_unitario * item.quantidade, 0);
  const frete = subtotal >= VALOR_MINIMO_SEM_FRETE ? 0 : FRETE_PADRAO;

  try {
    await apiFetch('/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        cliente: usuario ? usuario.nome : 'Cliente balcão',
        frete,
        desconto: 0,
        itens: carrinho.map((i) => ({
          produto_id: i.produto_id,
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario
        }))
      })
    });
    salvarCarrinho([]);
    alert('Pedido realizado com sucesso!');
    window.location.href = 'index.html';
  } catch (erro) {
    alert('Erro ao finalizar pedido: ' + erro.message);
  }
});

document.addEventListener('DOMContentLoaded', renderizarCarrinho);
