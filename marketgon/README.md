# Market Gon — Landing Page + Sistema Administrativo

Projeto de mercearia online: landing page (loja), carrinho/checkout, login e
área administrativa (dashboard + produtos), com backend em Node.js/Express e
banco de dados MySQL/MariaDB via **XAMPP**.

## Estrutura de pastas

```
mercearia/
├── frontend/          # HTML + CSS + JS puro (loja e admin)
│   ├── index.html          # Landing page
│   ├── login.html
│   ├── cadastro.html
│   ├── endereco.html
│   ├── carrinho.html       # Carrinho / checkout
│   ├── admin-dashboard.html
│   ├── admin-produtos.html
│   ├── css/ (style.css, admin.css)
│   ├── js/  (api.js, app.js, login.js, cadastro.js, carrinho.js, admin.js)
│   └── assets/
├── backend/
│   ├── server.js
│   ├── routes/ (auth.js, produtos.js, pedidos.js)
│   ├── controllers/ (authController.js, produtosController.js, pedidosController.js)
│   ├── middleware/auth.js
│   └── database/db.js
├── database/
│   └── database.sql
├── .env.example
├── package.json
└── README.md
```

## 1. Pré-requisitos

- [XAMPP](https://www.apachefriends.org/) instalado (Apache + MySQL/MariaDB)
- [Node.js](https://nodejs.org/) (versão 18 ou superior)

## 2. Configurar o banco de dados (XAMPP)

1. Abra o **XAMPP Control Panel** e inicie os módulos **Apache** e **MySQL**.
2. Acesse o phpMyAdmin em `http://localhost/phpmyadmin`.
3. Clique em **Importar**, selecione o arquivo `database/database.sql` deste
   projeto e clique em **Executar**.
   - Isso cria o banco `mercearia_gon`, todas as tabelas, o usuário
     administrador inicial e alguns produtos/pedidos de exemplo.
   - **Importante (acentos):** o phpMyAdmin normalmente já importa com
     charset `utf8mb4` por padrão. Se nomes de produtos aparecerem com
     caracteres estranhos (ex: "Ãgua" em vez de "Água"), confira nas opções
     de importação do phpMyAdmin se o "Conjunto de caracteres do arquivo"
     está definido como `utf8` ou `utf8mb4` antes de importar.

Credenciais do administrador já cadastradas (senha já vem em hash bcrypt no
banco, não em texto puro):

```
Email: henriqueren.gustavoo@gmail.com
Senha: HGK1ll&r
```

## 3. Configurar o backend

1. Copie o arquivo de variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

2. Abra o `.env` e ajuste conforme seu XAMPP (por padrão, o MySQL do XAMPP usa
   usuário `root` e senha em branco):

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=mercearia_gon
   JWT_SECRET=troque_esta_chave_por_uma_bem_grande_e_aleatoria
   ```

## 5. Iniciar o backend

Se você tem `npm` disponível:

```bash
npm start
```

Se você só tem `node` (sem `npm`), rode o arquivo diretamente — funciona
igual, já que `node_modules/` já vem pronto no projeto:

```bash
node backend/server.js
```

Você verá no terminal:

```
Servidor Market Gon rodando em http://localhost:3000
```

O backend também serve o frontend estático — não é necessário nenhum outro
servidor.

## 6. Acessar o sistema

- **Loja (landing page):** http://localhost:3000/
- **Login:** http://localhost:3000/login.html
- **Cadastro de cliente:** http://localhost:3000/cadastro.html
- **Carrinho:** http://localhost:3000/carrinho.html
- **Área administrativa:** http://localhost:3000/admin-dashboard.html
  - Só é acessível após login com uma conta do tipo `admin`.
  - Se você tentar acessar sem estar logado, o `admin.js` redireciona
    automaticamente para `login.html`.

### Login administrativo

Use as credenciais criadas pelo `database.sql`:

```
Email: henriqueren.gustavoo@gmail.com
Senha: HGK1ll&r
```

## 7. Testar os pedidos

1. Acesse a landing page e clique em **COMPRAR** em um ou mais produtos.
2. Vá até o **Carrinho**, ajuste quantidades e clique em **Ir para pagamento**.
3. Isso envia uma requisição `POST /api/pedidos` para o backend, que grava o
   pedido e seus itens nas tabelas `pedidos` e `pedido_itens` do MySQL.
4. Faça login como administrador e acesse o **Dashboard** — o pedido
   aparecerá na tabela "Pedido Recente" (dados vêm do banco via
   `GET /api/pedidos`, rota protegida por token).

## 8. Rotas da API

```
POST   /api/auth/login          Login (retorna JWT)
POST   /api/auth/cadastro       Cadastro de cliente

GET    /api/produtos            Lista produtos (público)
GET    /api/produtos/:id        Detalhe de um produto
POST   /api/produtos            Cria produto (admin)
PUT    /api/produtos/:id        Atualiza produto (admin)
DELETE /api/produtos/:id        Remove produto (admin)

POST   /api/pedidos             Cria pedido (checkout)
GET    /api/pedidos             Lista pedidos (admin)
GET    /api/pedidos/:id         Detalhe de um pedido (autenticado)
PUT    /api/pedidos/:id         Atualiza status do pedido (admin)
```

Rotas administrativas exigem o header:

```
Authorization: Bearer <token retornado no login>
```

## 9. Segurança implementada

- Senhas armazenadas com hash **bcrypt** (nunca em texto puro).
- Autenticação via **JWT**, verificada no backend (`middleware/auth.js`).
- Rotas de criação/edição/exclusão de produtos e listagem de pedidos
  protegidas e restritas a usuários `admin`.
- Variáveis sensíveis (`DB_PASSWORD`, `JWT_SECRET`) ficam no `.env` (nunca
  versionado — use `.env.example` como modelo).
- Pedidos são persistidos no MySQL, nunca apenas no `localStorage` do
  navegador (o carrinho em si, antes do checkout, usa `localStorage` só como
  rascunho local do cliente).

## 10. Observações sobre o frontend

O frontend foi construído em **HTML + CSS + JavaScript puro**, sem frameworks,
reproduzindo o layout do wireframe (Whimsical) enviado: cabeçalho verde,
menu de categorias, banners, grid de produtos, carrinho/checkout em etapas,
telas de login/cadastro/endereço e as duas páginas administrativas
(Dashboard e Produtos) com barra lateral fixa.

As imagens dos produtos usam a pasta `frontend/assets/` — adicione ali os
arquivos reais (ex: `arroz.jpg`, `banana.jpg`) referenciados na coluna
`imagem` da tabela `produtos`; enquanto não forem adicionadas, um placeholder
genérico é exibido automaticamente.
