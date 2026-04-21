const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nama,
        p.nik,
        p.jenis_kelamin,
        p.agama,
        p.email,
        p.no_wa,
        p.tempat_lahir,
        p.tempat_tanggal_lahir,
        p.alamat,
        p.provinsi,
        p.kab_kota,
        p.kecamatan,
        p.kelurahan,
        p.pendidikan_terakhir,
        p.status,
        p.pernah_ke_jepang,
        p.paspor,
        p.verifikasi,
        p.id_prometric,
        p.password_prometric,
        p.status_jft,
        p.status_ssw,
        p.catatan_admin,
        p.foto,
        p.created_at,
        p.updated_at,
        c.nama_cabang
      FROM pendaftaran_sistem_lama p
      LEFT JOIN cabang c ON c.id = p.cabang_id
      ORDER BY p.id DESC
    `);

    const pangkatIds = rows.map(r => r.id).filter(id => id);
    let dokumenMap = {};
    
    if (pangkatIds.length > 0) {
      const [dokumenRows] = await pool.query(`
        SELECT kandidat_id, jenis_dokumen, MAX(path_file) as path_file, MAX(nama_file) as nama_file 
        FROM kandidat_dokumen 
        WHERE kandidat_id IN (${pangkatIds.map(() => '?').join(',')})
        GROUP BY kandidat_id, jenis_dokumen
      `, pangkatIds);
      
      dokumenRows.forEach((d) => {
        if (!dokumenMap[d.kandidat_id]) dokumenMap[d.kandidat_id] = [];
        dokumenMap[d.kandidat_id].push(d);
      });
    }

     const dataWithDokumen = rows.map((p) => {
       const dokumen = dokumenMap[p.id] || [];
       const dokumenObj = {};
       
       dokumen.forEach((d) => {
         if (d.jenis_dokumen === 'pas_foto') dokumenObj.foto = d.path_file;
         else if (d.jenis_dokumen === 'ktp') dokumenObj.ktp = d.path_file;
         else if (d.jenis_dokumen === 'kk') dokumenObj.kk = d.path_file;
         else if (d.jenis_dokumen === 'ijazah') dokumenObj.ijasah = d.path_file;
         else if (d.jenis_dokumen === 'akte') dokumenObj.akte = d.path_file;
         else if (d.jenis_dokumen === 'sertifikat_jft') dokumenObj.sertifikat_jft = d.path_file;
         else if (d.jenis_dokumen === 'sertifikat_ssw') {
           if (!dokumenObj.sertifikat_ssw) dokumenObj.sertifikat_ssw = [];
           if (!dokumenObj.sertifikat_ssw.includes(d.path_file)) {
             dokumenObj.sertifikat_ssw.push(d.path_file);
           }
         }
         else if (d.jenis_dokumen === 'bukti_pelunasan') dokumenObj.bukti_pelunasan = d.path_file;
         else if (d.jenis_dokumen === 'lainnya') dokumenObj.lainnya = d.path_file;
       });
       
       // Add foto from pendaftaran_sistem_lama table if available
       const finalFoto = p.foto || dokumenObj.foto;
       if (finalFoto) {
         dokumenObj.foto = finalFoto;
       }
       
       return { ...p, dokumen: dokumenObj };
     });

    res.json({ success: true, data: dataWithDokumen });
  } catch (error) {
    console.error('Error fetching pendaftaran:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.*, c.nama_cabang
      FROM pendaftaran_sistem_lama p
      LEFT JOIN cabang c ON p.cabang_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching pendaftaran:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/import', async (req, res) => {
  try {
    res.status(501).json({ success: false, message: 'Fitur import belum tersedia' });
  } catch (error) {
    console.error('Error importing:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;