// ---------- Carrinho (armazenado localmente até o checkout ser enviado ao backend) ----------
function obterCarrinho() {
  return JSON.parse(localStorage.getItem('mg_carrinho') || '[]');
}
function salvarCarrinho(carrinho) {
  localStorage.setItem('mg_carrinho', JSON.stringify(carrinho));
  atualizarBadgeCarrinho();
}
function atualizarBadgeCarrinho() {
  const badge = document.querySelector('.carrinho-badge .qtd');
  if (!badge) return;
  const total = obterCarrinho().reduce((soma, item) => soma + item.quantidade, 0);
  badge.textContent = total;
}
function adicionarAoCarrinho(produto) {
  const carrinho = obterCarrinho();
  const existente = carrinho.find((i) => i.produto_id === produto.id);
  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({
      produto_id: produto.id,
      nome: produto.nome,
      imagem: produto.imagem,
      preco_unitario: Number(produto.preco_promocional || produto.preco),
      quantidade: 1
    });
  }
  salvarCarrinho(carrinho);
}

// ---------- Renderização de produtos ----------
function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function criarCardProduto(produto) {
  const temPromocao = produto.preco_promocional && Number(produto.preco_promocional) < Number(produto.preco);
  const precoExibido = temPromocao ? produto.preco_promocional : produto.preco;

  const card = document.createElement('div');
  card.className = 'card-produto';
  card.innerHTML = `
    <div class="imagem"><img src="assets/${produto.imagem || 'placeholder.svg'}" alt="${produto.nome}" onerror="this.src='assets/placeholder.svg'"></div>
    <div class="info">
      ${temPromocao ? `<span class="preco-antigo">${formatarPreco(produto.preco)}</span>` : ''}
      <span class="nome">${produto.nome}</span>
      <span class="preco-atual">${formatarPreco(precoExibido)}</span>
      ${temPromocao ? `<span class="desconto">${Math.round((1 - precoExibido / produto.preco) * 100)}% OFF</span>` : ''}
    </div>
    <button class="btn-comprar">COMPRAR</button>
  `;
  card.querySelector('.btn-comprar').addEventListener('click', () => adicionarAoCarrinho(produto));
  return card;
}

async function carregarProdutos() {
  const grid = document.getElementById('grid-produtos');
  if (!grid) return;
  try {
    const produtos = await apiFetch('/produtos');
    grid.innerHTML = '';
    produtos.forEach((produto) => grid.appendChild(criarCardProduto(produto)));
  } catch (erro) {
    grid.innerHTML = `<p>Não foi possível carregar os produtos agora.</p>`;
    console.error(erro);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarBadgeCarrinho();
  carregarProdutos();

  // Header: mostra "Entrar" ou o nome do usuário logado (com link para a conta)
  const linkEntrar = document.getElementById('link-entrar');
  const usuario = JSON.parse(localStorage.getItem('mg_usuario') || 'null');
  if (linkEntrar && usuario) {
    if (usuario.tipo === 'admin') {
      linkEntrar.href = 'admin-dashboard.html';
      linkEntrar.textContent = `👤 ${usuario.nome} (admin) ▾`;
    } else {
      linkEntrar.href = 'conta.html';
      linkEntrar.textContent = `👤 ${usuario.nome} ▾`;
    }
  }
});
