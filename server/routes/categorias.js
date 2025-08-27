const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, run, get } = require('../database');

const router = express.Router();

// GET /api/categorias - Listar todas as categorias
router.get('/', async (req, res) => {
  try {
    const categorias = await query(`
      SELECT id, nome, descricao, created_at, updated_at
      FROM categorias 
      ORDER BY nome
    `);
    
    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/categorias/:id - Buscar categoria por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoria = await get(`
      SELECT id, nome, descricao, created_at, updated_at
      FROM categorias 
      WHERE id = ?
    `, [id]);
    
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    
    res.json(categoria);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/categorias - Criar nova categoria
router.post('/', [
  body('nome').trim().isLength({ min: 1 }).withMessage('Nome é obrigatório'),
  body('descricao').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { nome, descricao } = req.body;
    
    // Verificar se já existe categoria com o mesmo nome
    const existingCategoria = await get(
      'SELECT id FROM categorias WHERE nome = ?',
      [nome]
    );
    
    if (existingCategoria) {
      return res.status(400).json({ message: 'Já existe uma categoria com este nome' });
    }
    
    const result = await run(`
      INSERT INTO categorias (nome, descricao, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `, [nome, descricao]);
    
    const novaCategoria = await get(
      'SELECT * FROM categorias WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json(novaCategoria);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// PUT /api/categorias/:id - Atualizar categoria
router.put('/:id', [
  body('nome').trim().isLength({ min: 1 }).withMessage('Nome é obrigatório'),
  body('descricao').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { nome, descricao } = req.body;
    
    // Verificar se a categoria existe
    const existingCategoria = await get(
      'SELECT id FROM categorias WHERE id = ?',
      [id]
    );
    
    if (!existingCategoria) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    
    // Verificar se já existe outra categoria com o mesmo nome
    const duplicateCategoria = await get(
      'SELECT id FROM categorias WHERE nome = ? AND id != ?',
      [nome, id]
    );
    
    if (duplicateCategoria) {
      return res.status(400).json({ message: 'Já existe uma categoria com este nome' });
    }
    
    await run(`
      UPDATE categorias 
      SET nome = ?, descricao = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [nome, descricao, id]);
    
    const categoriaAtualizada = await get(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );
    
    res.json(categoriaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// DELETE /api/categorias/:id - Excluir categoria
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a categoria existe
    const existingCategoria = await db.get(
      'SELECT id FROM categorias WHERE id = ?',
      [id]
    );
    
    if (!existingCategoria) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    
    // Verificar se há produtos usando esta categoria
    const produtosComCategoria = await get(
      'SELECT COUNT(*) as count FROM produtos WHERE categoria = (SELECT nome FROM categorias WHERE id = ?)',
      [id]
    );
    
    if (produtosComCategoria.count > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir categoria que possui produtos associados' 
      });
    }
    
    await run('DELETE FROM categorias WHERE id = ?', [id]);
    
    res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/categorias/:id/produtos - Listar produtos de uma categoria
router.get('/:id/produtos', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar nome da categoria
    const categoria = await get(
      'SELECT nome FROM categorias WHERE id = ?',
      [id]
    );
    
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    
    // Buscar produtos da categoria
    const produtos = await query(`
      SELECT id, nome, preco, quantidade, descricao, estoque_minimo, created_at, updated_at
      FROM produtos 
      WHERE categoria = ?
      ORDER BY nome
    `, [categoria.nome]);
    
    res.json({
      categoria: categoria.nome,
      produtos: produtos,
      total: produtos.length
    });
  } catch (error) {
    console.error('Erro ao buscar produtos da categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
