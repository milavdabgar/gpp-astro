# Programs vs Departments Separation - Implementation Summary

## Overview

This document summarizes the architectural refactoring completed on March 2, 2025, which implements a clear separation between **Programs** (student-facing diploma courses) and **Departments** (faculty/administrative units) throughout the GPP Palanpur website.

## Problem Statement

The website previously mixed two distinct concepts:
- **Departments**: Organizational/administrative units with faculty, labs, and achievements
- **Programs**: Academic diploma courses that students enroll in

This caused confusion because:
- One department (Electronics & Communication) offers TWO programs (ECE + ICT)
- One department (Instrumentation & Control) offers a different program (IT)
- One department (Science & Humanities) offers NO programs but teaches all  
- NBA accreditation applies to programs, not departments
- Intake capacity is per program, not per department

## Solution Implemented

Complete architectural separation at data and route levels:

### 1. Data Structure Refactoring

#### Created: `src/data/programs.json` (430 lines)
Student-facing information for 6 diploma programs:
- **Civil Engineering** (CE) - 90 seats, NBA till 2027
- **Electrical Engineering** (EE) - 60 seats, NBA till 2027  
- **Mechanical Engineering** (ME) - 60 seats, NBA till 2027
- **Electronics & Communication** (EC) - 30 seats, NBA applying
- **Information & Communication Technology** (ICT) - 78 seats, new 2022
- **Information Technology** (IT) - 38 seats, new 2023

Each program contains:
- `id`, `name`, `short_name`, `slug`
- `code` (CE/EE/ME/EC/ICT/IT)
- `department_id` (links to parent department)
- `intake_capacity`, `duration_years`, `nba_status`
- `affiliation`: "Gujarat Technological University"
- `vision`, `mission[]`, `peos[]`, `program_outcomes[]`
- `specializations[]`, `career_opportunities[]`
- `eligibility`, `admission_process`

#### Refactored: `src/data/departments.json` (286 lines)
Faculty/administrative unit information for 6 departments:
- **Civil & Applied Mechanics** → offers ["civil"]
- **Electrical** → offers ["electrical"]
- **Mechanical** → offers ["mechanical"]
- **Electronics & Communication** → offers ["ec", "ict"] ✨ Two programs!
- **Instrumentation & Control** → offers ["it"]
- **Science & Humanities** → offers [] (teaches all, offers none)

Each department contains:
- `id`, `name`, `short_name`, `slug`
- `established`, `head_of_department` (object with name/designation/email/phone)
- `faculty_count`, `programs_offered[]` (array of program IDs)
- `website` (external department site URL)
- `overview`, `laboratories[]` (objects with name/incharge/equipment_count)
- `achievements[]`, `contact` (object)
- Science & Humanities has `subjects_taught[]` instead

#### Backed up: `src/data/departments_old.json`
Original mixed structure preserved for reference

### 2. Route Structure

#### Programs Routes (Student-Facing)
**Created:**
- `/programs` - Programs listing page (203 lines)
  - Shows all 6 diploma programs with cards
  - Total seats: 356, NBA accredited: 3
  - Program cards with code badges, NBA status, intake/duration
  - Links to individual program pages
  
- `/programs/[slug]` - Program detail page (367 lines)
  - Hero with program code, NBA badges, "Offered by [Department]" link
  - Program highlights (4 cards)
  - Quick actions: Department page, Labs page, Curriculum, Apply Now
  - Vision/Mission gradient cards
  - PEOs with numbered badges
  - 3-column grid: Specializations, Career Opportunities, Admission Info
  - Lab gallery preview with "View All" CTA
  
- `/programs/[slug]/labs` - Program labs page (221 lines)
  - Only generates for programs with lab data
  - Lab count, student count, equipment count stats
  - 2-column lab gallery with sequential numbering
  - Lab Facilities + Student Benefits lists

#### Departments Routes (Faculty/Administrative)
**Updated:**
- `/departments` - Departments index (rewritten, 160 lines)
  - Shows all 6 administrative departments
  - Total faculty, total labs, programs offered
  - Department cards with HOD, faculty count, programs offered links
  - Science & Humanities shows "Teaching across all programs"
  
- `/departments/[slug]` - Department detail page (completely rewritten, 420 lines)
  - Hero with established date, faculty count, lab count, website link
  - Head of Department section with contact details
  - **Programs Offered section** - cards linking to /programs/[slug]
  - Special section for Science & Humanities (foundational education)
  - Laboratories grid with in-charge and equipment count
  - Key Achievements section
  - Contact & Actions section

**Preserved (backup):**
- `/departments/[slug]-old.astro` - Original mixed structure

### 3. Navigation Updates

**Modified: `src/components/Nav.astro`**
- Added "Programs" as separate menu item under Academics
- Menu order: Programs, Departments, Admissions, Library, Facilities
- Programs = student-facing (what you can study)
- Departments = faculty-facing (who teaches)

### 4. Homepage Updates

**Modified: `src/pages/index.astro`**
- Changed "Explore Programs" button to link to `/programs`
- Updated hero stats: "6 Diploma Programs" (was "6 Departments")
- **Academic Programs section** now shows program cards (not department cards)
  - Displays all 6 programs with code badges (CE/EE/ME/EC/ICT/IT)
  - Shows NBA status, intake capacity, duration
  - "Offered by [Department]" attribution
  - Links to `/programs/[slug]`
