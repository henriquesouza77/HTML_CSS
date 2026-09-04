-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 04/09/2026 às 16:38
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `mercearia_gon`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `categorias`
--

INSERT INTO `categorias` (`id`, `nome`) VALUES
(6, 'Aguas'),
(5, 'Bebidas'),
(4, 'Frutas'),
(3, 'Laticinios'),
(1, 'Marcas'),
(2, 'Ofertas');

-- --------------------------------------------------------

--
-- Estrutura para tabela `enderecos`
--

CREATE TABLE `enderecos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cep` varchar(10) NOT NULL,
  `destinatario` varchar(150) NOT NULL,
  `endereco` varchar(200) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `bairro` varchar(100) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `tipo_local` varchar(100) DEFAULT NULL,
  `ponto_referencia` varchar(200) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `cliente` varchar(150) NOT NULL,
  `telefone` varchar(30) DEFAULT NULL,
  `endereco_id` int(11) DEFAULT NULL,
  `frete` decimal(10,2) NOT NULL DEFAULT 0.00,
  `desconto` decimal(10,2) NOT NULL DEFAULT 0.00,
  `valor_total` decimal(10,2) NOT NULL,
  `status` enum('Pendente','Pago','Finalizado','Cancelado') NOT NULL DEFAULT 'Pendente',
  `data` date NOT NULL DEFAULT curdate(),
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuario_id`, `cliente`, `telefone`, `endereco_id`, `frete`, `desconto`, `valor_total`, `status`, `data`, `criado_em`) VALUES
(9, NULL, 'joao almeida de lira', NULL, NULL, 0.00, 0.00, 30.79, 'Pendente', '2026-09-04', '2026-09-04 11:57:46'),
(10, NULL, 'joao almeida de lira', NULL, NULL, 0.00, 17.03, 68.14, 'Pendente', '2026-09-04', '2026-09-04 13:51:26');

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedido_itens`
--

