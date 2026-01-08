# Mission Control v2.0

**A comprehensive youth work management system for remote First Nations communities**

## 📋 Overview

Mission Control v2.0 is a web-based daily planning and tracking tool designed specifically for youth workers in remote First Nations communities. It provides a complete system for:

- Daily activity scheduling with color-coded categories
- Student database management with contact information
- 1-on-1 academic tracking (Lexia & School21 Math)
- Music class coordination
- Fitness and wellness activities
- Intelligent program planning
- Cultural programming integration (Drumming)

## 🌟 Key Features

### Daily Calendar
- **15-minute intervals** (12:00-1:00) for lunch period
- **30-minute intervals** for main programming
- **Color-coded activities** by category:
  - 📚 Blue = Academics
  - 💪 Orange = Fitness
  - 🎵 Green = Music & Drumming
  - 🍳 Purple = Cooking
  - 🎮 Yellow = Games
  - 📋 Purple = Program blocks
  - ❌ Red = Cancelled
- **Two-dropdown selection**: Category first, then specific activity
- **Activity icons and badges** for quick recognition

### Antwaun's 1-on-1 Dashboard
- **Gamified tracking** with achievement badges (🌟⭐🏆)
- **Color-coded stat cards** with weekly totals
- **Progress charts** for Lexia and Math (7-day view)
- **Complete session history** with detailed breakdowns
- **Lexia categories**: Reading Comprehension, Grammar, Word Study
- **School21 Math folders**: Addition, Subtraction, Multiplication, Division, Equivalent Fractions, Comparing Fractions, Mixed Numbers, Adding/Subtracting Algebra, Multiplying Fractions

### Student Database
- **60 students** ready to bulk import (2025-2026 classroom roster)
- **Complete contact information**: parents, phone, email, Facebook
- **Student profiles**: interests, triggers, strategies, medical notes
- **Edit capability** for updating information
- **Special attention flags** with safety notes

### Quick Planner
- **Student-based recommendations** with age filtering
- **Energy/vibe matching** (Calm, Energetic, Tense)
- **Location-aware** suggestions (Arena, Indoor, Outdoor)
- **Beautiful visual output** with color-coded cards
- **Safety notes** for special attention students
- **13+ activities** per category recommended

### Activities Library
- **40 fitness activities** with full instructions
- **48 games** with age ranges and energy levels
- **12 cooking activities** with skills taught
- **Workout Plan Generator** (15/30/45/60 min customizable)

### Music Coordination
- **Weekly booking tracker** for Tuesday, Wednesday, Thursday, Friday
- **Time slot management** with specific class times
- **Confirmation tracking**

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- No installation required - runs entirely in browser
- No internet connection needed after first load

### Quick Start
1. Download `mission-control-v2.html`
2. Open in your web browser
3. Data is saved locally in your browser
4. Start planning!

### First-Time Setup
1. **Import Students**: Go to Student Database → Bulk Import → Import 2025-2026 Classroom List
2. **Customize Schedule**: Daily Calendar → Click time slots → Add your activities
3. **Set Up Antwaun**: Antwaun's Dashboard → Log Today's Work → Start tracking
4. **Explore Activities**: Activities Library → Browse fitness, cooking, and games

## 📚 Usage Guide

### Daily Workflow
1. **Morning**: Review today's schedule in Daily Calendar
2. **Sessions**: Log Antwaun's sessions as completed
3. **Planning**: Use Quick Planner for afternoon programming
4. **Evening**: Update schedule for tomorrow

### Adding Activities to Schedule
1. Click any time slot
2. Select category (e.g., "💪 Fitness")
3. Choose specific activity (e.g., "Jumping Jacks")
4. Add description/notes
5. Save

### Tracking Antwaun's Progress
1. Antwaun's Dashboard → Log Today's Work
2. Enter minutes for Lexia (goal: 30+) and select category
3. Enter minutes for Math (goal: 30-60) and select folder
4. Log music class attendance and time
5. Select fitness activity and duration
6. Add session notes
7. Save → Watch badges appear!

### Generating Program Plans
1. Quick Planner
2. Select students attending
3. Choose energy level (Calm/Energetic/Tense)
4. Check available locations
5. Generate Plan
6. View beautiful color-coded recommendations

