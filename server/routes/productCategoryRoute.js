const r = require('express').Router();
const c = require('../controllers/productCategoryController');
r.get('/', c.getAll); r.post('/', c.create);
r.get('/:id', c.getById); r.put('/:id', c.update); r.delete('/:id', c.remove);
module.exports = r;
