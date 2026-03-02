const fs = require('fs');
const path = require('path');

const csvFile = path.join(__dirname, '../public/docs/syllabus/gtu-syllabus.csv');
const outputFile = path.join(__dirname, '../public/data/curriculum/electronics-communication-engineering.json');

// Branch code mapping
const BRANCH_CODE = '11'; // EC

const curriculum = {
  gtu: { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
  cogc: { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] }
};

// Read and parse CSV
const csvContent = fs.readFileSync(csvFile, 'utf-8');
const lines = csvContent.split('\n');

console.log(`Processing CSV with ${lines.length} lines...\n`);

// Skip header line
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parse CSV line (handle quoted fields)
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  
  if (fields.length < 16) continue;
  
  const [subcode, branchCode, effFrom, subjectName, category, semester, 
         lecture, tutorial, practical, twsl, credits, 
         external, mid, internal, viva, totalMarks, pdfUrl] = fields;
  
  // Filter by branch code (EC = 11)
  if (branchCode !== BRANCH_CODE) continue;
  
  const sem = semester.trim();
  if (!sem || sem === '' || isNaN(parseInt(sem))) continue;
  
  const semStr = sem.toString();
  if (!curriculum.gtu[semStr]) continue; // Only sem 1-6
  
  // Determine curriculum type
  let currType = null;
  
  if (subcode.startsWith('DI')) {
    // Skip C2D students (codes like DI01C, DI02C, etc.)
    if (subcode.match(/DI\d+C\d+/)) {
      console.log(`  Skipping C2D code: ${subcode}`);
      continue;
    }
    // GTU curriculum (2024-25 and 2025-26 syllabus)
    if (effFrom.includes('2024-25') || effFrom.includes('2025-26')) {
      currType = 'gtu';
    }
  } else if (subcode.startsWith('43')) {
    // COGC curriculum (43xxx codes only)
    currType = 'cogc';
  }
  
  if (!currType) continue;
  
  // Create subject object
  const subject = {
    code: subcode,
    name: subjectName,
    category: category,
    hours: {
      lecture: lecture || '0',
      tutorial: tutorial || '0',
      practical: practical || '0',
      pbl: twsl || 'NA'
    },
    credits: credits || '0',
    marks: {
      external: external || '0',
      mid: mid || '0',
      internal: internal || '0',
      viva: viva || '0',
      total: totalMarks || '0'
    }
  };
  
  curriculum[currType][semStr].push(subject);
  
  if (currType === 'gtu') {
    console.log(`  ✓ GTU Sem ${sem}: ${subcode} - ${subjectName}`);
  } else {
    console.log(`  ✓ COGC Sem ${sem}: ${subcode} - ${subjectName}`);
  }
}

// Count totals
let totalGtu = 0;
let totalCogc = 0;
for (let sem = 1; sem <= 6; sem++) {
  const semStr = sem.toString();
  const gtuCount = curriculum.gtu[semStr].length;
  const cogcCount = curriculum.cogc[semStr].length;
  totalGtu += gtuCount;
  totalCogc += cogcCount;
  console.log(`\nSemester ${sem}: ${gtuCount} GTU subjects, ${cogcCount} COGC subjects`);
}

// Write output
fs.writeFileSync(outputFile, JSON.stringify(curriculum, null, 2), 'utf-8');

console.log(`\n✓ Extraction complete!`);
console.log(`  Total GTU subjects: ${totalGtu}`);
console.log(`  Total COGC subjects: ${totalCogc}`);
console.log(`  Output: ${outputFile}`);
