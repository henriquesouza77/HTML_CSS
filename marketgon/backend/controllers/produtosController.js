const pool = require('../database/db');

// GET /api/produtos  (público - usado na landing page)
async function listarProdutos(req, res) {
  try {
    const { categoria, busca } = req.query;
    let sql = `SELECT p.*, c.nome AS categoria_nome
               FROM produtos p
               LEFT JOIN categorias c ON c.id = p.categoria_id
               WHERE p.ativo = 1`;
    const params = [];

    if (categoria) {
      sql += ' AND c.nome = ?';
      params.push(categoria);
    }
    if (busca) {
      sql += ' AND p.nome LIKE ?';
      params.push(`%${busca}%`);
    }

    sql += ' ORDER BY p.id DESC';

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao listar produtos.' });
  }
}

// GET /api/produtos/:id
async function obterProduto(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });
    return res.json(rows[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao buscar produto.' });
  }
}

// POST /api/produtos (admin)
async function criarProduto(req, res) {
  try {
    const { nome, descricao, preco, preco_promocional, imagem, categoria_id, estoque, ativo } = req.body;
    if (!nome || preco === undefined) {
      return res.status(400).json({ erro: 'Nome e preço são obrigatórios.' });
    }
    const [resultado] = await pool.query(
      `INSERT INTO produtos (nome, descricao, preco, preco_promocional, imagem, categoria_id, estoque, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao || null, preco, preco_promocional || null, imagem || null, categoria_id || null, estoque || 0, ativo === undefined ? 1 : ativo]
    );
    return res.status(201).json({ id: resultado.insertId });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao criar produto.' });
  }
}

// PUT /api/produtos/:id (admin)
async function atualizarProduto(req, res) {
  try {
    const { nome, descricao, preco, preco_promocional, imagem, categoria_id, estoque, ativo } = req.body;
    const [resultado] = await pool.query(
      `UPDATE produtos SET nome=?, descricao=?, preco=?, preco_promocional=?, imagem=?, categoria_id=?, estoque=?, ativo=?
       WHERE id=?`,
      [nome, descricao, preco, preco_promocional, imagem, categoria_id, estoque, ativo, req.params.id]
    );
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });
    return res.json({ mensagem: 'Produto atualizado com sucesso.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar produto.' });
  }
}

// DELETE /api/produtos/:id (admin)
async function excluirProduto(req, res) {
  try {
    const [resultado] = await pool.query('DELETE FROM produtos WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });
    return res.json({ mensagem: 'Produto excluído com sucesso.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao excluir produto.' });
  }
}

module.exports = { listarProdutos, obterProduto, criarProduto, atualizarProduto, excluirProduto };
