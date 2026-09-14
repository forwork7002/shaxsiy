# =====================================================================
#  Zaxirani SERVERDAN shu kompyuterga tortish (Windows)
#
#      .\deploy\pull-backup.ps1
#      .\deploy\pull-backup.ps1 -Server root@138.68.111.121 -Dest D:\dash-zaxira
#
#  Nega kerak: serverdagi hamma nusxa — tirik ma'lumot, kunlik JSON zaxiralar
#  va dash.db nusxalari — BITTA diskda yotadi. Droplet yo'qolsa yoki disk
#  buzilsa, ularning hammasi birga ketadi. Faqat shu yerga tushgan nusxa
#  serverdan mustaqil.
#
#  Har tortishdan keyin serverga «.offsite» belgisi yoziladi — ilovadagi
#  «Ma'lumot sog'ligi» paneli shuni o'qiydi va nusxa 7 kundan eskirsa
#  qizil chiziq ko'rsatadi.
#
#  Avtomatik qilish:  .\deploy\schedule-backup.ps1
# =====================================================================
[CmdletBinding()]
param(
  [string]$Server = "root@138.68.111.121",
  [string]$Dest   = "$env:USERPROFILE\dash-zaxira",
  [switch]$Quiet                      # jadval bo'yicha ishlaganda — faqat xatolar
)

$ErrorActionPreference = "Stop"
$AppDir = "/opt/shaxsiy"
$LogFile = Join-Path $Dest "zaxira.log"

function Say([string]$m, [string]$color = "Gray") {
  if (-not $Quiet) { Write-Host $m -ForegroundColor $color }
}
function Log([string]$m) {
  $line = "{0}  {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $m
  try { Add-Content -Path $LogFile -Value $line -Encoding utf8 } catch {}
}
function Die([string]$m) {
  Write-Host "X $m" -ForegroundColor Red
  Log "XATO: $m"
  exit 1
}

if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }

# ── 1. Serverdan tortish ────────────────────────────────────────────
# Binar oqim: PowerShell 5.1 da `ssh ... > fayl` matn sifatida yozadi va arxivni
# buzadi. Shuning uchun jarayon oqimi to'g'ridan-to'g'ri faylga ko'chiriladi.
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$out   = Join-Path $Dest "dash-$stamp.tgz"
$tarCmd = "tar czf - -C $AppDir --exclude='data/.secret' --exclude='data/*.whoop.json' " +
          "--exclude='data/.lock.*' --exclude='data/export-*.zip' --warning=no-file-changed data"

Say "> Serverdan olinmoqda -> $out" "Cyan"
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName  = "ssh"
$psi.Arguments = "-o BatchMode=yes -o ConnectTimeout=20 $Server ""$tarCmd"""
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError  = $true
$psi.CreateNoWindow = $true

try {
  $proc = [System.Diagnostics.Process]::Start($psi)
} catch {
  Die "ssh ishga tushmadi: $($_.Exception.Message)"
}
$errTask = $proc.StandardError.ReadToEndAsync()
$fs = [System.IO.File]::Create($out)
try {
  $proc.StandardOutput.BaseStream.CopyTo($fs)
} finally {
  $fs.Close()
}
$proc.WaitForExit()
$stderr = $errTask.Result

# tar ishlab turgan ilovaning fayli o'zgarganda 1 qaytaradi — bu nosozlik emas.
# Ikkidan katta kod esa haqiqiy xato (ssh ulanmadi, papka yo'q, ruxsat yetmadi).
if ($proc.ExitCode -gt 1) {
  Remove-Item $out -Force -ErrorAction SilentlyContinue
  Die "server javob bermadi (ssh $($proc.ExitCode)): $stderr"
}
$size = (Get-Item $out).Length
if ($size -lt 1024) {
  Remove-Item $out -Force -ErrorAction SilentlyContinue
  Die "bo'sh fayl keldi ($size bayt) — zaxira olinmadi"
}

