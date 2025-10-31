# 🚀 Quick Start Guide - BDO Combat Logger Installer

This is the FASTEST way to create a complete installer for your application.

## ⚡ Super Quick Start (3 Steps)

### 1️⃣ Run Setup Wizard

Double-click: **`setup-wizard.bat`**

### 2️⃣ Follow the Menu

- First time? Choose **Option 1** (Check Prerequisites)
- Then choose **Option 3** (Build Complete)

### 3️⃣ Done!

Your installer will be at: `Output/bdo-combat-installer-v1.10.0.exe`

---

## 📋 What You Need (One-Time Install)

Before building for the first time, install these:

1. **Python** - https://www.python.org/downloads/
   - ✅ Check "Add Python to PATH"
2. **Node.js** - https://nodejs.org/
   - ✅ Just install normally
3. **Inno Setup** - https://jrsoftware.org/isdl.php
   - ✅ Version 6 recommended

**Run `check-prerequisites.bat` to verify everything is installed correctly.**

---

## 🎯 Usage Scenarios

### First Time Building Everything

```batch
setup-wizard.bat
→ Choose 1 (Check Prerequisites)
→ Choose 2 (Download Npcap) [Optional but recommended]
→ Choose 3 (Build Complete)
```

### Quick Rebuild (After Code Changes)

```batch
setup-wizard.bat
→ Choose 3 (Build Complete)
```

### Only Need the App (No Installer)

```batch
setup-wizard.bat
→ Choose 4 (Build App Only)
```

### Already Built, Just Need Installer

```batch
setup-wizard.bat
→ Choose 5 (Create Installer Only)
```

### Start Fresh

```batch
setup-wizard.bat
→ Choose 6 (Clean Build)
→ Choose 3 (Build Complete)
```

---

## 📁 File Structure

After a successful build:

```
root_folder/
├── dist/
│   └── bdo-combat-logger/
│       ├── bdo-combat-logger-win_x64.exe
│       ├── resources.neu
│       ├── logger/
│       └── ...
├── output/
│   └── bdo-combat-installer-v1.10.0.exe
├── dependencies/
│   └── npcap-1.84.exe
└── setup-wizard.bat
```

---

## ⏱️ Build Times

Typical build times on a modern PC:

- **First build**: 5-10 minutes (downloads dependencies)
- **Subsequent builds**: 2-5 minutes
- **Installer creation**: 30 seconds

---

## 🎁 What Users Get

When you distribute `bdo-combat-installer-v1.10.0.exe`, users:

1. ✅ Download ONE file
2. ✅ Run the installer (as admin)
3. ✅ Click "Next" a few times
4. ✅ App is ready to use!

**No Python, no Node.js, no build tools needed!**

---

## 🔧 Troubleshooting

### Build Fails?

1. Run `check-prerequisites.bat`
2. Make sure all items show [OK]
3. Try `setup-wizard.bat` → Option 6 (Clean) → Option 3 (Build)

### Installer Won't Create?

- Make sure Inno Setup is installed
- Check that `dist/bdo-combat-logger/` exists
- Try creating manually: `setup-wizard.bat` → Option 5

### Npcap Download Fails?

- Download manually: https://npcap.com/dist/npcap-1.84.exe
- Place in `dependencies/` folder
- Continue with build

---

## 📞 Need Help?

- **Discord**: https://discord.gg/CUc38nKyDU
- **GitHub Issues**: https://github.com/Arkantik/ikusa_logger/issues

---