### Generating Workout Plans
1. Activities Library → Workout Plan Generator
2. Select duration (15/30/45/60 min)
3. Check focus areas (Cardio, Strength, Core, Yoga)
4. Generate
5. Get structured 3-phase workout

## 🎨 Design Philosophy

### Color System
- **Navy Blue** (#0a1828): Main background
- **Navy Mid** (#1e3a5f): Cards and panels
- **Amber Warm** (#ffa726): Primary actions, highlights
- **Blue** (#60a5fa): Academics
- **Orange** (#f97316): Fitness
- **Green** (#10b981): Music, success states
- **Purple** (#a78bfa): Special features, cooking
- **Yellow** (#fbbf24): Games
- **Red** (#ef4444): Alerts, cancelled

### Typography
- **Body**: Outfit (Google Fonts)
- **Technical/Stats**: Space Mono (Google Fonts)
- Clean, readable hierarchy

### Layout
- **Responsive design**: Works on desktop, tablet, mobile
- **Tab-based navigation**: Organized by function
- **Card-based UI**: Information grouped visually
- **Color-coded borders**: Quick category recognition

## 💾 Data Storage

All data is stored locally in your browser using `localStorage`:
- `missionControl_v2_schedules`: Daily calendar data
- `missionControl_v2_students`: Student database
- `missionControl_v2_antwaunSessions`: Antwaun's session logs
- `missionControl_v2_musicBookings`: Weekly music bookings

**Data Persistence**: 
- Data persists across browser sessions
- Clearing browser data will erase all stored information
- Export/backup functionality not yet implemented

## 🔧 Technical Details

### Technology Stack
- **HTML5**: Structure
- **CSS3**: Styling with custom properties
- **Vanilla JavaScript**: All functionality
- **localStorage**: Data persistence
- **Google Fonts**: Typography (Outfit, Space Mono)

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

### File Size
- Single HTML file: ~180KB
- No external dependencies (except fonts)
- Fast loading, instant after cache

## 📊 Statistics

- **100+ activities** across all categories
- **60 students** in pre-loaded classroom roster
- **9 School21 math folders** for comprehensive tracking
- **3 Lexia categories** for focused reading work
- **40 fitness activities** with CDC-based research
- **48 games** with full descriptions and age ranges
- **12 cooking activities** with skill development focus

## 🤝 Contributing

This is a personal project developed for use in remote First Nations communities. If you have suggestions or improvements:

1. Document the issue/feature clearly
2. Explain the use case
3. Consider cultural context and remote community needs

## 📝 Version History

### v2.0 (Current)
- Complete visual redesign with color-coded activities
- Two-dropdown activity selection system
- Enhanced session history with color-coded cards
- 15-minute lunch period intervals
- Beautiful Quick Planner output with graphics
- Gamified Antwaun dashboard with badges
- Workout Plan Generator
- 40 fitness activities, 48 games
- Updated School21 and Lexia categories
- Drumming activity integration

### v1.0
- Basic daily planning
- Student database
- Game library
- Standalone HTML version

## 🎯 Roadmap

### Potential Future Features
- [ ] Export/import data functionality
- [ ] Print-friendly views
- [ ] Weekly/monthly overview
- [ ] Progress reports
- [ ] Photo upload for activities
- [ ] Offline mobile app version
- [ ] Multi-user support
- [ ] Cloud sync option (while maintaining local-first approach)

## 🌍 Context

This tool was developed for youth work in remote First Nations communities in Northern Ontario, Canada. It's designed to work:
- **Offline-first**: No internet required after initial load
- **Low-bandwidth friendly**: Single file, minimal resources
- **Culturally responsive**: Includes cultural programming options
- **Practical**: Addresses real needs of remote youth workers

## 📧 Contact

For questions, feedback, or collaboration:
- Create an issue in this repository
- Include context about your use case
- Respect the cultural context this tool was built for

## 📄 License

This project is provided as-is for educational and community use. Please respect the cultural context and community needs it was designed for.

---

**Built with ❤️ for youth workers in remote First Nations communities**

*"Every young person deserves organized, engaging, and culturally responsive programming."*