CREATE TABLE `pedido_itens` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 1,
  `preco_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `pedido_itens`
--

INSERT INTO `pedido_itens` (`id`, `pedido_id`, `produto_id`, `quantidade`, `preco_unitario`, `subtotal`) VALUES
(7, 9, 9, 3, 1.99, 5.97),
(8, 9, 6, 1, 15.33, 15.33),
(9, 9, 8, 1, 1.99, 1.99),
(10, 9, 24, 1, 7.50, 7.50),
(11, 10, 23, 1, 7.99, 7.99),
(12, 10, 24, 3, 7.50, 22.50),
(13, 10, 19, 1, 10.90, 10.90),
(14, 10, 14, 1, 19.90, 19.90),
(15, 10, 8, 12, 1.99, 23.88);

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `preco_promocional` decimal(10,2) DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `estoque` int(11) NOT NULL DEFAULT 0,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome`, `descricao`, `preco`, `preco_promocional`, `imagem`, `categoria_id`, `estoque`, `ativo`, `criado_em`) VALUES
(1, 'Arroz 5 KG', 'Arroz branco tipo 1, pacote de 5kg', 20.00, NULL, 'arroz.jpg', 3, 50, 1, '2026-08-27 14:55:30'),
(2, 'Banana', 'Banana nanica, preço por KG', 7.00, NULL, 'banana.jpg', 4, 50, 1, '2026-08-27 14:55:30'),
(3, 'Sabão em Pó OMD Lavagem Perfeita 1.6kg', 'Sabão em pó para lavagem de roupas', 23.99, 31.99, 'omo.jpg', 1, 40, 1, '2026-08-27 14:55:30'),
(4, 'Papel Higiênico Folha Dupla Neutro Neve 30m', 'Pacote com folhas duplas', 43.99, 55.90, 'neve.jpg', 1, 40, 1, '2026-08-27 14:55:30'),
(5, 'Filé de Peito de Frango Congelado sem Pele sem Osso 1kg', 'Filé de frango congelado', 19.99, 35.90, 'frango.jpg', 1, 30, 1, '2026-08-27 14:55:30'),
(6, 'Chocolate Ao Leite Milka Alpenmilk 90g', 'Chocolate ao leite', 15.33, 22.99, 'milka.jpg', 1, 60, 1, '2026-08-27 14:55:30'),
(7, 'Água Mineral Petrópolis 510ml', 'Água mineral sem gás', 1.09, NULL, 'agua1.jpg', 6, 100, 1, '2026-08-27 14:55:30'),
(8, 'Água Mineral Crystal Sem Gás 500ml', 'Água mineral, a partir de 12 unid.', 1.99, 2.19, 'agua2.jpg', 6, 100, 1, '2026-08-27 14:55:30'),
(9, 'Água Mineral Minalba Com Gás 510ml', 'Água mineral com gás, a partir de 12 unid.', 1.99, 2.19, 'agua3.jpg', NULL, 100, 1, '2026-08-27 14:55:30'),
(10, 'leite semidesnatado paulista', NULL, 5.60, 4.80, 'paulista.png', NULL, 756, 1, '2026-08-28 17:52:29'),
(11, 'Água Mineral Petrópolis 510ml', 'Água mineral sem gás 510ml', 1.99, 1.09, 'petropolis.jpg', NULL, 50, 1, '2026-08-28 19:46:31'),
(12, 'Água Mineral Minalba Com Gás 510ml', 'Água mineral com gás 510ml', 2.19, 1.99, 'minalba.jpg', NULL, 40, 1, '2026-08-28 19:46:31'),
(13, 'Sabão em Pó OMO Lavagem Perfeita 800g', 'Sabão em pó para roupas', 18.90, 15.90, 'sabaoempo.jpg', NULL, 30, 1, '2026-08-28 19:46:31'),
(14, 'Papel Higiênico Neve Folha Dupla 12 un', 'Papel higiênico macio', 22.50, 19.90, 'papel.jpg', NULL, 25, 1, '2026-08-28 19:46:31'),
(15, 'Banana Prata KG', 'Banana prata fresca por quilo', 7.99, 5.99, 'banana.jpg', NULL, 100, 1, '2026-08-28 19:46:31'),
(16, 'Arroz Tipo 1 5kg', 'Arroz branco tipo 1 pacote 5kg', 29.90, 24.90, 'arroz.jpg', NULL, 60, 1, '2026-08-28 19:46:31'),
(17, 'Peito de Frango KG', 'Peito de frango resfriado por quilo', 19.90, 16.90, 'frango.jpg', NULL, 40, 1, '2026-08-28 19:46:31'),
(18, 'Leite Integral 1L', 'Leite UHT integral 1 litro', 5.49, 4.89, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', NULL, 80, 1, '2026-08-28 19:46:31'),
(19, 'Queijo Mussarela 200g', 'Fatias de queijo mussarela 200g', 12.90, 10.90, 'https://images.unsplash.com/photo-1552767059-ce182ead8c1b?w=400', NULL, 35, 0, '2026-08-28 19:46:31'),
(20, 'Iogurte Natural 170g', 'Iogurte natural cremoso', 3.50, 2.99, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', NULL, 45, 1, '2026-08-28 19:46:31'),
(21, 'Suco de Laranja Integral 1L', 'Suco natural de laranja sem açúcar', 10.90, 8.90, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400', NULL, 30, 1, '2026-08-28 19:46:31'),
(22, 'Cerveja Pilsen Lata 350ml', 'Cerveja gelada lata 350ml', 4.50, 3.79, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', NULL, 120, 1, '2026-08-28 19:46:31'),
(23, 'Energético 250ml', 'Bebida energética 250ml', 9.90, 7.99, 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400', NULL, 50, 1, '2026-08-28 19:46:31'),
(24, 'Maçã Fuji KG', 'Maçã fresca Fuji por quilo', 9.90, 7.50, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', NULL, 70, 1, '2026-08-28 19:46:31'),
(25, 'queijo mussarela', 'queijo mussarela president', 25.00, NULL, 'mussa.jpg', NULL, 150, 1, '2026-09-04 14:11:46');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `tipo` enum('admin','cliente') NOT NULL DEFAULT 'cliente',
  `cpf` varchar(20) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha_hash`, `tipo`, `cpf`, `data_nascimento`, `criado_em`) VALUES
(1, 'Henrique', 'henriqueren.gustavoo@gmail.com', '$2b$10$EBqqsT6WEGLncfTBHlpa9OESJHTAnW1G83d9nA61jjaFZ5l6eZ15q', 'admin', NULL, NULL, '2026-08-27 14:55:30'),
(2, 'Henrique gustavo', 'henriquerenan.gustavoo@gmail.com', '$2a$10$97wx4H2kbGFXOTGLfNCw4e38td.k97dIANRL49jaaO3oV8eYzv9OG', 'cliente', '46836858846', '2000-03-05', '2026-08-27 17:24:05'),
(3, 'rafael mala', 'henriquerenan.gustaoo@gmail.com', '$2a$10$SRdNWBlii4B1TzjcKUawLek9XhE/qxAmUSiWPLS55mrrO2Hh7dMeq', 'cliente', '46836858846', '2026-08-05', '2026-08-28 19:08:55'),
(4, 'joao almeida de lira', 'joaolira.almeida@gmail.com', '$2a$10$B7Su9tcwhjrbjx490L6iCeG/cXhAOzBx4yRUZ083Xy74t6Kfe8GBC', 'cliente', '26154663803', '2000-03-05', '2026-08-28 19:13:40'),
(5, 'Deise de Souza Gomes', 'Diomar@gmail.com', '$2a$10$pq4Ox0vQmEscxHRWqEuPcunl.ZhGxEnwv4Qe1lkyWT52U2YeRPP7e', 'cliente', '34341548840', '2026-09-25', '2026-09-04 13:54:21');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`);

--
-- Índices de tabela `enderecos`
--
ALTER TABLE `enderecos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_endereco_usuario` (`usuario_id`);

--
-- Índices de tabela `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pedido_usuario` (`usuario_id`),
  ADD KEY `fk_pedido_endereco` (`endereco_id`);

--
-- Índices de tabela `pedido_itens`
--
ALTER TABLE `pedido_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_item_pedido` (`pedido_id`),
  ADD KEY `fk_item_produto` (`produto_id`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_produto_categoria` (`categoria_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `enderecos`
--
ALTER TABLE `enderecos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `pedido_itens`
--
ALTER TABLE `pedido_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `enderecos`
--
ALTER TABLE `enderecos`
  ADD CONSTRAINT `fk_endereco_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_pedido_endereco` FOREIGN KEY (`endereco_id`) REFERENCES `enderecos` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `pedido_itens`
--
ALTER TABLE `pedido_itens`
  ADD CONSTRAINT `fk_item_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_item_produto` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`);

--
-- Restrições para tabelas `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `fk_produto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
