import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const syllabusDir = join(__dirname, '../public/docs/syllabus');
const outputDir = join(__dirname, '../public/data/curriculum');

// Program mapping
const programMap = {
  'ec': 'electronics-communication-engineering',
  'ict': 'information-communication-technology',
  'it': 'information-technology',
  'ce': 'civil-engineering',
  'ee': 'electrical-engineering',
  'me': 'mechanical-engineering',
};

// Parse a single HTML file
function parseSyllabusHTML(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  
  const table = document.querySelector('table.myGrid');
  if (!table) {
    console.error('No table found');
    return [];
  }

  const rows = Array.from(table.querySelectorAll('tr')).slice(1); // Skip header
  const subjects = [];

  for (const row of rows) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 17) continue;

    // Extract subject code from link
    const subjectCodeElement = cells[1].querySelector('a') || cells[1];
    const subjectCode = subjectCodeElement.textContent.trim();

    // Skip if no valid subject code
    if (!subjectCode || subjectCode === '') continue;

    // Determine curriculum type
    let curriculumType = 'unknown';
    if (subjectCode.startsWith('DI')) {
      // Check if it's C2D (exclude these)
      if (subjectCode.match(/DI01C\d+/)) {
        continue; // Skip C2D subjects
      }
      curriculumType = 'gtu';
    } else if (subjectCode.startsWith('43')) {
      curriculumType = 'cogc';
    } else {
      continue; // Skip unknown codes
    }

    const subject = {
      code: subjectCode,
      name: cells[4].textContent.trim().replace(/^\s*&nbsp;\s*/, ''),
      category: cells[5].textContent.trim(),
      semester: cells[6].textContent.trim(),
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
      },
      curriculumType
    };

    subjects.push(subject);
  }

  return subjects;
}

// Main processing
console.log('🔍 Scanning syllabus directory...');

const files = readdirSync(syllabusDir).filter(f => f.endsWith('.html'));
console.log(`Found ${files.length} HTML files`);

const curriculumData = {};

for (const file of files) {
  const match = file.match(/^([a-z]+)-(\d+)\.html$/);
  if (!match) continue;

  const [, programCode, semester] = match;
  const programSlug = programMap[programCode];
  
  if (!programSlug) {
    console.warn(`⚠️  Unknown program code: ${programCode}`);
    continue;
  }

  console.log(`📄 Processing ${file} (${programSlug}, semester ${semester})...`);

  const htmlPath = join(syllabusDir, file);
  const htmlContent = readFileSync(htmlPath, 'utf-8');
  
  const subjects = parseSyllabusHTML(htmlContent);
  
  if (!curriculumData[programSlug]) {
    curriculumData[programSlug] = {
      gtu: {},
      cogc: {}
    };
  }

  // Organize by curriculum type and semester
  subjects.forEach(subject => {
    const sem = subject.semester;
    const type = subject.curriculumType;
    
    if (!curriculumData[programSlug][type][sem]) {
      curriculumData[programSlug][type][sem] = [];
    }
    
    curriculumData[programSlug][type][sem].push(subject);
  });

  console.log(`   ✓ Found ${subjects.length} subjects`);
}

// Write output files
console.log('\n📝 Writing JSON files...');

// Create output directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
  mkdirSync(outputDir, { recursive: true });
} catch (e) {
  // Directory already exists
}

// Write individual program files
for (const [programSlug, data] of Object.entries(curriculumData)) {
  const outputPath = join(outputDir, `${programSlug}.json`);
  writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  const gtuCount = Object.values(data.gtu).flat().length;
  const cogcCount = Object.values(data.cogc).flat().length;
  
  console.log(`   ✓ ${programSlug}.json (GTU: ${gtuCount}, COGC: ${cogcCount} subjects)`);
}

// Write combined file
const combinedPath = join(outputDir, 'all.json');
writeFileSync(combinedPath, JSON.stringify(curriculumData, null, 2));
console.log(`   ✓ all.json (combined)`);

console.log('\n✅ Done! Curriculum data extracted successfully.');
