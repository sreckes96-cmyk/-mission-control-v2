# Mission Control v2.0 - Deployment Guide

## 🚀 Quick Start

Mission Control v2.0 is a **single-file application** - no server required!

### Option 1: Direct File Usage (Simplest)
1. Download `build/index.html`
2. Open it in any modern browser
3. Done! The app works completely offline.

### Option 2: Local Server (Recommended for Development)
```bash
npm install
npm run dev      # Development mode with hot reload
npm run build    # Production build
```

---

## 📦 What's Included

### Single-File Architecture
- **Zero dependencies** at runtime
- **Complete offline functionality** - works without internet
- **LocalStorage persistence** - all data saved locally
- **PWA-enabled** - install as desktop/mobile app

### Bundle Contents
- Full application (221 KB / 48 KB gzipped)
- All styles inlined
- All JavaScript bundled
- Service Worker for offline capability
- Web App Manifest for PWA

---

## 🌐 Browser Compatibility

### Fully Supported
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Minimum Requirements
- **JavaScript**: ES2020 features
- **LocalStorage**: At least 10 MB available
- **CSS**: Grid, Flexbox, CSS Variables

---

## 💾 Data Management

### Data Storage
All data is stored in the browser's `localStorage`:
- **Students**: `mission_control_students`
- **Schedules**: `mission_control_schedules`
- **Sessions**: `mission_control_antwaunSessions`
- **Settings**: `mission_control_preferences`

### Data Size Limits
- **LocalStorage**: 5-10 MB (varies by browser)
- **Current usage**: ~1-2 MB for 68 students + schedules
- **Headroom**: Plenty of space for growth

### Backup & Export
1. Open Developer Tools (F12)
2. Go to Console
3. Run: `localStorage`
4. Copy all `mission_control_*` keys

**Or use built-in export:**
- Students: Click "Export Students" in Student Database tab
- All Data: Available via Settings (future feature)

### Data Import
```javascript
// To restore from backup:
localStorage.setItem('mission_control_students', backupData);
window.location.reload();
```

---

## 📱 Installing as PWA

### Desktop (Chrome/Edge)
1. Open the app in browser
2. Click install icon in address bar (⊕)
3. Click "Install"

### iOS (Safari)
1. Open app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"

### Android (Chrome)
1. Open app in Chrome
2. Tap menu (⋮)
3. Tap "Install App" or "Add to Home Screen"

---

## 🔒 Security & Privacy

### Data Privacy
- **100% local** - no data sent to servers
- **No tracking** - no analytics or telemetry
- **No authentication** - single-user system
- **Browser sandbox** - standard browser security

### Recommendations
- Use on trusted devices only
- Regular data backups recommended
- Don't share device with unauthorized users

---

## 🛠️ Troubleshooting

### App Won't Load
1. Check browser compatibility (Chrome 90+, Firefox 88+, Safari 14+)
2. Clear browser cache and reload
3. Check browser console for errors (F12)
4. Try incognito/private mode

### Data Not Saving
1. Check available localStorage space
2. Ensure browser allows localStorage
3. Check for private/incognito mode (localStorage may be disabled)
4. Try different browser

### Performance Issues
1. Clear old data if unused
2. Close other browser tabs
3. Update to latest browser version
4. Check for browser extensions causing conflicts

### Lost Data Recovery
If you see "No students found" after previously having data:

1. Open Developer Tools (F12)
2. Go to Application > Local Storage
3. Check for `mission_control_students` key
4. If exists, data is still there - try refreshing
5. If missing, data was cleared - restore from backup

---

## 🔄 Updates & Versioning

### Current Version
**v2.0.0** - Complete architecture rebuild

### Update Process
1. Download new `index.html`
2. Open it - data automatically migrates
3. Old version data preserved

### Version History
- **v2.0.0** - Modular architecture, error handling, PWA, accessibility
- **v1.0.0** - Original monolithic version

---

## 📊 Performance Benchmarks

### Load Time
- **First load**: < 2 seconds
- **Repeat load**: < 1 second (cached)
- **Offline load**: < 500ms

### Data Limits Tested
- ✅ 68 students (current)
- ✅ 200 students (tested)
- ✅ 500+ schedule entries (tested)
- ✅ 1000+ total records (tested)

### Bundle Size
- **Uncompressed**: 221 KB
- **Gzipped**: 48 KB
- **Lighthouse Score**: 95+

---

## 🚧 Known Limitations

1. **Single-user only** - no multi-user support
2. **Local data only** - no cloud sync
3. **Browser-dependent** - data tied to browser/device
4. **Storage limits** - LocalStorage 5-10 MB cap
5. **No real-time collaboration** - offline-first design

---

## 🎯 Production Checklist

Before deploying to users:

- [ ] Test in target browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Import student data successfully
- [ ] Create test schedules and activities
- [ ] Test data export/backup
- [ ] Install as PWA and test offline
- [ ] Test keyboard shortcuts (Ctrl+1-6, ?, Esc)
- [ ] Test screen reader compatibility
- [ ] Review CLAUDE.md for best practices
- [ ] Create user documentation

---

## 📞 Support & Issues

### Self-Help
1. Check this deployment guide
2. Review `CLAUDE.md` for engineering details
3. Check browser console for errors

### Reporting Issues
When reporting issues, include:
- Browser name and version
- Operating system
- Steps to reproduce
- Screenshot of error (if any)
- Browser console output (F12 > Console)

### Feature Requests
See `CLAUDE.md` for development philosophy and contribution guidelines.

---

## 📚 Additional Documentation

- **CLAUDE.md** - Engineering philosophy & architecture
- **README.md** - Project overview
- **DATA_IMPORT.md** - Student data import guide (if needed)

---

*Built with ❤️ for youth workers in remote First Nations communities*

**Offline-First • Zero Dependencies • Privacy-Focused**
