const express = require('express');
const router = express.Router();
const { login, cadastro } = require('../controllers/authController');

router.post('/login', login);
router.post('/cadastro', cadastro);

module.exports = router;
