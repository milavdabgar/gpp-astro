# Architecture Corrections: Labs & Admissions

## Date: 2025-01-XX
## Commit: 2969e4e

## Issues Identified

After the initial programs/departments separation refactoring, two architectural misalignments were corrected:

### 1. Labs Belong to Departments (Not Programs)

**Problem**: Labs were initially treated as program-specific resources with a `/programs/[slug]/labs` route.

**Reality**: Labs, infrastructure, and faculty are departmental resources shared across all programs offered by that department.

**Example**: 
- Electronics & Communication Department offers both EC and ICT programs
- Both programs share the same 7 laboratories (Microprocessor Lab, VLSI Lab, etc.)
- Science & Humanities offers 0 programs but has 3 labs that serve all GPP programs

**Corrections Made**:
- ❌ Removed `/programs/[slug]/labs.astro` route entirely
- ✅ Program pages now link to `/departments/[slug]/labs` for shared facilities
- ✅ Lab Gallery section on program pages shows `department.laboratories` with "Shared department facilities" messaging
- ✅ Cleaned up imports: removed `facultyData`, `labGallery` from program pages

### 2. Admissions Page Shows Programs (Not Departments)

**Problem**: Admissions page was showing departments with intake capacity aggregated at department level.

**Reality**: Students take admission in specific programs, not departments. A department may offer multiple programs with different intake capacities.

**Example**:
- Students enroll in "Computer Engineering" (Program Code: CE) with intake 60
- Or "Electrical Engineering" (Program Code: EE) with intake 60
- Not in "Civil & Electrical Department" (organizational unit)

**Corrections Made**:
- ❌ Changed from `departments.map()` to `programs.map()`
- ✅ Cards now show: Program Code badge (CE/EE/ME/EC/ICT/IT), NBA Accreditation status, Intake capacity per program, Duration (3 years diploma)
- ✅ Added "Offered by [Department Name]" attribution for context
- ✅ Updated total seats calculation from departments to programs
- ✅ CTA links to `/programs/[slug]` instead of `/departments/[slug]`

## File Changes

### Modified Files
1. **src/pages/admissions.astro** (185→185 lines)
   - Imports both `programs.json` and `departments.json`
   - Uses programs as primary data, departments for attribution
   - Total seats: 360 (6 programs × 60 intake each)

2. **src/pages/programs/[slug].astro** (367→376 lines)
   - Quick Actions: Labs link → `/departments/[slug]/labs`
   - Lab Gallery: Shows `department.laboratories.slice(0, 3)`
   - Removed props: `hasLabs`, `labs`, `facultyData`, `labGallery`
   - Fixed TypeScript errors in Modern Labs highlight card

### Deleted Files
1. **src/pages/programs/[slug]/labs.astro**
   - Entire file removed (-165 lines)
   - Directory `/programs/[slug]/` removed (now flat structure)

## Data Structure Clarity

### programs.json
```json
{
  "id": "ce",
  "code": "CE",
  "name": "Computer Engineering",
  "department_id": "ce-it",
  "intake_capacity": 60,
  "nba_accredited": true,
  // ... curriculum, outcomes, etc.
}
```

### departments.json
```json
{
  "id": "ce-it",
  "short_name": "CE & IT",
  "programs_offered": ["CE", "IT"],
  "laboratories": [
    {"name": "Computer Lab", "incharge": "Dr. X", "equipment_count": 45},
    // ... shared across both CE and IT programs
  ],
  "faculty": [
    // ... faculty teach across all programs in department
  ]
}
```

## Routing Structure

```
/admissions              → Shows 6 programs with intake info
/programs                → Lists all 6 programs
/programs/[slug]         → Program detail page
  → Links to dept labs → /departments/[slug]/labs

/departments             → Lists 6 departments (organizational view)
/departments/[slug]      → Department detail with faculty, labs, achievements
/departments/[slug]/labs → Full lab gallery (shared facilities)
```

## Verification

### Test Cases
1. ✅ Visit [/admissions](http://localhost:4321/admissions) → See 6 program cards
2. ✅ Visit [/programs/computer-engineering](http://localhost:4321/programs/computer-engineering) → Lab Gallery shows "Department Laboratories"
3. ✅ Click "View Labs" on program page → Navigate to `/departments/ce-it/labs` (shared)
4. ✅ Visit `/programs/computer-engineering/labs` → Returns 404 (correct!)
5. ✅ Visit [/departments/ce-it](http://localhost:4321/departments/ce-it) → Shows CE + IT programs offered

### No Compilation Errors
```bash
$ npm run dev
✓ No TypeScript errors
✓ All pages rendering successfully
✓ Hot reload working
```

## Key Insights

1. **Organizational vs Academic Structure**
   - Departments = Organizational units (manage resources, faculty)
   - Programs = Academic offerings (what students enroll in)

2. **Resource Sharing**
   - Labs, faculty, infrastructure belong to departments
   - All programs in a department share these resources
   - Science & Humanities: 0 programs offered, but provides foundational courses to all GPP programs

3. **Student Journey**
   - Apply for admission → Select a **program** (CE/EE/ME/EC/ICT/IT)
   - Not → Select a **department** (CE & IT / Civil & Electrical / etc.)
   - Programs have distinct curriculum, outcomes, NBA status, intake capacity

## Related Documentation
- See `PROGRAMS_DEPARTMENTS_SEPARATION.md` for initial refactoring
- See commit history for detailed changes
