const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, String(req.user?.id || 'temp'));
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|mp4|mov|avi|webm/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null, true);
  else cb(new Error('Format file tidak didukung'));
};

const FILE_LIMITS = {
  default: 2 * 1024 * 1024,
  video: 20 * 1024 * 1024,
  foto_full_body: 3 * 1024 * 1024,
};

const getFileLimit = (jenis_dokumen) => {
  if (jenis_dokumen === 'video_perkenalan') return FILE_LIMITS.video;
  if (jenis_dokumen === 'foto_full_body') return FILE_LIMITS.foto_full_body;
  return FILE_LIMITS.default;
};

const uploaders = {
  default: multer({ storage, fileFilter, limits: { fileSize: FILE_LIMITS.default } }),
  video: multer({ storage, fileFilter, limits: { fileSize: FILE_LIMITS.video } }),
  foto_full_body: multer({ storage, fileFilter, limits: { fileSize: FILE_LIMITS.foto_full_body } }),
};

const uploadDokumenMiddleware = (req, res, next) => {
  const jenis = req.body.jenis_dokumen;
  const uploader = jenis === 'video_perkenalan' ? uploaders.video : 
                   jenis === 'foto_full_body' ? uploaders.foto_full_body : 
                   uploaders.default;
  
  uploader.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const limit = getFileLimit(jenis);
        const maxMB = Math.round(limit / 1024 / 1024);
        return res.status(400).json({ success: false, message: `Ukuran file maksimal ${maxMB}MB` });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

module.exports = { uploadDokumenMiddleware, FILE_LIMITS, getFileLimit };
