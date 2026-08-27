const pool = require('../database/db');

// GET /api/pedidos (admin)
async function listarPedidos(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');
    return res.json(rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao listar pedidos.' });
  }
}

// GET /api/pedidos/:id (admin ou dono do pedido)
async function obterPedido(req, res) {
  try {
    const [pedidoRows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
    if (pedidoRows.length === 0) return res.status(404).json({ erro: 'Pedido não encontrado.' });

    const [itens] = await pool.query(
      `SELECT pi.*, p.nome AS produto_nome, p.imagem
       FROM pedido_itens pi JOIN produtos p ON p.id = pi.produto_id
       WHERE pi.pedido_id = ?`,
      [req.params.id]
    );

    return res.json({ ...pedidoRows[0], itens });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao buscar pedido.' });
  }
}

// POST /api/pedidos (cria pedido a partir do carrinho)
async function criarPedido(req, res) {
  const conexao = await pool.getConnection();
  try {
    const { cliente, telefone, endereco_id, frete = 0, desconto = 0, itens } = req.body;

    if (!cliente || !Array.isArray(itens) || itens.length === 0) {
      conexao.release();
      return res.status(400).json({ erro: 'Cliente e ao menos um item são obrigatórios.' });
    }

    await conexao.beginTransaction();

    const subtotal = itens.reduce((soma, item) => soma + item.quantidade * item.preco_unitario, 0);
    const valorTotal = subtotal + Number(frete) - Number(desconto);

    const [resultadoPedido] = await conexao.query(
      `INSERT INTO pedidos (usuario_id, cliente, telefone, endereco_id, frete, desconto, valor_total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendente')`,
      [req.usuario ? req.usuario.id : null, cliente, telefone || null, endereco_id || null, frete, desconto, valorTotal]
    );

    const pedidoId = resultadoPedido.insertId;

    for (const item of itens) {
      const subtotalItem = item.quantidade * item.preco_unitario;
      await conexao.query(
        `INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [pedidoId, item.produto_id, item.quantidade, item.preco_unitario, subtotalItem]
      );
    }

    await conexao.commit();
    conexao.release();

    return res.status(201).json({ id: pedidoId, valor_total: valorTotal });
  } catch (erro) {
    await conexao.rollback();
    conexao.release();
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao criar pedido.' });
  }
}

// PUT /api/pedidos/:id (admin - atualizar status)
async function atualizarPedido(req, res) {
  try {
    const { status } = req.body;
    const [resultado] = await pool.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, req.params.id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Pedido não encontrado.' });
    return res.json({ mensagem: 'Pedido atualizado com sucesso.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar pedido.' });
  }
}

module.exports = { listarPedidos, obterPedido, criarPedido, atualizarPedido };
