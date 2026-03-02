const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const syllabusDir = path.join(__dirname, '../public/docs/syllabus');
const outputFile = path.join(__dirname, '../public/data/curriculum/electronics-communication-engineering.json');

const curriculum = {
  gtu: { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
  cogc: { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] }
};

// Process each semester file
for (let sem = 1; sem <= 6; sem++) {
  const filename = `ec-${sem}.html`;
  const filepath = path.join(syllabusDir, filename);
  
  console.log(`\nProcessing ${filename}...`);
  
  if (!fs.existsSync(filepath)) {
    console.log(`File not found: ${filepath}`);
    continue;
  }
  
  const html = fs.readFileSync(filepath, 'utf-8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  // Find all table rows
  const rows = Array.from(doc.querySelectorAll('table.myGrid tr'));
  console.log(`Found ${rows.length} total rows`);
  
  let gtuCount = 0;
  let cogcCount = 0;
  
  for (let i = 1; i < rows.length; i++) { // Skip header row
    const cells = rows[i].querySelectorAll('td');
    
    if (cells.length < 17) {
      continue; // Not a data row
    }
    
    try {
      // Extract subject code from cell[1]
      const codeLink = cells[1].querySelector('a');
      if (!codeLink) continue;
      
      const code = codeLink.textContent.trim();
      
      // Determine curriculum type
      let currType = null;
      if (code.startsWith('DI01')) {
        // Skip C2D students (codes like DI01C...)
        if (code.match(/DI01C\d+/)) {
          console.log(`  Skipping C2D code: ${code}`);
          continue;
        }
        currType = 'gtu';
      } else if (code.startsWith('43')) {
        currType = 'cogc';
      } else {
        continue; // Not a valid curriculum code
      }
      
      // Extract subject data
      const subject = {
        code: code,
        name: cells[4].textContent.trim(),
        category: cells[5].textContent.trim(),
        hours: {
          lecture: cells[7].textContent.trim(),
          tutorial: cells[8].textContent.trim(),
          practical: cells[9].textContent.trim(),
          pbl: cells[10].textContent.trim()
        },
        credits: cells[11].textContent.trim(),
        marks: {
          external: cells[12].textContent.trim(),
          mid: cells[13].textContent.trim(),
          internal: cells[14].textContent.trim(),
          viva: cells[15].textContent.trim(),
          total: cells[16].textContent.trim()
        }
      };
      
      curriculum[currType][sem.toString()].push(subject);
      
      if (currType === 'gtu') {
        gtuCount++;
        console.log(`  ✓ GTU: ${code} - ${subject.name}`);
      } else {
        cogcCount++;
        console.log(`  ✓ COGC: ${code} - ${subject.name}`);
      }
      
    } catch (error) {
      console.log(`  Error processing row ${i}: ${error.message}`);
    }
  }
  
  console.log(`Semester ${sem}: ${gtuCount} GTU subjects, ${cogcCount} COGC subjects`);
}

// Calculate totals
let totalGtu = 0;
let totalCogc = 0;
for (let sem = 1; sem <= 6; sem++) {
  totalGtu += curriculum.gtu[sem.toString()].length;
  totalCogc += curriculum.cogc[sem.toString()].length;
}

// Write output
fs.writeFileSync(outputFile, JSON.stringify(curriculum, null, 2), 'utf-8');

console.log(`\n✓ Extraction complete!`);
console.log(`  Total GTU subjects: ${totalGtu}`);
console.log(`  Total COGC subjects: ${totalCogc}`);
console.log(`  Output file: ${outputFile}`);
