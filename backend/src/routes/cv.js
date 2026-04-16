const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');

router.get('/all', cvController.getAll);
router.get('/:id', cvController.getById);
router.post('/', cvController.create);
router.post('/import', cvController.importData);
router.put('/:id', cvController.update);
router.delete('/:id', cvController.remove);

module.exports = router;
