import re
import json
from html.parser import HTMLParser
from pathlib import Path

class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_row = False
        self.in_cell = False
        self.current_row = []
        self.rows = []
        self.cell_count = 0
        self.in_link = False
        self.current_text = ""
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'table' and attrs_dict.get('class') == 'myGrid':
            self.in_table = True
        elif self.in_table and tag == 'tr':
            self.in_row = True
            self.current_row = []
            self.cell_count = 0
        elif self.in_row and tag == 'td':
            self.in_cell = True
            self.current_text = ""
        elif self.in_cell and tag == 'a':
            self.in_link = True
            
    def handle_endtag(self, tag):
        if tag == 'table' and self.in_table:
            self.in_table = False
        elif tag == 'tr' and self.in_row:
            if len(self.current_row) >= 17:  # Valid row with all columns
                self.rows.append(self.current_row)
            self.in_row = False
        elif tag == 'td' and self.in_cell:
            self.current_row.append(self.current_text.strip())
            self.in_cell = False
            self.cell_count += 1
        elif tag == 'a' and self.in_link:
            self.in_link = False
            
    def handle_data(self, data):
        if self.in_cell:
            self.current_text += data

def extract_marks(total_marks):
    """Extract marks breakdown"""
    try:
        total = int(total_marks)
        if total == 100:
            return {"external": "70", "mid": "30", "internal": "0", "viva": "0", "total": "100"}
        elif total == 150:
            return {"external": "70", "mid": "30", "internal": "20", "viva": "30", "total": "150"}
        elif total == 50:
            return {"external": "0", "mid": "0", "internal": "50", "viva": "0", "total": "50"}
        elif total == 0:
            return {"external": "0", "mid": "0", "internal": "0", "viva": "0", "total": "0"}
        else:
            return {"external": "0", "mid": "0", "internal": "0", "viva": "0", "total": str(total)}
    except:
        return {"external": "0", "mid": "0", "internal": "0", "viva": "0", "total": "0"}

def parse_html_file(filepath):
    """Parse a single HTML file and return extracted subjects"""
    with open(filepath, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    parser = TableParser()
    parser.feed(html_content)
    
    print(f"Parsing {filepath}: Found {len(parser.rows)} rows")
    
    subjects = []
    for row in parser.rows[1:]:  # Skip header row
        if len(row) < 17:
            continue
            
        code = row[1].strip()
        
        # Debug: print codes we're seeing
        print(f"DEBUG: Found code: '{code}'")
        
        # Skip if it's a C2D student code (DI01C, DI02C, etc.)
        if 'C' in code and re.match(r'DI0\dC\d+', code):
            print(f"  -> Skipping C2D code")
            continue
        
        # Only process GTU (DI0x) or COGC (43xxx or C43xxx) codes
        is_gtu = re.match(r'DI0[1-6]\d{6}', code)
        is_cogc = code.startswith('43') or code.startswith('C43')
        
        print(f"  -> is_gtu: {is_gtu}, is_cogc: {is_cogc}")
        
        if not (is_gtu or is_cogc):
            print(f"  -> Skipping (not GTU or COGC)")
            continue
            
        subject = {
            "code": code,
            "name": row[4].strip().replace('&nbsp;', '').strip(),
            "category": row[5].strip(),
            "hours": {
                "lecture": row[7].strip(),
                "tutorial": row[8].strip(),
                "practical": row[9].strip(),
                "pbl": row[10].strip()
            },
            "credits": row[11].strip(),
            "marks": extract_marks(row[16].strip())
        }
        
        subjects.append(subject)
    
    return subjects

# Parse all files
base_path = Path('/Users/milav/Code/gpp-astro/public/docs/syllabus')
result = {
    "gtu": {"1": [], "2": [], "3": [], "4": [], "5": [], "6": []},
    "cogc": {"1": [], "2": [], "3": [], "4": [], "5": [], "6": []}
}

total_gtu = 0
total_cogc = 0

for sem in range(1, 7):
    html_file = base_path / f'ec-{sem}.html'
    if not html_file.exists():
        print(f"Warning: {html_file} not found")
        continue
    
    subjects = parse_html_file(html_file)
    
    for subject in subjects:
        code = subject['code']
        # GTU codes start with DI0x where x is semester number
        if re.match(r'DI0[1-6]\d{6}', code):
            result['gtu'][str(sem)].append(subject)
            total_gtu += 1
        # COGC codes start with 43 or C43
        elif code.startswith('43') or code.startswith('C43'):
            result['cogc'][str(sem)].append(subject)
            total_cogc += 1

# Write to JSON file
output_path = Path('/Users/milav/Code/gpp-astro/public/data/curriculum/electronics-communication-engineering.json')
output_path.parent.mkdir(parents=True, exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print(f"Extraction complete. Found {total_gtu} GTU subjects and {total_cogc} COGC subjects total.")
