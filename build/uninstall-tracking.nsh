; CachePilot NSIS Uninstall Tracking Script
; This script is called by NSIS before uninstalling
; It sends a best-effort uninstall signal to the telemetry API

Function un.UninstallTracking
  ; Read device_id from userData
  nsExec::ExecToStack 'cmd /c type "%APPDATA%\CachePilot\telemetry-id"'
  Pop $0  ; exit code
  Pop $1  ; device_id
  
  ; Only proceed if we got a valid device_id
  StrCmp $0 "0" 0 done
  
  ; Build the JSON payload
  StrCpy $2 '{"device_id":"$1","app_version":"${VERSION}","last_active":"${__DATE__}T${__TIME__}"}'
  
  ; Send uninstall event (best effort, 3 second timeout)
  nsExec::ExecToStack 'cmd /c curl -s -m 3 -X POST https://api.cachepilot.app/api/v1/uninstall -H "Content-Type: application/json" -d "$2"'
  Pop $0  ; ignore result
  
  done:
FunctionEnd
