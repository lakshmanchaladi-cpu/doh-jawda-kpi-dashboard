const { initDb } = require('./database/db');

const updates = [
  { code: '83036', desc: 'Hemoglobin; glycosylated (A1C)' },
  { code: '92134', desc: 'Scanning computerized ophthalmic diagnostic imaging, retina' },
  { code: '92132', desc: 'Scanning computerized ophthalmic diagnostic imaging, anterior segment' },
  { code: '92133', desc: 'Scanning computerized ophthalmic diagnostic imaging, optic nerve' },
  { code: '92136', desc: 'Ophthalmic biometry by partial coherence interferometry' },
  { code: '92242', desc: 'Fluorescein angiography and indocyanine-green angiography' },
  { code: '92265', desc: 'Needle oculoelectromyography' },
  { code: '92270', desc: 'Electro-oculography with interpretation and report' },
  { code: '92283', desc: 'Color vision examination' },
  { code: '92284', desc: 'Dark adaptation examination' },
  { code: '92285', desc: 'External ocular photography' },
  { code: '92230', desc: 'Fluorescein angioscopy with interpretation and report' },
  { code: '92235', desc: 'Fluorescein angiography with interpretation and report' },
  { code: '92260', desc: 'Ophthalmodynamometry' },
  { code: '92499', desc: 'Unlisted ophthalmological service or procedure' },
  { code: '95060', desc: 'Ophthalmic mucous membrane tests' },
  { code: '92240', desc: 'Indocyanine-green angiography' },
  { code: '92250', desc: 'Fundus photography with interpretation and report' },
  { code: '92227', desc: 'Remote imaging for detection of retinal disease' },
  { code: '92228', desc: 'Remote imaging for management of active retinal disease' },
  { code: '92002', desc: 'Ophthalmological services, intermediate, new patient' },
  { code: '92004', desc: 'Comprehensive ophthalmological evaluation, new patient' },
  { code: '92012', desc: 'Intermediate ophthalmological evaluation, established patient' },
  { code: '92014', desc: 'Comprehensive ophthalmological evaluation, established patient' },
  { code: '92018', desc: 'Ophthalmological examination under general anesthesia, complete' },
  { code: '92019', desc: 'Ophthalmological examination under general anesthesia, limited' },
  { code: '82043', desc: 'Microalbumin, quantitative' },
  { code: '82570', desc: 'Creatinine; other source' },
  { code: '82042', desc: 'Albumin; urine or other source, quantitative' },
  { code: '82044', desc: 'Microalbumin, semiquantitative' },
  { code: '82565', desc: 'Creatinine; blood' },
  { code: '96110', desc: 'Developmental screening, with scoring and documentation' },
  { code: 'Z13.4', desc: 'Encounter for screening for certain developmental disorders in childhood' },
  { code: '80061', desc: 'Lipid panel' },
  { code: '82465', desc: 'Cholesterol, serum or whole blood, total' },
  { code: '83718', desc: 'Lipoprotein, direct measurement (HDL)' },
  { code: '2028F', desc: 'Foot examination, performed' },
  { code: '99203', desc: 'Office/outpatient visit for evaluation and management, new patient' }
];

initDb().then(async db => {
  for (const item of updates) {
    // Only update descriptions where they are currently empty or missing
    await db.run('UPDATE code_mappings SET description=? WHERE code=?', [item.desc, item.code]);
  }
  console.log('Successfully updated action table descriptions');
}).catch(console.error);
