const fs = require('fs');
let code = fs.readFileSync('routes/import.js', 'utf8');

const target = `function normalizePhysician(typeStr) {
    if (!typeStr) return 'Other'; // Fallback if missing
    const t = String(typeStr).toUpperCase().trim();
    if (['GP','FM','IM','FMED','INT','GEN','GENERAL PRACTITIONER','FAMILY MEDICINE','INTERNAL MEDICINE','FAMILY PHYSICIAN','GP PHYSICIAN','INT MED','INTMED','GENERAL PRACTICE','GP/FM','GENERALIST','PRIMARY CARE','FAMILY PRACTICE'].includes(t)) return 'PC_Valid';
    if (['PAEDIATRICIAN','PEDIATRICIAN','PED','PAED','PEDS','PAEDIATRIC','PEDIATRIC'].includes(t)) return 'PC_Paed';
    if (['OPH','OPHTHALMOLOGIST','EYE'].includes(t)) return 'Specialist_Eye';
    if (['NEPH','NEPHROLOGIST'].includes(t)) return 'Specialist_Neph';
    return 'Specialist';
}`;

const rep = `function normalizePhysician(typeStr) {
    if (!typeStr) return 'Other';
    return String(typeStr).trim();
}`;

code = code.replace(target, rep);
fs.writeFileSync('routes/import.js', code);
console.log('Fixed normalizePhysician');
