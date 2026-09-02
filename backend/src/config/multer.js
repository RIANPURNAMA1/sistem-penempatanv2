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
    // Simpan ke folder id kandidat bila tersedia (route admin/integrasi),
    // bukan id user yang login, agar path_file konsisten dengan kandidat.
    const folderId = req.params?.id || req.user?.id || 'temp';
    const dir = path.join(uploadDir, String(folderId));
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

// ============================================================
// ✅ UPDATE: KONFIGURASI LIMIT BARU
// ============================================================
const FILE_LIMITS = {
  default: 500 * 1024,          // 500KB untuk dokumen standar
  video: 20 * 1024 * 1024,      // 20MB
  foto_full_body: 3 * 1024 * 1024, // 3MB
};

const getFileLimit = (jenis_dokumen) => {
  if (jenis_dokumen === 'video_perkenalan') return FILE_LIMITS.video;
  if (jenis_dokumen === 'foto_full_body') return FILE_LIMITS.foto_full_body;
  return FILE_LIMITS.default;
};

// Buat instance multer secara dinamis berdasarkan limit
const uploaders = {
  default: multer({ storage, fileFilter, limits: { fileSize: FILE_LIMITS.default } }),
  video: multer({ storage, fileFilter, limits: { fileSize: FILE_LIMITS.video } }),
  foto_full_body: multer({ storage, fileFilter, limits: { fileSize: FILE_LIMITS.foto_full_body } }),
};

const uploadDokumenMiddleware = (req, res, next) => {
  // Ambil jenis_dokumen dari query atau header jika body belum ter-parse
  // Karena Multer belum jalan, req.body mungkin masih kosong. 
  // Strategi terbaik: Gunakan uploader default dulu untuk parsing body, atau uploader dinamis.
  
  const jenis = req.query.jenis_dokumen || req.body.jenis_dokumen; 
  
  const uploader = jenis === 'video_perkenalan' ? uploaders.video : 
                   jenis === 'foto_full_body' ? uploaders.foto_full_body : 
                   uploaders.default;
  
  uploader.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const limit = getFileLimit(jenis);
        
        // Logic pesan error: jika di bawah 1MB, tampilkan dalam KB
        let message;
        if (limit < 1024 * 1024) {
            message = `Ukuran file maksimal ${limit / 1024}KB`;
        } else {
            message = `Ukuran file maksimal ${Math.round(limit / 1024 / 1024)}MB`;
        }
        
        return res.status(400).json({ success: false, message });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

module.exports = { uploadDokumenMiddleware, FILE_LIMITS, getFileLimit };