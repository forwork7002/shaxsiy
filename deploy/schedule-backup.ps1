# =====================================================================
#  Zaxirani avtomatik qilish (Windows Task Scheduler)
#
#      .\deploy\schedule-backup.ps1                 — har kuni 21:00 da
#      .\deploy\schedule-backup.ps1 -At 09:30       — boshqa vaqtda
#      .\deploy\schedule-backup.ps1 -Now            — darhol bir marta ishlatib ko'rish
#      .\deploy\schedule-backup.ps1 -Remove         — jadvalni olib tashlash
#
#  Nima qiladi: har kuni pull-backup.ps1 ni ishga tushiradi. Kompyuter o'chiq
#  bo'lsa, yoqilganda o'tkazib yuborilgan tortishni o'zi bajaradi
#  (StartWhenAvailable) — ya'ni «esimdan chiqdi» degan xavf yo'qoladi.
#
#  Administrator huquqi shart emas: vazifa shu foydalanuvchi nomidan yoziladi.
# =====================================================================
[CmdletBinding()]
param(
  [string]$Server = "root@138.68.111.121",
  [string]$Dest   = "$env:USERPROFILE\dash-zaxira",
  [string]$At     = "21:00",
  [switch]$Now,
  [switch]$Remove
)

$ErrorActionPreference = "Stop"
$TaskName = "Shaxsiy Dashboard — kunlik zaxira"
$Script = Join-Path $PSScriptRoot "pull-backup.ps1"

if ($Remove) {
  $t = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($t) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "v jadval olib tashlandi" -ForegroundColor Green
  } else {
    Write-Host "  bunday jadval yo'q edi" -ForegroundColor Yellow
  }
  exit 0
}

if (-not (Test-Path $Script)) { throw "pull-backup.ps1 topilmadi: $Script" }

$taskArgs = "-NoProfile -ExecutionPolicy Bypass -File ""$Script"" -Server ""$Server"" -Dest ""$Dest"" -Quiet"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $taskArgs
$trigger = New-ScheduledTaskTrigger -Daily -At $At
# StartWhenAvailable — kompyuter o'chiq bo'lgan kunning tortishini keyin bajaradi.
# RunOnlyIfNetworkAvailable — internetsiz bexuda urinib xatolik yozmaydi.
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable `
            -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries `
            -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
  -Description "Serverdagi ma'lumotni shu kompyuterga tortadi va tekshiradi. Nusxalar: $Dest" -Force | Out-Null

Write-Host "v jadval yozildi" -ForegroundColor Green
Write-Host "  vaqti:    har kuni $At (kompyuter o'chiq bo'lsa — yoqilganda)"
Write-Host "  qayerga:  $Dest"
Write-Host "  jurnal:   $Dest\zaxira.log"
Write-Host ""
Write-Host "  Tekshirish:  Get-ScheduledTask -TaskName '$TaskName' | Get-ScheduledTaskInfo"
Write-Host "  Olib tashlash: .\deploy\schedule-backup.ps1 -Remove"

if ($Now) {
  Write-Host ""
  Write-Host "> Hozir bir marta ishlatib ko'ramiz..." -ForegroundColor Cyan
  Start-ScheduledTask -TaskName $TaskName
  Start-Sleep -Seconds 5
  $info = Get-ScheduledTaskInfo -TaskName $TaskName
  Write-Host ("  oxirgi natija: {0}" -f $info.LastTaskResult)
}
