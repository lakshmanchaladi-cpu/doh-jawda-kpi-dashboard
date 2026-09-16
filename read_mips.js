const fetch = require('node-fetch');

async function fetchMips() {
  try {
    const res = await fetch('https://mdinteractive.com/MIPS_Family_Practice');
    const text = await res.text();
    console.log("Length:", text.length);
    // Print a snippet around "Blood Pressure" or "236"
    const lines = text.split('\n');
    let output = [];
    for(let i=0; i<lines.length; i++) {
      if(lines[i].toLowerCase().includes('blood pressure') || lines[i].includes('236')) {
        output.push(lines.slice(Math.max(0, i-2), i+3).join('\n'));
      }
    }
    console.log(output.join('\n\n---\n\n').substring(0, 2000));
  } catch(e) {
    console.error(e);
  }
}
fetchMips();
