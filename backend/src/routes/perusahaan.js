const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/perusahaanController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin_penempatan'), ctrl.create);
router.put('/:id', authorize('admin_penempatan'), ctrl.update);
router.delete('/:id', authorize('admin_penempatan'), ctrl.remove);

module.exports = router;
