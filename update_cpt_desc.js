const { initDb } = require('./database/db');

const updates = [
  { code: '83036', desc: 'Hemoglobin; glycosylated (A1c)' },
  { code: '92134', desc: 'Scanning computerized ophthalmic diagnostic imaging, posterior segment, with interpretation and report, unilateral or bilateral; retina' },
  { code: '92132', desc: 'Scanning computerized ophthalmic diagnostic imaging, anterior segment, with interpretation and report, unilateral or bilateral' },
  { code: '92133', desc: 'Scanning computerized ophthalmic diagnostic imaging, posterior segment, with interpretation and report, unilateral or bilateral; optic nerve' },
  { code: '92136', desc: 'Ophthalmic biometry by partial coherence interferometry with intraocular lens power calculation' },
  { code: '92242', desc: 'Fluorescein angiography and indocyanine-green angiography (includes multiframe imaging) with interpretation and report' },
  { code: '92265', desc: 'Needle oculoelectromyography, 1 or more extraocular muscles, 1 or both eyes, with interpretation and report' },
  { code: '92270', desc: 'Electro-oculography with interpretation and report' },
  { code: '92283', desc: 'Color vision examination, extended, e.g., anomaloscope or equivalent' },
  { code: '92284', desc: 'Dark adaptation examination with interpretation and report' },
  { code: '92285', desc: 'External ocular photography with interpretation and report for documentation of medical progress' },
  { code: '92230', desc: 'Fluorescein angioscopy with interpretation and report' },
  { code: '92235', desc: 'Fluorescein angiography (includes multiframe imaging) with interpretation and report' },
  { code: '92260', desc: 'Ophthalmodynamometry' },
  { code: '92499', desc: 'Unlisted ophthalmological service or procedure' },
  { code: '95060', desc: 'Ophthalmic mucous membrane tests' },
  { code: '92240', desc: 'Indocyanine-green angiography (includes multiframe imaging) with interpretation and report' },
  { code: '92250', desc: 'Fundus photography with interpretation and report' },
  { code: '92227', desc: 'Imaging of retina for detection or monitoring of disease; with remote clinical staff review and report' },
  { code: '92228', desc: 'Imaging of retina for detection or monitoring of disease; with remote physician interpretation and report' },
  { code: '92002', desc: 'Ophthalmological services: medical examination and evaluation; intermediate, new patient' },
  { code: '92004', desc: 'Ophthalmological services: medical examination and evaluation; comprehensive, new patient, 1 or more visits' },
  { code: '92012', desc: 'Ophthalmological services: medical examination and evaluation; intermediate, established patient' },
  { code: '92014', desc: 'Ophthalmological services: medical examination and evaluation; comprehensive, established patient, 1 or more visits' },
  { code: '92018', desc: 'Ophthalmological examination and evaluation, under general anesthesia; complete' },
  { code: '92019', desc: 'Ophthalmological examination and evaluation, under general anesthesia; limited' },
  { code: '82043', desc: 'Urinalysis, microalbumin, quantitative' },
  { code: '82570', desc: 'Assay of creatinine, other source' },
  { code: '82042', desc: 'Assay of albumin, quantitative, urine or other source' },
  { code: '82044', desc: 'Urinalysis, microalbumin, semiquantitative (eg, reagent strip assay)' },
  { code: '82565', desc: 'Assay of creatinine, blood' },
  { code: '96110', desc: 'Developmental screening, with scoring and documentation, per standardized instrument' },
  { code: '80061', desc: 'Lipid panel' },
  { code: '82465', desc: 'Assay, cholesterol, serum or whole blood, total' },
  { code: '83718', desc: 'Assay of lipoprotein, direct measurement, high density cholesterol (HDL cholesterol)' },
  { code: '2028F', desc: 'Foot examination, performed (includes examination through visual inspection, sensory exam with monofilament, and pulse exam)' },
  { code: '99203', desc: 'Office or other outpatient visit for the evaluation and management of a new patient, low level of medical decision making' },
  // And standard E/M codes
  { code: '99201', desc: 'Office or other outpatient visit for the evaluation and management of a new patient, straightforward medical decision making' },
  { code: '99202', desc: 'Office or other outpatient visit for the evaluation and management of a new patient, straightforward medical decision making' },
  { code: '99204', desc: 'Office or other outpatient visit for the evaluation and management of a new patient, moderate level of medical decision making' },
  { code: '99205', desc: 'Office or other outpatient visit for the evaluation and management of a new patient, high level of medical decision making' },
  { code: '99211', desc: 'Office or other outpatient visit for the evaluation and management of an established patient, may not require presence of physician' },
  { code: '99212', desc: 'Office or other outpatient visit for the evaluation and management of an established patient, straightforward medical decision making' },
  { code: '99213', desc: 'Office or other outpatient visit for the evaluation and management of an established patient, low level of medical decision making' },
  { code: '99214', desc: 'Office or other outpatient visit for the evaluation and management of an established patient, moderate level of medical decision making' },
  { code: '99215', desc: 'Office or other outpatient visit for the evaluation and management of an established patient, high level of medical decision making' },
  { code: '90935', desc: 'Hemodialysis procedure with single evaluation by a physician or other qualified health care professional' },
  { code: '90937', desc: 'Hemodialysis procedure requiring repeated evaluation(s) with or without substantial revision of dialysis prescription' },
  { code: '90940', desc: 'Hemodialysis access flow study to determine blood flow in grafts and arteriovenous fistulae by an indicator method' },
  { code: '90947', desc: 'Dialysis procedure other than hemodialysis (eg, peritoneal dialysis, hemofiltration, or other continuous renal replacement therapies), requiring repeated evaluations' },
  { code: '90989', desc: 'Dialysis training, patient, including helper where applicable, any mode, completed course' },
  { code: '90993', desc: 'Dialysis training, patient, including helper where applicable, any mode, course not completed, per training session' },
  { code: '90997', desc: 'Hemoperfusion (eg, with activated charcoal or resin)' },
  { code: '90999', desc: 'Unlisted dialysis procedure, inpatient or outpatient' }
];

initDb().then(async db => {
  for (const item of updates) {
    await db.run('UPDATE code_mappings SET description=? WHERE code=?', [item.desc, item.code]);
  }
  console.log('Successfully updated all CPT descriptions from AAPC');
}).catch(console.error);
