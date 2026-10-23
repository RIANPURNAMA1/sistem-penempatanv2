const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cvTemplateController = require('../controllers/cvTemplateController');
const { authenticate, authorize } = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'cv-templates');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.xlsx';
    cb(null, `tpl-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
             file.originalname.toLowerCase().endsWith('.xlsx');
  if (!ok) return cb(new Error('Hanya file .XLSX yang diperbolehkan'));
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authenticate);
router.use(authorize('admin_penempatan', 'admin_cabang'));

// Rute statis & khusus harus didahulukan agar tidak tertangkap oleh "/:id".
router.get('/catalog', cvTemplateController.catalog);
router.get('/bahasa', cvTemplateController.bahasa);
router.get('/terjemahan/:kandidatId', cvTemplateController.getTerjemahan);
router.put('/terjemahan/:kandidatId', cvTemplateController.simpanTerjemahanManual);
router.post('/terjemahan/:kandidatId/auto', cvTemplateController.terjemahkanOtomatis);
router.get('/sample-template', cvTemplateController.sampleTemplate);
router.get('/generate/history/:kandidatId', cvTemplateController.history);
router.get('/generated/download/:id', cvTemplateController.downloadGenerated);
router.post('/upload', upload.single('template'), cvTemplateController.upload);
router.post('/generate/preview/:kandidatId', cvTemplateController.preview);
router.post('/generate/batch', cvTemplateController.generateBatch);
router.post('/generate/:kandidatId', cvTemplateController.generate);

router.get('/', cvTemplateController.getAll);
router.get('/:id', cvTemplateController.getById);
router.get('/:id/placeholders', cvTemplateController.previewPlaceholders);
router.get('/:id/download', cvTemplateController.downloadTemplate);
router.put('/:id/aktifkan', cvTemplateController.setActive);
router.delete('/:id', cvTemplateController.remove);

module.exports = router;
