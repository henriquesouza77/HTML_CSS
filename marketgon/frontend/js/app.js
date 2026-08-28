// Variáveis globais do Modal
let produtoModalAtual = null;
let quantidadeModalAtual = 1;

// ---------- Carrinho ----------
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

function adicionarAoCarrinho(produto, quantidade = 1) {
  const carrinho = obterCarrinho();
  const existente = carrinho.find((i) => i.produto_id === produto.id);
  const temPromocao = produto.preco_promocional && Number(produto.preco_promocional) < Number(produto.preco);
  const precoUnitario = Number(temPromocao ? produto.preco_promocional : produto.preco);

  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinho.push({
      produto_id: produto.id,
      nome: produto.nome,
      imagem: produto.imagem,
      preco_unitario: precoUnitario,
      quantidade: quantidade
    });
  }
  salvarCarrinho(carrinho);
  mostrarToast(`${quantidade}x "${produto.nome}" adicionado!`);
}

// ---------- Toast Notificação ----------
function mostrarToast(mensagem) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = mensagem;
  toast.classList.remove('hidden');
  toast.classList.add('visible');

  setTimeout(() => {
    toast.classList.remove('visible');
    toast.classList.add('hidden');
  }, 2500);
}

// ---------- Modal de Produto ----------
function abrirModalProduto(produto) {
  produtoModalAtual = produto;
  quantidadeModalAtual = 1;

  const temPromocao = produto.preco_promocional && Number(produto.preco_promocional) < Number(produto.preco);
  const precoExibido = temPromocao ? produto.preco_promocional : produto.preco;

  document.getElementById('modal-img').src = urlImagem(produto.imagem);
  document.getElementById('modal-nome').textContent = produto.nome;
  document.getElementById('modal-preco-atual').textContent = formatarPreco(precoExibido);

  const elAntigo = document.getElementById('modal-preco-antigo');
  const elDesconto = document.getElementById('modal-desconto');

  if (temPromocao) {
    elAntigo.textContent = formatarPreco(produto.preco);
    elAntigo.style.display = 'inline';
    elDesconto.textContent = `${Math.round((1 - precoExibido / produto.preco) * 100)}% OFF`;
    elDesconto.style.display = 'inline-block';
  } else {
    elAntigo.style.display = 'none';
    elDesconto.style.display = 'none';
  }

  document.getElementById('qtd-modal').textContent = quantidadeModalAtual;

  const modal = document.getElementById('modal-produto');
  modal.classList.remove('hidden');
}

function fecharModalProduto() {
  const modal = document.getElementById('modal-produto');
  modal.classList.add('hidden');
  produtoModalAtual = null;
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
    <div class="imagem"><img src="${urlImagem(produto.imagem)}" alt="${produto.nome}" onerror="this.onerror=null; this.src=urlImagem('placeholder.svg')"></div>
    <div class="info">
      ${temPromocao ? `<span class="preco-antigo">${formatarPreco(produto.preco)}</span>` : ''}
      <span class="nome">${produto.nome}</span>
      <span class="preco-atual">${formatarPreco(precoExibido)}</span>
      ${temPromocao ? `<span class="desconto">${Math.round((1 - precoExibido / produto.preco) * 100)}% OFF</span>` : ''}
    </div>
    <button class="btn-comprar">VER DETALHES</button>
  `;

  // Clique no card ou botão abre o modal
  card.addEventListener('click', () => abrirModalProduto(produto));
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

// ---------- Event Listeners ----------
document.addEventListener('DOMContentLoaded', () => {
  atualizarBadgeCarrinho();
  carregarProdutos();

  // Controles do Modal de Produto (Mantenha os existentes)
  document.getElementById('btn-fechar-modal')?.addEventListener('click', fecharModalProduto);
  document.getElementById('modal-produto')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-produto') fecharModalProduto();
  });
  document.getElementById('btn-qtd-mais')?.addEventListener('click', () => {
    quantidadeModalAtual++;
    document.getElementById('qtd-modal').textContent = quantidadeModalAtual;
  });
  document.getElementById('btn-qtd-menos')?.addEventListener('click', () => {
    if (quantidadeModalAtual > 1) {
      quantidadeModalAtual--;
      document.getElementById('qtd-modal').textContent = quantidadeModalAtual;
    }
  });
  document.getElementById('btn-modal-adicionar')?.addEventListener('click', () => {
    if (produtoModalAtual) {
      adicionarAoCarrinho(produtoModalAtual, quantidadeModalAtual);
      fecharModalProduto();
    }
  });

  // Controle de Sessão no Header
  const usuario = obterUsuarioLogado();
  const linkEntrar = document.getElementById('link-entrar');
  const linkCadastrar = document.querySelector('a[href="cadastro.html"]');
  
  if (usuario) {
    if (linkCadastrar) linkCadastrar.style.display = 'none';
    if (linkEntrar) {
      const painel = usuario.tipo === 'admin' ? 'admin-dashboard.html' : 'conta.html';
      const tagAdmin = usuario.tipo === 'admin' ? ' (admin)' : '';
      linkEntrar.href = painel;
      linkEntrar.innerHTML = `👤 ${usuario.nome}${tagAdmin} ▾ <a href="#" onclick="efetuarLogout(); return false;" style="font-size:12px; color:#ff6b2b; margin-left:6px; text-decoration:underline;">(Sair)</a>`;
    }
  }

  // Trava do Carrinho para usuários deslogados
  const btnCarrinhoHeader = document.querySelector('.carrinho-badge');
  if (btnCarrinhoHeader) {
    btnCarrinhoHeader.addEventListener('click', (e) => {
      if (!usuario) {
        e.preventDefault();
        document.getElementById('modal-login-requerido').classList.remove('hidden');
      }
    });
  }
});