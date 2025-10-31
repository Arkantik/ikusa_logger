#define MyAppName "BDO Combat Logger"
#define MyAppVersion "1.10.0"
#define MyAppPublisher "arkantik"
#define MyAppURL "https://nodewar.gg/"
#define MyAppExeName "bdo-combat-logger-win_x64.exe"
#define MyAppIcoName "icon-2.ico"

[Setup]
AppId={{43CB38E6-372B-4BC6-A2FA-EC72E1ADC671}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\BDO-combat-logger
DisableProgramGroupPage=yes
OutputDir=output
OutputBaseFilename=bdo-combat-installer
Compression=lzma
SolidCompression=yes
WizardStyle=modern
SetupIconFile=".\logger\icon\{#MyAppIcoName}"
UninstallDisplayName="Uninstall BDO Combat Logger"
UninstallDisplayIcon=".\logger\icon\{#MyAppIcoName}"
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Main application files
Source: ".\dist\bdo-combat-logger\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\update.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\dist\bdo-combat-logger\resources.neu"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\logger\icon\{#MyAppIcoName}"; DestDir: "{app}"; Flags: ignoreversion
Source: ".\dist\bdo-combat-logger\logger\*"; DestDir: "{app}\logger\"; Flags: ignoreversion recursesubdirs createallsubdirs

; Include Npcap installer
Source: ".\dependencies\npcap-1.84.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppIcoName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppIcoName}"; Tasks: desktopicon

[Run]
; Install Npcap silently if not already installed
Filename: "{tmp}\npcap-1.84.exe"; Parameters: "/S"; StatusMsg: "Installing Npcap driver..."; Flags: waituntilterminated; Check: NeedsNpcap

; Launch application
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent runascurrentuser

[Code]
function NeedsNpcap: Boolean;
var
  NpcapPath: String;
begin
  // Check if npcap.sys exists in System32\drivers
  NpcapPath := ExpandConstant('{sys}\drivers\npcap.sys');
  Result := not FileExists(NpcapPath);
  
  if Result then
    Log('Npcap not found, will install')
  else
    Log('Npcap already installed, skipping');
end;

function InitializeSetup(): Boolean;
begin
  Result := True;
  
  // Check if we're running as admin (already handled by PrivilegesRequired=admin)
  if not IsAdmin then
  begin
    MsgBox('This installer requires administrator privileges to install Npcap driver.', mbError, MB_OK);
    Result := False;
  end;
end;