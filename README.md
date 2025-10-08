# BDO Combat Logger

[![Version](https://img.shields.io/github/v/release/Arkantik/ikusa_logger?label=version)](https://github.com/Arkantik/ikusa_logger/releases)
[![Last Updated](https://img.shields.io/github/last-commit/Arkantik/ikusa_logger?label=last%20updated)](https://github.com/Arkantik/ikusa_logger)
[![License](https://img.shields.io/badge/license-repo%20not%20found-red.svg)](https://github.com/Arkantik/ikusa_logger)
[![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)](https://github.com/Arkantik/ikusa_logger)
[![BDO](https://img.shields.io/badge/game-Black%20Desert%20Online-orange.svg)](https://www.naeu.playblackdesert.com/)

A powerful tool for Black Desert Online that captures and logs combat messages during PvP activities such as Node Wars, Sieges, and War of the Roses.

## 📋 Table of Contents

- [BDO Combat Logger](#bdo-combat-logger)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🔧 Prerequisites](#-prerequisites)
    - [Required](#required)
    - [Optional](#optional)
  - [📥 Installation](#-installation)
    - [Step 1: Get the Project Files](#step-1-get-the-project-files)
    - [Step 2: Verify Prerequisites](#step-2-verify-prerequisites)
    - [Step 3: Build the Application](#step-3-build-the-application)
  - [🎮 Usage](#-usage)
    - [Starting the Logger](#starting-the-logger)
    - [Recording Combat Logs (Live)](#recording-combat-logs-live)
    - [Adjusting Log Names](#adjusting-log-names)
    - [Saving Your Logs](#saving-your-logs)
    - [Opening Existing Files](#opening-existing-files)
  - [📊 Visualizing Your Logs](#-visualizing-your-logs)
  - [❗ Troubleshooting](#-troubleshooting)
    - [Startup Issues](#startup-issues)
    - ["The system cannot find the path specified" Error](#the-system-cannot-find-the-path-specified-error)
    - [No Logs Being Captured](#no-logs-being-captured)
    - [Logs Have Wrong Names](#logs-have-wrong-names)
    - [Can't Save Logs / Logs Not Found](#cant-save-logs--logs-not-found)
  - [🤔 FAQ](#-faq)
  - [💬 Need Help?](#-need-help)
  - [👥 Credits](#-credits)
  - [📝 Notes for Advanced Users](#-notes-for-advanced-users)
    - [Manual Config Updates](#manual-config-updates)

## ✨ Features

- **Real-time Combat Logging**: Automatically captures kill and death messages during PvP
- **Network Recording**: Option to record network traffic as backup
- **File Analysis**: Analyze previously recorded `.pcap` files
- **Log Adjustment**: Manually adjust player names and guilds in logs before saving
- **Auto Format Detection**: Automatically formats logs for War of the Roses or Node Wars based on time
- **Web Visualization**: Upload logs directly to the visualization website

---

## 🔧 Prerequisites

Before installing Ikusa Logger, you need:

### Required

- **[Npcap 1.7.8+](https://npcap.com/dist/)** - Network packet capture library (Required for network monitoring)
- **[Node.js 16+](https://nodejs.org/en/download/)** - JavaScript runtime (Only needed if building from source)
- **[Python 3+](https://www.python.org/downloads/)** - Programming language (Only needed if building from source)

### Optional

- **[Wireshark](https://www.wireshark.org/download.html)** - Network protocol analyzer (Useful for backup recordings)

> **Important**: When installing Python, make sure to check the box that says **"Add Python to PATH"** during installation!

---

## 📥 Installation

### Step 1: Get the Project Files

Choose one of these methods:

**Method A: Clone with Git**

```bash
git clone https://github.com/Arkantik/ikusa_logger.git
cd ikusa_logger
```

**Method B: Download as ZIP (Recommended)**

1. Download the project: [bdo-combat-logger.zip](https://github.com/Arkantik/ikusa_logger/archive/refs/heads/main.zip)
2. Extract the ZIP file to a folder of your choice
3. Open the extracted folder

### Step 2: Verify Prerequisites

Make sure you have installed:

- Node.js (Check by opening Command Prompt and typing: `node --version`)
- Python (Check by opening Command Prompt and typing: `python --version`)

### Step 3: Build the Application

1. Locate the `build.bat` file in the project folder
2. **Double-click** `build.bat` to run it
3. If a command prompt window appears asking you to press any key, **press Enter**
4. Wait for the build process to complete (this may take several minutes)
5. When finished, you'll find the executable in `dist/ikusa-logger/ikusa-logger-win_x64.exe`

> **Note**: The first build may take few minutes as it downloads and installs all necessary dependencies.

---

## 🎮 Usage

### Starting the Logger

1. Launch `ikusa-logger-win_x64.exe` from the `dist/ikusa-logger/` folder
2. You'll see the main menu with several options

### Recording Combat Logs (Live)

1. Make sure Black Desert Online is running
2. Click the **Record** button in the main menu
3. The logger will start capturing combat messages automatically
4. Engage in PvP activities (Node War, Siege, War of the Roses)
5. When finished, the logs will be displayed in the interface

### Adjusting Log Names

After recording or opening logs, you may need to adjust the player name order:

1. Review the captured logs in the interface
2. Use the dropdown menus to set the correct order:
   - **First dropdown**: Family Name 1 (players from your alliance)
   - **Second dropdown**: Family Name 2 (the other player)
   - **Third dropdown**: Guild Name
3. The format should read: **FamilyName-1 killed/died to FamilyName-2 from Guild**
4. Click **Save** to export your corrected logs

### Saving Your Logs

1. After adjusting names, click the **Save** button
2. Choose a location and filename for your `.log` file
3. You can now upload this file to the visualization website

### Opening Existing Files

The logger can open two types of files:

**Network Capture Files** (`.pcap`, `.pcapng`)

- These are raw network recordings
- The logger will extract combat messages from them
- Useful if you recorded with Wireshark as backup

**Log Files** (`.log`)

- Previously saved combat logs
- Can be opened to adjust names if needed**Method B: Download as ZIP (Recommended)**
- Use this to fix mistakes in exported logs
  To open a file:

1. Click **Open** in the main menu
2. Select your file
3. Adjust names if needed
4. Save the corrected version

---

## 📊 Visualizing Your Logs

After saving your logs, visualize them using the Ikusa website:

1. Log in to your account on [nodewar.gg](https://nodewar.gg/account)
2. Upload your `.log` file
3. View detailed statistics, graphs, and analysis of your combat performance

The website provides:

- Kill/Death ratios
- Performance over time
- Player and guild statistics
- Interactive charts and graphs

---

## ❗ Troubleshooting

### Startup Issues

**Problem**: Logger won't start or shows errors immediately

**Solutions**:

1. Check if Npcap is properly installed:
   - Open the logger
   - Check the status message on the home screen
   - If it says "Npcap is not installed", download and install from [npcap.com](https://npcap.com/dist/)

### "The system cannot find the path specified" Error

This error usually means Python is not added to your system PATH:

1. Follow this guide to add Python to PATH: [Python PATH Configuration Guide](https://www.pythoncentral.io/add-python-to-path-python-is-not-recognized-as-an-internal-or-external-command/)
2. After adding Python to PATH, restart your computer
3. Try building again

### No Logs Being Captured

**Possible causes and solutions**:

1. **Config is outdated**: BDO changes its network structure after each weekly maintenance

   - Wait for a config update
   - Check the Discord for announcements
   - As a backup, use Wireshark to record the session, then analyze the `.pcap` file later

2. **Wrong network interface selected**:

   - Go to Settings
   - Try switching between "All" and "Default" network interfaces
   - Restart recording

3. **Firewall or antivirus blocking**:
   - Add an exception for the logger in your antivirus
   - Run the logger as Administrator

### Logs Have Wrong Names

1. Stop recording
2. In the log display, use the dropdown menus to reorder the names
3. The correct format is: **Player1 killed/died to Player2 from Guild**
4. Save the corrected logs

### Can't Save Logs / Logs Not Found

1. Make sure you've adjusted the names correctly
2. Check that you have write permissions in the save location
3. Try saving to a different folder (like Documents)

---

## 🤔 FAQ

**Q: Is this tool safe to use?**  
A: Yes, the logger only reads network packets and doesn't modify or inject anything into the game.

**Q: Will I get banned for using this?**  
A: The tool operates similarly to Wireshark and only observes network traffic. However, use at your own discretion.

**Q: Why is the config outdated after maintenance?**  
A: BDO changes its network packet structure during weekly maintenance. The config needs to be updated to match these changes. Check Discord for updates.

**Q: Can I use this during any PvP activity?**  
A: Yes! It works during Node Wars, Sieges and GvG.

**Q: Can I edit logs after saving them?**  
A: Yes! Use the Open function to load your `.log` file, adjust the names, and save again.

**Q: What if I accidentally close the logger while recording?**  
A: A warning message should appear asking you to confirm. If you lose data, you can use your Wireshark recording as backup (if you made one).

---

## 💬 Need Help?

If you're experiencing issues or have questions:

- **Discord**: Join our community server: [discord.gg/CUc38nKyDU](https://discord.gg/CUc38nKyDU)
- **GitHub Issues**: Report bugs on the [Issues page](https://github.com/Arkantik/ikusa_logger/issues)

When asking for help, please provide:

1. Your Windows version
2. The exact error message (if any)
3. What you were doing when the problem occurred
4. Screenshots if possible

---

## 👥 Credits

- **Original Creator**: ORACLE (sch-28)
- **Current Maintainer**: ArkantiK
- **Visualization Website**: [Nodewar.gg](https://nodewar.gg/combat-log)

---

## 📝 Notes for Advanced Users

### Manual Config Updates

If you need to update the config manually:

1. The config file is `config.ini` in the application folder
2. You can edit it with any text editor
3. The main values to update after BDO patches are:
   - `identifier`: Package identifier in hex
   - `guild`: Offset for guild name
   - `player_one`: Offset for first player name
   - `player_two`: Offset for second player name
   - `kill`: Offset for kill/death flag

---
