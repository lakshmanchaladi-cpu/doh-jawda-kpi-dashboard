const express = require('express');
const router = express.Router();
const { initDb } = require('../database/db');

router.get('/quarterly', async (req, res) => {
  const { facility_id, year, quarter } = req.query;
  if (!facility_id || !year || !quarter) return res.status(400).json({ error: 'facility_id, year, and quarter required' });

  try {
    const db = await initDb();
    const facility = await db.get('SELECT * FROM facilities WHERE id = ?', [facility_id]);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    const results = await db.all(`
      SELECT r.kpi_code as Code, d.short_name as Name, d.domain as Domain, 
             r.numerator as Numerator, r.denominator as Denominator, 
             r.value as Value, d.unit as Unit, d.target as Target, r.status as Status
      FROM kpi_results r
      JOIN kpi_definitions d ON r.kpi_code = d.code
      WHERE r.facility_id = ? AND r.year = ? AND r.quarter = ?
      ORDER BY r.kpi_code ASC
    `, [facility_id, year, quarter]);

    const met = results.filter(r => r.Status === 'met').length;
    const near = results.filter(r => r.Status === 'near').length;
    const totalWithTarget = results.filter(r => r.Target !== null && r.Status !== 'no-data').length;
    
    let score = 0;
    if (totalWithTarget > 0) score = ((met + (near * 0.5)) / totalWithTarget) * 100;

    res.json({
      facility, year: parseInt(year), quarter: parseInt(quarter),
      score: score.toFixed(1),
      summary: { met, near, not_met: totalWithTarget - met - near, total: results.length },
      data: results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/comparison', async (req, res) => {
  const { facility_id, year } = req.query;
  if (!facility_id || !year) return res.status(400).json({ error: 'facility_id and year required' });

  try {
    const db = await initDb();
    const data = [];
    const quarters = [1, 2, 3, 4];

    for (const q of quarters) {
      const results = await db.all(`
        SELECT r.kpi_code, r.value, r.status, d.short_name
        FROM kpi_results r
        JOIN kpi_definitions d ON r.kpi_code = d.code
        WHERE r.facility_id = ? AND r.year = ? AND r.quarter = ?
      `, [facility_id, year, q]);

      const met = results.filter(r => r.status === 'met').length;
      const totalWithTarget = results.filter(r => r.status === 'met' || r.status === 'not-met' || r.status === 'near').length;
      const score = totalWithTarget > 0 ? (met / totalWithTarget) * 100 : null; // null if no data

      data.push({
        quarter: q,
        score: score !== null ? score.toFixed(1) : null,
        results: results.reduce((acc, r) => { acc[r.kpi_code] = r; return acc; }, {})
      });
    }

    const defs = await db.all('SELECT code, short_name FROM kpi_definitions ORDER BY code ASC');
    res.json({ definitions: defs, quarters: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/jawda-export', async (req, res) => {
  const { facility_id, year, quarter } = req.query;
  if (!facility_id || !year || !quarter) return res.status(400).send('Missing params');

  try {
    const db = await initDb();
    const facility = await db.get('SELECT * FROM facilities WHERE id = ?', [facility_id]);
    
    const results = await db.all(`
      SELECT r.kpi_code, r.numerator, r.denominator, r.value 
      FROM kpi_results r
        WHERE r.facility_id = ? AND r.year = ? AND r.quarter = ? AND r.denominator > 0 AND r.value IS NOT NULL
      ORDER BY r.kpi_code ASC
    `, [facility_id, year, quarter]);

    let csv = 'Facility_License,Year,Quarter,KPI_Code,Numerator,Denominator,Value\n';
    results.forEach(r => {
      csv += `"${facility.license_no || facility.mf_no}","${year}","${quarter}","${r.kpi_code}","${r.numerator !== null ? r.numerator : ''}","${r.denominator !== null ? r.denominator : ''}","${r.value !== null ? r.value : ''}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="JAWDA_Export_${facility.mf_no}_Q${quarter}_${year}.csv"`);
    res.send(csv);

  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
