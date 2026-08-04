const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/integrationController');
const authApiKey = require('../middleware/authApiKey');
const { uploadDokumenMiddleware } = require('../config/multer');
const { authenticate, authorize } = require('../middleware/auth');

// Set req.user agar file tersimpan di folder id kandidat
const setKandidatUser = (req, res, next) => {
  req.user = { id: req.params.id };
  next();
};

// Endpoints publik untuk sistem lain (via API key)
router.get('/kandidat', authApiKey, ctrl.getKandidat);
router.get('/kandidat/:id', authApiKey, ctrl.getKandidatById);
router.post('/kandidat', authApiKey, ctrl.createKandidat);
router.put('/kandidat/:id', authApiKey, ctrl.updateKandidatById);
router.post('/kandidat/:id/upload-dokumen', authApiKey, setKandidatUser, uploadDokumenMiddleware, ctrl.uploadDokumen);
router.delete('/kandidat/:id/dokumen', authApiKey, ctrl.deleteDokumen);

// Manajemen API key (khusus admin)
router.use('/api-clients', authenticate, authorize('admin_penempatan'));
router.get('/api-clients', ctrl.getApiClients);
router.post('/api-clients', ctrl.createApiClient);
router.put('/api-clients/:id', ctrl.updateApiClient);
router.post('/api-clients/:id/regenerate', ctrl.regenerateApiKey);
router.delete('/api-clients/:id', ctrl.deleteApiClient);

module.exports = router;
