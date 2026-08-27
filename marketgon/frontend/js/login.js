document.getElementById('form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const mensagemErro = document.getElementById('mensagem-erro');
  mensagemErro.textContent = '';

  try {
    const dados = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });

    localStorage.setItem('mg_token', dados.token);
    localStorage.setItem('mg_usuario', JSON.stringify(dados.usuario));

    if (dados.usuario.tipo === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'index.html';
    }
  } catch (erro) {
    mensagemErro.textContent = erro.message;
  }
});
