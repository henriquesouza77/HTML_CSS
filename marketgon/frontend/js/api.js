// Utilitário simples para chamadas à API do backend
const API_BASE = '/api';

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
