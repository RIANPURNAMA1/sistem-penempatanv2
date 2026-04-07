const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/kandidatController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadDokumenMiddleware, FILE_LIMITS } = require('../config/multer');
const path = require('path');

router.use(authenticate);

// Stats
router.get('/stats', authorize('admin_penempatan', 'admin_cabang'), ctrl.getStats);

// My profile (kandidat)
router.get('/my-profile', authorize('kandidat'), ctrl.getMyProfile);
router.put('/my-profile', authorize('kandidat'), ctrl.updateMyProfile);
router.post('/submit', authorize('kandidat'), ctrl.submitForm);
router.post('/upload-dokumen', authorize('kandidat'), uploadDokumenMiddleware, ctrl.uploadDokumen);

// Admin access
router.get('/', authorize('admin_penempatan', 'admin_cabang'), ctrl.getAll);
router.get('/:id', authorize('admin_penempatan', 'admin_cabang'), ctrl.getById);
router.patch('/:id/status', authorize('admin_penempatan', 'admin_cabang'), ctrl.updateStatus);
router.patch('/:id/progres', authorize('admin_penempatan', 'admin_cabang'), ctrl.updateProgres);

// Get file limits for frontend
router.get('/file-limits', (req, res) => {
  res.json({
    default: `${Math.round(FILE_LIMITS.default / 1024 / 1024)}MB`,
    video: `${Math.round(FILE_LIMITS.video / 1024 / 1024)}MB`,
    foto_full_body: `${Math.round(FILE_LIMITS.foto_full_body / 1024 / 1024)}MB`,
  });
});

module.exports = router;
