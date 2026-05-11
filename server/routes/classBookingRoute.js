const r = require('express').Router();
const c = require('../controllers/classBookingController');
r.get('/classes', c.getAllClasses);
r.get('/members', c.getAllMembers);
r.get('/', c.getAll); r.post('/', c.create);
r.get('/:id', c.getById); r.put('/:id', c.update); r.delete('/:id', c.remove);
module.exports = r;
