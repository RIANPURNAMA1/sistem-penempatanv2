const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, String(req.user?.id || 'temp'));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const rand = Math.floor(Math.random() * 999999999);
    cb(null, `${Date.now()}-${rand}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|mp4|mov|avi|webm/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null, true);
  else cb(new Error('Format file tidak didukung'));
};

const FILE_LIMITS = {
  default: 2 * 1024 * 1024,      // 2MB
  video: 20 * 1024 * 1024,       // 20MB
  foto_full_body: 3 * 1024 * 1024, // 3MB
};

const getFileLimit = (jenis_dokumen) => {
  if (jenis_dokumen === 'video_perkenalan') return FILE_LIMITS.video;
  if (jenis_dokumen === 'foto_full_body') return FILE_LIMITS.foto_full_body;
  return FILE_LIMITS.default;
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const uploadDokumenMiddleware = (req, res, next) => {
  const jenis_dokumen = req.body.jenis_dokumen;
  const limit = getFileLimit(jenis_dokumen);
  
  const uploader = multer({
    storage,
    fileFilter,
    limits: { fileSize: limit }
  }).single('file');
  
  const uploadHandler = uploader.any();
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const maxMB = Math.round(limit / 1024 / 1024);
        return res.status(400).json({ 
          success: false, 
          message: `Ukuran file maksimal ${maxMB}MB` 
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = { upload, uploadDokumenMiddleware, FILE_LIMITS, getFileLimit };
