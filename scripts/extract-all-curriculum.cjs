const fs = require('fs');
const path = require('path');

// Branch code to program slug mapping
const branches = [
  { code: '6', slug: 'civil-engineering', name: 'Civil Engineering' },
  { code: '9', slug: 'electrical-engineering', name: 'Electrical Engineering' },
  { code: '11', slug: 'electronics-communication-engineering', name: 'Electronics & Communication Engineering' },
  { code: '16', slug: 'information-technology', name: 'Information Technology' },
  { code: '19', slug: 'mechanical-engineering', name: 'Mechanical Engineering' },
  { code: '32', slug: 'information-communication-technology', name: 'Information & Communication Technology' },
];

const csvFile = path.join(__dirname, '../public/docs/syllabus/gtu-syllabus.csv');
const outputDir = path.join(__dirname, '../public/data/curriculum');

// Read CSV once
const csvContent = fs.readFileSync(csvFile, 'utf-8');
const lines = csvContent.split('\n');

console.log(`Processing CSV with ${lines.length} lines...\n`);

// Process each branch
for (const branch of branches) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${branch.name} (Code: ${branch.code})`);
  console.log('='.repeat(60));
  
  const curriculum = {
    gtu: { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
    cogc: { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] }
  };

  let gtuCount = 0;
  let cogcCount = 0;

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
    
    // Filter by branch code
    if (branchCode !== branch.code) continue;
    
    const sem = semester.trim();
    if (!sem || sem === '' || isNaN(parseInt(sem))) continue;
    
    const semStr = sem.toString();
    if (!curriculum.gtu[semStr]) continue; // Only sem 1-6
    
    // Determine curriculum type
    let currType = null;
    
    if (subcode.startsWith('DI')) {
      // Skip C2D students (codes like DI01C, DI02C, etc.)
      if (subcode.match(/DI\d+C\d+/)) {
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
      gtuCount++;
    } else {
      cogcCount++;
    }
  }

  // Display semester breakdown
  console.log('\nSemester breakdown:');
  for (let sem = 1; sem <= 6; sem++) {
    const semStr = sem.toString();
    const gtuSem = curriculum.gtu[semStr].length;
    const cogcSem = curriculum.cogc[semStr].length;
    console.log(`  Semester ${sem}: ${gtuSem} GTU, ${cogcSem} COGC`);
  }

  console.log(`\nTotal: ${gtuCount} GTU subjects, ${cogcCount} COGC subjects`);

  // Write output
  const outputFile = path.join(outputDir, `${branch.slug}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(curriculum, null, 2), 'utf-8');
  console.log(`✓ Saved to: ${branch.slug}.json`);
}

console.log(`\n${'='.repeat(60)}`);
console.log('✓ All programs processed successfully!');
console.log('='.repeat(60));
