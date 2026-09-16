const { initDb } = require('./database/db');
const fs = require('fs');

const contentPath = 'C:/Users/USER/.gemini/antigravity/brain/672b157b-0624-4cb7-895a-cf62c277811f/.system_generated/steps/519/content.md';
const content = fs.readFileSync(contentPath, 'utf8');

const lines = content.split('\n');

initDb().then(async db => {
  let count = 0;
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('Source:') || line.startsWith('---') || line.startsWith('Classification,Auth.No,Company Name')) {
      continue;
    }
    
    // Parse CSV line correctly dealing with commas inside quotes if any. 
    // Given the simple head output, we can probably just split by first 2 commas.
    const parts = line.split(',');
    if (parts.length >= 3) {
      const classification = parts[0];
      const authNo = parts[1];
      const companyName = parts.slice(2).join(',').replace(/^"|"$/g, ''); // Rejoin the rest in case company name has commas
      
      await db.run(
        'INSERT INTO code_mappings (mapping_type, group_name, code_type, code, description) VALUES (?, ?, ?, ?, ?)',
        ['Insurance', classification, 'DOH_License', authNo, companyName]
      );
      count++;
    }
  }
  console.log(`Successfully inserted ${count} insurance records.`);
}).catch(console.error);
