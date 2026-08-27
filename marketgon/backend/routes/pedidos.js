const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/auth');
const {
  listarPedidos,
  obterPedido,
  criarPedido,
  atualizarPedido
} = require('../controllers/pedidosController');

// Criar pedido: pode ser feito por cliente logado ou visitante (checkout)
router.post('/', criarPedido);

// Listagem completa: apenas admin
router.get('/', verificarToken, verificarAdmin, listarPedidos);
router.get('/:id', verificarToken, obterPedido);
router.put('/:id', verificarToken, verificarAdmin, atualizarPedido);

module.exports = router;
