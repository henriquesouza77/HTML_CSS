const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/auth');
const {
  listarProdutos,
  obterProduto,
  criarProduto,
  atualizarProduto,
  excluirProduto
} = require('../controllers/produtosController');

// Rotas públicas (landing page)
router.get('/', listarProdutos);
router.get('/:id', obterProduto);

// Rotas administrativas (protegidas)
router.post('/', verificarToken, verificarAdmin, criarProduto);
router.put('/:id', verificarToken, verificarAdmin, atualizarProduto);
router.delete('/:id', verificarToken, verificarAdmin, excluirProduto);

module.exports = router;
