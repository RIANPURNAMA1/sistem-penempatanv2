const pool = require('../config/database');

let screeningInterval = null;

const parseTimeToMs = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
};

const isTimeInRange = (currentTime, startTime, endTime) => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const current = currentTime.getHours() * 60 + currentTime.getMinutes();
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  return current >= start && current <= end;
};

const performBatchScreening = async () => {
  console.log(`[ScreeningScheduler] Running scheduled screening at ${new Date().toISOString()}`);
  try {
    const [kandidats] = await pool.query(
      `SELECT kp.id, kp.nama_romaji, kp.status_formulir 
       FROM kandidat_profil kp 
       WHERE kp.status_formulir IN ('draft', 'submitted', 'reviewed')`
    );

    let approved = 0;
    let skipped = 0;

    for (const kandidat of kandidats) {
      const [dokumen] = await pool.query(
        'SELECT jenis_dokumen FROM kandidat_dokumen WHERE kandidat_id = ?',
        [kandidat.id]
      );

      const hasJft = dokumen.some(d => d.jenis_dokumen === 'sertifikat_jft');
      const hasSsw = dokumen.some(d => d.jenis_dokumen && d.jenis_dokumen.startsWith('ssw_'));

      if (hasJft || hasSsw) {
        let message = 'Auto-approved';
        if (hasJft && hasSsw) message = 'Sertifikat JFT & SSW lengkap';
        else if (hasJft) message = 'Sertifikat JFT lengkap';
        else if (hasSsw) message = 'Sertifikat SSW lengkap';

        await pool.query(
          'UPDATE kandidat_profil SET status_formulir = "approved" WHERE id = ?',
          [kandidat.id]
        );
        
        approved++;
        console.log(`[ScreeningScheduler] Approved: ${kandidat.nama_romaji} - ${message}`);
      } else {
        skipped++;
      }
    }

    console.log(`[ScreeningScheduler] Completed: ${approved} approved, ${skipped} skipped`);
    return { approved, skipped };
  } catch (err) {
    console.error('[ScreeningScheduler] Error:', err.message);
    throw err;
  }
};

const loadAndScheduleScreening = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT setting_value FROM sys_settings WHERE setting_key = 'auto_screening_enabled'"
    );
    const enabled = rows.length > 0 ? rows[0].setting_value === 'true' : false;
    
    const [timeRows] = await pool.query(
      "SELECT setting_value FROM sys_settings WHERE setting_key = 'auto_screening_time'"
    );
    const timeStr = timeRows.length > 0 ? timeRows[0].setting_value : '08:00';

    const [rangeRows] = await pool.query(
      "SELECT setting_value FROM sys_settings WHERE setting_key = 'auto_screening_range_start'"
    );
    const rangeStart = rangeRows.length > 0 ? rangeRows[0].setting_value : '06:00';
    
    const [rangeEndRows] = await pool.query(
      "SELECT setting_value FROM sys_settings WHERE setting_key = 'auto_screening_range_end'"
    );
    const rangeEnd = rangeEndRows.length > 0 ? rangeEndRows[0].setting_value : '18:00';

    if (screeningInterval) {
      clearTimeout(screeningInterval);
      screeningInterval = null;
    }

    if (enabled) {
      const now = new Date();
      if (isTimeInRange(now, rangeStart, rangeEnd)) {
        const delay = parseTimeToMs(timeStr);
        console.log(`[ScreeningScheduler] Scheduled screening enabled. Next run at ${timeStr}, active range: ${rangeStart}-${rangeEnd}`);
        screeningInterval = setTimeout(() => {
          performBatchScreening();
          loadAndScheduleScreening();
        }, delay);
      } else {
        console.log(`[ScreeningScheduler] Outside active range (${rangeStart}-${rangeEnd}). Scheduling for next window...`);
        const delay = parseTimeToMs(rangeStart);
        screeningInterval = setTimeout(() => {
          loadAndScheduleScreening();
        }, delay);
      }
    } else {
      console.log('[ScreeningScheduler] Screening scheduler disabled');
    }
  } catch (err) {
    console.error('[ScreeningScheduler] Load error:', err.message);
  }
};

const initScreeningScheduler = () => {
  console.log('[ScreeningScheduler] Initializing...');
  loadAndScheduleScreening();
  setInterval(loadAndScheduleScreening, 60000);
};

const refreshScreeningScheduler = () => {
  loadAndScheduleScreening();
};

module.exports = { initScreeningScheduler, refreshScreeningScheduler };