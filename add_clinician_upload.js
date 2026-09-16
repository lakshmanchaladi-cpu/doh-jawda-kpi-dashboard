const fs = require('fs');
let code = fs.readFileSync('routes/settings.js', 'utf8');

const uploadCode = `
const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ dest: 'uploads/' });

router.post('/upload-clinicians', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const db = await initDb();
    const filePath = req.file.path;
    const wb = xlsx.readFile(filePath);
    
    // 1. Extract Version from Report Info
    let versionStr = 'Unknown';
    if (wb.SheetNames.includes('Report Info')) {
      const infoSheet = wb.Sheets['Report Info'];
      const infoData = xlsx.utils.sheet_to_json(infoSheet, { header: 1 });
      const versionRow = infoData.find(row => row[0] === 'Generated On' || row[0] === 'Version');
      if (versionRow && versionRow[1]) {
        versionStr = String(versionRow[1]);
      }
    }
    
    // 2. Parse Clinician Data
    if (!wb.SheetNames.includes('Clinician Data')) {
      throw new Error("Missing 'Clinician Data' sheet");
    }
    const dataSheet = wb.Sheets['Clinician Data'];
    // The actual headers are on row 4 (index 3)
    const rawData = xlsx.utils.sheet_to_json(dataSheet, { header: 1 });
    const headers = rawData[3] || [];
    
    // Find column indexes
    const idxLic = headers.findIndex(h => String(h).includes('Clinician License'));
    const idxName = headers.findIndex(h => String(h).includes('Clinician Name'));
    const idxMajor = headers.findIndex(h => String(h).includes('Major'));
    const idxProf = headers.findIndex(h => String(h).includes('Profession'));
    const idxCat = headers.findIndex(h => String(h).includes('Category'));
    const idxFacName = headers.findIndex(h => String(h).includes('Facility Name'));
    const idxFacLic = headers.findIndex(h => String(h).includes('Facility License'));
    
    if (idxLic === -1 || idxFacLic === -1) {
      throw new Error("Could not find required columns in Clinician Data sheet");
    }
    
    // We will clear existing data
    await db.run('DELETE FROM clinician_licenses');
    
    const stmt = await db.prepare('INSERT INTO clinician_licenses (license_number, clinician_name, major, profession, category, facility_name, facility_mf_no) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    let count = 0;
    for (let i = 4; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !row[idxLic]) continue; // skip empty rows
      
      const lic = String(row[idxLic]).trim();
      const name = row[idxName] ? String(row[idxName]).trim() : '';
      const major = row[idxMajor] ? String(row[idxMajor]).trim() : '';
      const prof = row[idxProf] ? String(row[idxProf]).trim() : '';
      const cat = row[idxCat] ? String(row[idxCat]).trim() : '';
      const facName = row[idxFacName] ? String(row[idxFacName]).trim() : '';
      const facLic = row[idxFacLic] ? String(row[idxFacLic]).trim() : '';
      
      try {
        await stmt.run(lic, name, major, prof, cat, facName, facLic);
        count++;
      } catch (e) {
        // ignore duplicate primary keys
      }
    }
    await stmt.finalize();
    
    // Save version in app settings (add column if missing)
    try {
      await db.run('ALTER TABLE app_settings ADD COLUMN clinician_dict_version TEXT');
    } catch(e) {} // ignore if exists
    await db.run('UPDATE app_settings SET clinician_dict_version = ? WHERE id = 1', [versionStr]);
    
    fs.unlinkSync(filePath);
    res.json({ success: true, count, version: versionStr });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
});
`;

code = code.replace("module.exports = router;", uploadCode + "\n\nmodule.exports = router;");
fs.writeFileSync('routes/settings.js', code);
