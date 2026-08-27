document.getElementById('form-cadastro').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const cpf = document.getElementById('cpf').value.trim();
  const data_nascimento = document.getElementById('data_nascimento').value;
  const mensagemErro = document.getElementById('mensagem-erro');
  mensagemErro.textContent = '';

  try {
    await apiFetch('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha, cpf, data_nascimento })
    });
    window.location.href = 'login.html';
  } catch (erro) {
    mensagemErro.textContent = erro.message;
  }
});
