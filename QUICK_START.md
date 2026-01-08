# Mission Control v2.0 - Quick Start Guide 🚀

## One-Click Launch (Simplest Method!)

### Option 1: Double-Click to Open

**File to open**: `build/index.html`

Just **double-click** this file and it opens in your browser - that's it! All 68 students load automatically on first launch.

---

### Option 2: Use the Launcher Scripts

#### On Mac/Linux:
```bash
./launch.sh
```

#### On Windows:
```
launch.bat
```

Double-click these files to launch the app instantly!

---

## Create a Desktop Shortcut (Like an App Icon!)

### 🍎 macOS

1. **Find the file**: Navigate to the project folder → `build/index.html`
2. **Right-click** `index.html`
3. Choose **"Make Alias"**
4. **Drag the alias** to your Desktop or Applications folder
5. **Rename it** to "Mission Control"
6. **(Optional)** Right-click → Get Info → drag a custom icon to the top-left

**Or use Terminal**:
```bash
ln -s "$(pwd)/build/index.html" ~/Desktop/MissionControl.html
```

---

### 🐧 Linux

1. **Create a desktop file**:
```bash
cat > ~/Desktop/mission-control.desktop <<'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Mission Control v2.0
Comment=Youth Work Management System
Exec=xdg-open /home/user/-mission-control-v2/build/index.html
Icon=utilities-system-monitor
Terminal=false
Categories=Utility;Education;
EOF
```

2. **Make it executable**:
```bash
chmod +x ~/Desktop/mission-control.desktop
```

3. **Click** the desktop icon to launch!

---

### 🪟 Windows

#### Method 1: Create Desktop Shortcut
1. **Navigate** to the project folder → `build` folder
2. **Right-click** `index.html`
3. Choose **"Send to" → "Desktop (create shortcut)"**
4. **Rename** the shortcut to "Mission Control"
5. **(Optional)** Right-click shortcut → Properties → Change Icon

#### Method 2: Pin to Taskbar
1. **Open** `build/index.html` in your browser
2. With the page open, **drag the tab** to your taskbar
3. Or click browser menu → More tools → Create shortcut
4. Check "Open as window" for app-like experience

#### Method 3: Use the Batch File
1. **Right-click** `launch.bat` → "Create shortcut"
2. **Drag shortcut** to Desktop or pin to Start menu

---

## Add to Browser for "App-Like" Experience

### Chrome/Edge (Recommended!)

1. **Open** `build/index.html` in Chrome/Edge
2. **Click** the three-dot menu (⋮) in top-right
3. Choose **"Install Mission Control..."** or **"Create shortcut..."**
4. Check ✅ **"Open as window"**
5. Click **"Install"** or **"Create"**

Now you have Mission Control as a standalone app! It will:
- Open in its own window (no browser tabs)
- Appear in your app launcher
- Work offline
- Feel like a native application

**Bonus**: You can pin it to your dock/taskbar!

---

### Firefox

1. **Open** `build/index.html` in Firefox
2. **Click** the three-line menu (≡) in top-right
3. Choose **"Page" → "Add to Home Screen"** (mobile) or **"Pin Tab"** (desktop)

Or create a bookmark and drag it to your bookmarks bar for one-click access!

---

### Safari (macOS)

1. **Open** `build/index.html` in Safari
2. **Click** "File" → "Add to Dock"
3. Or drag the URL from address bar to Dock

---

## What Happens on First Launch?

✅ **All 68 students automatically imported**
✅ **Data saved to browser (persists between sessions)**
✅ **Works completely offline**
✅ **No setup required**

You'll see a success message:
```
✓ Auto-imported 68 students on first launch!
```

---

## Features Available Immediately

### 📅 Daily Calendar
- Time slot scheduling (9 AM - 4 PM)
- 30-minute blocks
- Color-coded activities

### 👥 Student Database
- All 68 students loaded
- Search by name
- Filter by grade (K-8)
- Parent contact info

### ⭐ Antwaun's Dashboard
- 1-on-1 session tracking
- Weekly stats
- Achievement badges
- Goal tracking

### 🎯 Quick Planner
- Smart activity recommendations
- Filter by students, energy, location
- 100+ activities

### 📚 Activities Library
- 40 fitness activities
- 12 cooking activities
- 48 games
- Search and browse

### 🎵 Music Coordination
- Weekly class booking
- Schedule grid (Mon-Fri)
- Instructor tracking

---

## Troubleshooting

### Students Not Loading?

Open browser console (F12) and run:
```javascript
MissionControl.utils.importStudents()
```

### Want Fresh Start?

Clear data and reload:
```javascript
localStorage.clear()
location.reload()
```

### Can't Find the File?

The application is here:
```
/home/user/-mission-control-v2/build/index.html
```

---

## Tips for Best Experience

1. **Use Chrome/Edge** for "Install as App" feature (feels most native)
2. **Bookmark it** for instant access
3. **It's offline-first** - works without internet
4. **Data persists** - closes and reopens with your data intact
5. **It's just HTML** - copy `build/index.html` to USB drive, cloud storage, anywhere!

---

## File Size

**143 KB** (32 KB compressed) - Super lightweight!

You can:
- Email it
- Put it on USB drive
- Share on Google Drive
- Host anywhere
- Works on any device with a browser

---

## Need Help?

- Open browser console (F12) for debug tools
- Access: `window.MissionControl` for utilities
- Check README.md for full documentation

---

**🎉 You're ready to go! Just open `build/index.html` and start managing your youth programs!**