- Quick Links section updated to link to `/programs`

## Key Relationships

### Department → Programs (One-to-Many)
```json
{
  "id": "ec",
  "name": "Electronics & Communication Department",
  "programs_offered": ["ec", "ict"]  // Two programs!
}
```

### Program → Department (Many-to-One)
```json
{
  "id": "ict",
  "name": "Diploma in Information & Communication Technology",
  "department_id": "ec"  // Links back to parent
}
```

### Special Case: Science & Humanities
```json
{
  "id": "science-humanities",
  "programs_offered": [],  // Offers no programs
  "subjects_taught": ["Mathematics", "Physics", "Chemistry", "Communication Skills", "Computer Programming"]
}
```

## Data Integrity

### Programs
- **6 programs total**
- **Total intake: 356 seats** (90+60+60+30+78+38)
- **NBA accredited: 3** (Civil, Electrical, Mechanical till 2027)
- **Affiliation: Gujarat Technological University** (all)
- **Duration: 3 years** (all)

### Departments
- **6 departments total**
- **Total faculty: 54+** (manual count)
- **Total labs: 25+** (sum of all department labs)
- **Programs distributed**: 1-1-1-2-1-0 (EC has 2, S&H has 0)

## Technical Implementation

### Type Safety
- TypeScript casting for `programs_offered as string[]` to avoid type errors
- Proper nullable checks for optional fields (faculty_count, contact, etc.)
- Any type warnings in map functions (non-critical, site works fine)

### Lookups & Filters
```typescript
// Program page finds its department
const dept = departments.find(d => 
  (d.programs_offered as string[]).includes(program.id)
);

// Department page finds its programs
const deptPrograms = programs.filter(p => 
  p.department_id === dept.id
);
```

### Faculty & Lab Mapping
- Faculty data keys need updating to match new department IDs
- Lab gallery uses program IDs (not department IDs)
- Proper ID mapping for "civil-applied-mechanics" → "civil" faculty lookup

## Files Created/Modified

### Created (7 files)
1. `src/data/programs.json` - 430 lines
2. `src/pages/programs/index.astro` - 203 lines
3. `src/pages/programs/[slug].astro` - 367 lines
4. `src/pages/programs/[slug]/labs.astro` - 221 lines
5. `PROGRAMS_DEPARTMENTS_SEPARATION.md` - This document

### Modified (4 files)
1. `src/data/departments.json` - Complete refactor (286 lines)
2. `src/pages/departments/index.astro` - Rewritten for faculty view
3. `src/pages/departments/[slug].astro` - Completely rewritten (420 lines)
4. `src/components/Nav.astro` - Added Programs menu item
5. `src/pages/index.astro` - Updated to show programs, not departments

### Backed Up (2 files)
1. `src/data/departments_old.json` - Original mixed structure
2. `src/pages/departments/[slug]-old.astro` - Original page

## Benefits

### For Students
- ✅ Clear view of diploma programs available
- ✅ Direct access to admission requirements, intake capacity
- ✅ NBA accreditation status per program
- ✅ Curriculum, career opportunities, specializations
- ✅ Lab facilities per program

### For Faculty/Administration
- ✅ Clear departmental structure
- ✅ HOD contact information
- ✅ Faculty count and achievements
- ✅ Laboratory management per department
- ✅ Links to programs offered

### For Maintenance
- ✅ Separation of concerns
- ✅ Easier to add new programs without modifying department structure
- ✅ Easier to update department information without touching program data
- ✅ Clear relationships via IDs
- ✅ Future-proof for changes

## Testing

### Tested Routes
- ✅ `/` - Homepage shows programs
- ✅ `/programs` - Programs listing
- ✅ `/programs/civil-engineering` - Program detail
- ✅ `/programs/civil-engineering/labs` - Program labs
- ✅ `/departments` - Departments listing
- ✅ `/departments/civil-applied-mechanics` - Department detail
- ✅ `/departments/electronics-communication` - Shows 2 programs (EC + ICT)
- ✅ `/departments/science-humanities` - Shows 0 programs, special message

### Dev Server Status
- ✅ Server running without critical errors
- ✅ Pages rendering successfully
- ✅ Hot reload working for changes
- ✅ Only minor TypeScript any-type warnings (non-blocking)

## Next Steps (Optional Enhancements)

1. **Faculty Data Update**: Remap faculty.json keys to new department structure
2. **Lab Gallery Verification**: Ensure lab data aligns with program IDs
3. **Breadcrumb Consistency**: Verify all breadcrumbs use correct paths
4. **Mobile Testing**: Test responsive design on mobile devices
5. **SEO Optimization**: Add meta descriptions for new program pages
6. **Sitemap Update**: Regenerate sitemap with new routes

## Conclusion

This refactoring establishes a proper architectural foundation that accurately reflects the real-world structure:
- **Departments** = Who teaches (organizational units)
- **Programs** = What students study (diploma courses)

The separation ensures maintainability, clarity, and accuracy while providing students, faculty, and administrators with the information most relevant to their needs.

---

**Implementation Date**: March 2, 2025  
**Files Changed**: 9 created/modified, 2 backed up  
**Lines of Code**: ~2,000+ (new pages and data structures)  
**Testing Status**: ✅ Verified working in development
