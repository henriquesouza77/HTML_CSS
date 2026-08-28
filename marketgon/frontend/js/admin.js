// ---------- Proteção das páginas administrativas ----------
(function protegerAdmin() {
  const token = localStorage.getItem('mg_token');
  const usuario = JSON.parse(localStorage.getItem('mg_usuario') || 'null');
  if (!token || !usuario || usuario.tipo !== 'admin') {
    window.location.href = 'login.html';
  }
})();

function sair() {
  localStorage.removeItem('mg_token');
  localStorage.removeItem('mg_usuario');
  window.location.href = 'login.html';
}

function preencherNomeUsuario() {
  const usuario = JSON.parse(localStorage.getItem('mg_usuario') || 'null');
  const alvo = document.getElementById('nome-usuario-admin');
  if (usuario && alvo) alvo.textContent = usuario.nome;
}

function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ---------- FUNÇÃO PARA ALTERAR OU EXCLUIR O STATUS NO BANCO ----------
async function alterarStatusPedido(idPedido, novoStatus) {
  // Se for Finalizado, confirma a ação antes de deletar permanentemente
  if (novoStatus.toLowerCase() === 'finalizado') {
    const confirmou = confirm(`Atenção: Marcar o Pedido #${idPedido} como FINALIZADO irá excluí-lo permanentemente do sistema. Deseja continuar?`);
    if (!confirmou) {
      carregarDashboard(); // Reseta o select para o valor original se cancelar
      return;
    }
  }

  try {
    await apiFetch(`/pedidos/${idPedido}`, {
      method: 'PUT',
      body: JSON.stringify({ status: novoStatus })
    });

    // Recarrega a dashboard para sumir com o pedido excluído e atualizar os totais
    carregarDashboard();
  } catch (erro) {
    alert('Erro ao atualizar o status: ' + erro.message);
  }
}

// ---------- DASHBOARD ----------
async function carregarDashboard() {
  const corpoTabela = document.getElementById('corpo-pedidos-recentes');
  if (!corpoTabela) return;
  try {
    const pedidos = await apiFetch('/pedidos');
    document.getElementById('total-pedidos-hoje').textContent = pedidos.length;
    document.getElementById('total-vendas-hoje').textContent = formatarPreco(
      pedidos.reduce((soma, p) => soma + Number(p.valor_total), 0)
    );

    const opcoesStatus = ['Pendente', 'Pago', 'Em Rota', 'Finalizado'];

    corpoTabela.innerHTML = '';
    pedidos.slice(0, 5).forEach((pedido) => {
      const tr = document.createElement('tr');
      
      // Monta as opções do menu suspenso marcando o status atual como selecionado
      const optionsHtml = opcoesStatus.map(status => `
        <option value="${status}" ${pedido.status?.toLowerCase() === status.toLowerCase() ? 'selected' : ''}>
          ${status}
        </option>
      `).join('');

      tr.innerHTML = `
        <td>#${pedido.id}</td>
        <td>${pedido.cliente}</td>
        <td>
          <select 
            onchange="alterarStatusPedido(${pedido.id}, this.value)" 
            style="padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer; font-size: 13px;"
          >
            ${optionsHtml}
          </select>
        </td>
        <td>${formatarPreco(pedido.valor_total)}</td>
      `;
      corpoTabela.appendChild(tr);
    });

    const produtos = await apiFetch('/produtos');
    const baixoEstoque = produtos.filter((p) => p.estoque <= 10).length;
    document.getElementById('total-produtos-baixo').textContent = baixoEstoque;
  } catch (erro) {
    console.error(erro);
  }
}

// ---------- PRODUTOS (ADMIN) ----------
let produtoEmEdicaoId = null;

function abrirModalProduto(produto = null) {
  produtoEmEdicaoId = produto ? produto.id : null;
  document.getElementById('titulo-modal-produto').textContent = produto ? 'Editar produto' : 'Adicionar novo produto';
  document.getElementById('campo-nome').value = produto ? produto.nome : '';
  document.getElementById('campo-preco').value = produto ? produto.preco : '';
  document.getElementById('campo-preco-promo').value = produto && produto.preco_promocional ? produto.preco_promocional : '';
  document.getElementById('campo-estoque').value = produto ? produto.estoque : '';
  document.getElementById('campo-imagem').value = produto ? (produto.imagem || '') : '';
  document.getElementById('campo-descricao').value = produto ? (produto.descricao || '') : '';
  document.getElementById('modal-produto').classList.add('aberto');
}

function fecharModalProduto() {
  document.getElementById('modal-produto').classList.remove('aberto');
}

function criarCardProdutoAdmin(produto) {
  const card = document.createElement('div');
  card.className = 'card-produto-admin';
  card.innerHTML = `
    <div class="imagem"><img src="${urlImagem(produto.imagem)}" alt="${produto.nome}" onerror="this.onerror=null; this.src=urlImagem('placeholder.svg')"></div>
    <div class="nome">${produto.nome}</div>
    <div class="preco">${formatarPreco(produto.preco_promocional || produto.preco)}${produto.categoria_nome ? ' / ' + produto.categoria_nome : ''}</div>
    <div class="estoque">${produto.estoque} disponíveis</div>
    <div class="acoes-produto">
      <button class="btn-editar">Editar</button>
      <button class="btn-excluir">Excluir</button>
    </div>
  `;
  card.querySelector('.btn-editar').addEventListener('click', () => abrirModalProduto(produto));
  card.querySelector('.btn-excluir').addEventListener('click', () => excluirProduto(produto.id));
  return card;
}

async function carregarProdutosAdmin(termo = '') {
  const grid = document.getElementById('grid-produtos-admin');
  if (!grid) return;
  try {
    const produtos = await apiFetch(`/produtos${termo ? '?busca=' + encodeURIComponent(termo) : ''}`);
    grid.innerHTML = '';
    produtos.forEach((produto) => grid.appendChild(criarCardProdutoAdmin(produto)));
  } catch (erro) {
    console.error(erro);
  }
}

async function excluirProduto(id) {
  if (!confirm('Deseja realmente excluir este produto?')) return;
  try {
    await apiFetch(`/produtos/${id}`, { method: 'DELETE' });
    carregarProdutosAdmin();
  } catch (erro) {
    alert(erro.message);
  }
}

document.getElementById('form-produto')?.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const corpo = {
    nome: document.getElementById('campo-nome').value,
    preco: parseFloat(document.getElementById('campo-preco').value),
    preco_promocional: document.getElementById('campo-preco-promo').value
      ? parseFloat(document.getElementById('campo-preco-promo').value)
      : null,
    estoque: parseInt(document.getElementById('campo-estoque').value, 10) || 0,
    imagem: document.getElementById('campo-imagem').value,
    descricao: document.getElementById('campo-descricao').value,
    ativo: 1
  };

  try {
    if (produtoEmEdicaoId) {
      await apiFetch(`/produtos/${produtoEmEdicaoId}`, { method: 'PUT', body: JSON.stringify(corpo) });
    } else {
      await apiFetch('/produtos', { method: 'POST', body: JSON.stringify(corpo) });
    }
    fecharModalProduto();
    carregarProdutosAdmin();
  } catch (erro) {
    alert(erro.message);
  }
});

document.getElementById('campo-busca-produto')?.addEventListener('input', (evento) => {
  carregarProdutosAdmin(evento.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
  preencherNomeUsuario();
  carregarDashboard();
  carregarProdutosAdmin();
});