# ── 2. Tekshirish ───────────────────────────────────────────────────
# `tar -tzf` butun oqimni ochib ko'radi: gzip CRC buzilgan bo'lsa shu yerda
# bilinadi. Tekshirilmagan zaxira — zaxira emas.
Say "> Tekshirilmoqda..."
$list = & tar -tzf $out
if ($LASTEXITCODE -ne 0) {
  Remove-Item $out -Force -ErrorAction SilentlyContinue
  Die "arxiv ochilmadi (buzilgan yuklab olish)"
}
$states = @($list | Where-Object { $_ -match '^data/[^/]+\.json$' -and $_ -notmatch '\.(who|whoop)\.json$' })
$hasDb  = @($list | Where-Object { $_ -eq 'data/dash.db' }).Count -gt 0
$dbCopies = @($list | Where-Object { $_ -match '^data/backups/dash-.*\.db(\.gz)?$' }).Count

if ($states.Count -lt 1) {
  Remove-Item $out -Force -ErrorAction SilentlyContinue
  Die "birorta ham <uid>.json topilmadi — zaxira yaroqsiz"
}
$mb = [math]::Round($size / 1MB, 2)
Say ("  hajmi: {0} MB · holat fayllari: {1} ta · arxiv: {2} · baza nusxalari: {3} ta" -f `
     $mb, $states.Count, $(if ($hasDb) { "bor" } else { "YO'Q" }), $dbCopies) "Green"

# ── 3. Serverga belgi qo'yish ───────────────────────────────────────
# Ilova shu belgiga qarab «oxirgi tashqi nusxa N kun oldin» deb ko'rsatadi.
$mark = "date -Iseconds > $AppDir/data/.offsite; chown shaxsiy:shaxsiy $AppDir/data/.offsite; chmod 600 $AppDir/data/.offsite"
& ssh -o BatchMode=yes -o ConnectTimeout=20 $Server $mark | Out-Null
if ($LASTEXITCODE -ne 0) { Say "  ogohlantirish: serverga belgi qo'yilmadi" "Yellow" }

# ── 4. Eski nusxalarni avlodlarga ajratish ──────────────────────────
#   14 kun — hammasi · 8 hafta — haftasiga bitta · 24 oy — oyiga bitta
#   undan narisi — YILIGA BITTA, ABADIY (server tomonidagi qoida bilan bir xil)
$now = Get-Date
$keep = New-Object 'System.Collections.Generic.HashSet[string]'
$dropped = 0
$files = Get-ChildItem -Path $Dest -Filter "dash-*.tgz" | Sort-Object Name -Descending
foreach ($f in $files) {
  if ($f.Name -notmatch '(\d{4})-(\d{2})-(\d{2})') { continue }
  $d = Get-Date -Year $Matches[1] -Month $Matches[2] -Day $Matches[3] -Hour 0 -Minute 0 -Second 0
  $age = [int]($now.Date - $d.Date).TotalDays
  if ($age -lt 14) {
    $bucket = "d:" + $d.ToString("yyyy-MM-dd")
  } elseif ($age -lt 70) {
    # ISOWeek klassi PowerShell 5.1 (.NET Framework) da yo'q — taqvimning o'zidan olamiz
    $wk = (Get-Culture).Calendar.GetWeekOfYear($d, [System.Globalization.CalendarWeekRule]::FirstFourDayWeek, [System.DayOfWeek]::Monday)
    $bucket = "w:" + $d.ToString("yyyy") + "-" + $wk
  } elseif ($age -lt 744) {
    $bucket = "m:" + $d.ToString("yyyy-MM")
  } else {
    $bucket = "y:" + $d.ToString("yyyy")
  }
  if ($keep.Contains($bucket)) {
    Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue
    $dropped++
  } else {
    [void]$keep.Add($bucket)
  }
}

$total = @(Get-ChildItem -Path $Dest -Filter "dash-*.tgz").Count
$totalMb = [math]::Round((Get-ChildItem -Path $Dest -Filter "dash-*.tgz" | Measure-Object Length -Sum).Sum / 1MB, 1)
if ($dropped -gt 0) { Say "  siyraklashtirildi: $dropped ta eski nusxa olib tashlandi" }
Say ("v tayyor - jami {0} ta nusxa, {1} MB ({2})" -f $total, $totalMb, $Dest) "Green"
Log "OK: $($out | Split-Path -Leaf) · $mb MB · holat $($states.Count) · nusxalar $total"
exit 0
