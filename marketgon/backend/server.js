const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const produtosRoutes = require('./routes/produtos');
const pedidosRoutes = require('./routes/pedidos');

const app = express();

app.use(cors());
app.use(express.json());

// --- API ---
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);

// --- Frontend estático ---
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Rota curinga simples: qualquer rota não-API que não seja um arquivo existente
// cai na landing page (o controle de acesso ao admin é feito no próprio admin.js)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) next();
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Market Gon rodando em http://localhost:${PORT}`);
});
