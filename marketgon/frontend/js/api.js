// Utilitário simples para chamadas à API do backend
const API_BASE = '/api';

function urlImagem(imagem) {
  const valor = String(imagem || 'placeholder.svg').trim();
  if (/^(https?:)?\/\//i.test(valor)) return valor;

  const nomeArquivo = valor.replace(/^\/?assets\//i, '').replace(/^\//, '');
  const aliases = {
    'omo.jpg': 'sabaoempo.jpg',
    'neve.jpg': 'papel.jpg',
    'agua1.jpg': 'petropolis.jpg',
    'agua2.jpg': 'minalba.jpg',
    'agua3.jpg': 'minalba.jpg'
  };
  const arquivo = aliases[nomeArquivo.toLowerCase()] || nomeArquivo;
  return `assets/${arquivo.split('/').map(encodeURIComponent).join('/')}`;
}

async function apiFetch(caminho, opcoes = {}) {
  const token = localStorage.getItem('mg_token');
  const headers = { 'Content-Type': 'application/json', ...(opcoes.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resposta = await fetch(`${API_BASE}${caminho}`, { ...opcoes, headers });
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro na requisição.');
  }
  return dados;
}
