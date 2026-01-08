# Student Data Import Guide

## Overview

Mission Control v2.0 now includes complete student data for Marten Falls First Nation School (2024-2025 school year).

**Total Students**: 68
- Kindergarten (JK/SK): 12 students
- Grade 1: 10 students
- Grade 2: 11 students
- Grade 3: 3 students
- Grade 4: 8 students
- Grade 5: 4 students
- Grade 6: 5 students
- Grade 7: 9 students
- Grade 8: 6 students

## Importing Student Data

### Method 1: Browser Console (Recommended)

1. **Open the application** in your browser
2. **Open Developer Tools** (F12 or Ctrl+Shift+I)
3. **Go to Console tab**
4. **Run the import command**:

```javascript
MissionControl.utils.importStudents()
```

This will import all 68 students. You'll see a success message:

```
✓ Successfully imported 68 students, updated 0, skipped 0
```

### Method 2: Re-import (Clear & Import)

To clear existing students and import fresh data:

```javascript
MissionControl.utils.importStudents(true)
```

The `true` parameter clears all existing students before importing.

### Method 3: Check Import Summary

To see what will be imported without actually importing:

```javascript
MissionControl.utils.getImportSummary()
```

Returns:
```json
{
  "totalStudents": 68,
  "byGrade": {
    "kindergarten": 12,
    "grade1": 10,
    "grade2": 11,
    ...
  },
  "specialAttention": 1,
  "withEmail": 34,
  "classRoster": {...}
}
```

### Method 4: Verify Import

After importing, verify the data loaded correctly:

```javascript
MissionControl.utils.verifyImport()
```

Returns `true` if successful, with message:

```
✓ Import verification passed: 68 students loaded
```

## Class Roster Information

### Kindergarten
- **Teacher**: Lauren, Shun Michaels
- **Grades**: JK (Junior K), SK (Senior K)
- **Students**: 12

### Grade 1-2 (Anthony's Class)
- **Teacher**: Anthony, Fiona (.5)
- **Grades**: 1, 2
- **Students**: 10

### Grade 1-2 (Meagan's Class)
- **Teacher**: Meagan, Fiona (.5)
- **Grades**: 1, 2
- **Students**: 11

### Grade 3-4
- **Teacher**: Gabe
- **Grades**: 3, 4
- **Students**: 11

### Grade 5-6
- **Teacher**: Verna, Ankush (.5) PM
- **Grades**: 5, 6
- **Students**: 9

### Grade 7-8
- **Teacher**: Joann, Ankush (.5) AM
- **Grades**: 7, 8
- **Students**: 15

## Special Notes

### Antwaun Wenjack (Grade 8)
- Has dedicated dashboard for 1-on-1 session tracking
- Marked with `specialAttention: true`
- Navigate to **⭐ Antwaun's Dashboard** tab to see his progress tracking

### Data Fields

Each student record includes:
- **Name**: Full name
- **Grade**: 0 (Kindergarten), 1-8
- **Age**: Calculated from date of birth where available
- **Parent/Guardian**: Primary contact name(s)
- **Phone**: Contact phone number
- **Email**: Contact email (when available)
- **Special Attention**: Flag for students requiring extra attention
- **Notes**: Additional context (grade level, classroom info)

### Missing Data

Some students have incomplete contact information:
- 17 students missing parent phone numbers
- 34 students missing parent email addresses
- Some students missing date of birth/age

This is normal for real-world data and the application handles it gracefully.

## Accessing Student Data

### View All Students

```javascript
MissionControl.repositories.students.getAll()
```

### Find By Grade

```javascript
MissionControl.repositories.students.findByGrade(8)
```

### Search By Name

```javascript
MissionControl.repositories.students.search('Antwaun')
```

### Special Attention Students

```javascript
MissionControl.repositories.students.findSpecialAttention()
```

## Data Persistence

Student data is automatically saved to **localStorage** and persists between sessions. You only need to import once unless you:
- Clear browser data
- Switch browsers
- Want to refresh with updated data

## Troubleshooting

### Import Not Working

1. Check console for errors
2. Verify you're in debug mode (should see "🚀 Mission Control v2.0 Debug Mode")
3. Try reloading the page
4. Clear localStorage and try again:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

### Students Not Appearing

1. Verify import completed: `MissionControl.utils.verifyImport()`
2. Check repository: `MissionControl.repositories.students.getAll().length`
3. Navigate to **👥 Student Database** tab to see the list
4. Try clearing filters/search if using

### Performance Issues

With 68 students, the application should run smoothly. If you experience slowdowns:
- Check browser console for errors
- Clear browser cache
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

## Export Data

To export current student data to JSON:

```javascript
JSON.stringify(MissionControl.repositories.students.getAll(), null, 2)
```

Copy and save to a file for backup or sharing.

## Development

Seed data location: `src/data/seedStudents.js`
Import utilities: `src/utils/importStudents.js`

To modify student data, edit `seedStudents.js` and rebuild:
```bash
npm run build
```

---

**Questions?** Check the main README.md or ARCHITECTURE.md for more details.
