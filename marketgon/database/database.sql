-- =========================================================
-- MARKET GON - Banco de Dados
-- Compatível com MySQL/MariaDB (XAMPP)
-- =========================================================

CREATE DATABASE IF NOT EXISTS mercearia_gon
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mercearia_gon;

-- ---------------------------------------------------------
-- TABELA: usuarios (login administrativo e clientes)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  senha_hash    VARCHAR(255) NOT NULL,
  tipo          ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
  cpf           VARCHAR(20)  NULL,
  data_nascimento DATE NULL,
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- TABELA: enderecos
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS enderecos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  cep             VARCHAR(10) NOT NULL,
  destinatario    VARCHAR(150) NOT NULL,
  endereco        VARCHAR(200) NOT NULL,
  numero          VARCHAR(20) NOT NULL,
  bairro          VARCHAR(100) NOT NULL,
  cidade          VARCHAR(100) NOT NULL,
  tipo_local      VARCHAR(100) NULL,
  ponto_referencia VARCHAR(200) NULL,
  criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_endereco_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- TABELA: categorias
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- TABELA: produtos
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS produtos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(150) NOT NULL,
  descricao    TEXT NULL,
  preco        DECIMAL(10,2) NOT NULL,
  preco_promocional DECIMAL(10,2) NULL,
  imagem       VARCHAR(255) NULL,
  categoria_id INT NULL,
  estoque      INT NOT NULL DEFAULT 0,
  ativo        TINYINT(1) NOT NULL DEFAULT 1,
  criado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_produto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- TABELA: pedidos
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NULL,
  cliente     VARCHAR(150) NOT NULL,
  telefone    VARCHAR(30) NULL,
  endereco_id INT NULL,
  frete       DECIMAL(10,2) NOT NULL DEFAULT 0,
  desconto    DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  status      ENUM('Pendente','Pago','Finalizado','Cancelado') NOT NULL DEFAULT 'Pendente',
  data        DATE NOT NULL DEFAULT (CURRENT_DATE),
  criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT fk_pedido_endereco FOREIGN KEY (endereco_id) REFERENCES enderecos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- TABELA: pedido_itens
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedido_itens (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id      INT NOT NULL,
  produto_id     INT NOT NULL,
  quantidade     INT NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal       DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_item_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
) ENGINE=InnoDB;

-- =========================================================
-- USUÁRIO ADMINISTRADOR INICIAL
-- Email: henriqueren.gustavoo@gmail.com
-- Senha: HGK1ll&r  (já armazenada com hash bcrypt abaixo)
-- =========================================================
INSERT INTO usuarios (nome, email, senha_hash, tipo)
VALUES (
  'Henrique',
  'henriqueren.gustavoo@gmail.com',
  '$2b$10$EBqqsT6WEGLncfTBHlpa9OESJHTAnW1G83d9nA61jjaFZ5l6eZ15q',
  'admin'
)
ON DUPLICATE KEY UPDATE nome = nome;

-- ---------------------------------------------------------
-- CATEGORIAS DE EXEMPLO
-- ---------------------------------------------------------
INSERT INTO categorias (nome) VALUES
  ('Marcas'), ('Ofertas'), ('Laticinios'), ('Frutas'), ('Bebidas'), ('Aguas');

-- ---------------------------------------------------------
-- PRODUTOS DE EXEMPLO (refletindo o wireframe)
-- ---------------------------------------------------------
INSERT INTO produtos (nome, descricao, preco, preco_promocional, imagem, categoria_id, estoque, ativo) VALUES
('Arroz 5 KG', 'Arroz branco tipo 1, pacote de 5kg', 20.00, NULL, 'arroz.jpg', 3, 50, 1),
('Banana', 'Banana nanica, preço por KG', 7.00, NULL, 'banana.jpg', 4, 50, 1),
('Sabão em Pó OMD Lavagem Perfeita 1.6kg', 'Sabão em pó para lavagem de roupas', 23.99, 31.99, 'omo.jpg', 1, 40, 1),
('Papel Higiênico Folha Dupla Neutro Neve 30m', 'Pacote com folhas duplas', 43.99, 55.90, 'neve.jpg', 1, 40, 1),
('Filé de Peito de Frango Congelado sem Pele sem Osso 1kg', 'Filé de frango congelado', 19.99, 35.90, 'frango.jpg', 1, 30, 1),
('Chocolate Ao Leite Milka Alpenmilk 90g', 'Chocolate ao leite', 15.33, 22.99, 'milka.jpg', 1, 60, 1),
('Água Mineral Petrópolis 510ml', 'Água mineral sem gás', 1.09, NULL, 'agua1.jpg', 6, 100, 1),
('Água Mineral Crystal Sem Gás 500ml', 'Água mineral, a partir de 12 unid.', 1.99, 2.19, 'agua2.jpg', 6, 100, 1),
('Água Mineral Minalba Com Gás 510ml', 'Água mineral com gás, a partir de 12 unid.', 1.99, 2.19, 'agua3.jpg', 6, 100, 1);

-- ---------------------------------------------------------
-- PEDIDOS DE EXEMPLO
-- ---------------------------------------------------------
INSERT INTO pedidos (cliente, telefone, frete, desconto, valor_total, status, data) VALUES
('Joao', '(11) 90000-0001', 0, 0, 300.00, 'Finalizado', CURDATE()),
('Maria', '(11) 90000-0002', 0, 0, 250.00, 'Pendente', CURDATE()),
('Felipe', '(11) 90000-0003', 0, 0, 500.00, 'Pago', CURDATE());
