const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifica se existe um token JWT válido (usuário autenticado)
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido. Faça login novamente.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
    req.usuario = usuario;
    next();
  });
}

// Verifica se o usuário autenticado é administrador
function verificarAdmin(req, res, next) {
  if (!req.usuario || req.usuario.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  }
  next();
}

module.exports = { verificarToken, verificarAdmin };
