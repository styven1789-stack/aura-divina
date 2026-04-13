# Saves the image currently on the Windows clipboard to
# public/brand/aura-divina-full.png. Usage:
#
#   1. Right-click the logo image (in the chat, your file explorer, browser...)
#      and choose "Copy image" / "Copy". Make sure it's an image on the
#      clipboard, not a file path.
#   2. From the project root run:
#        powershell -ExecutionPolicy Bypass -File scripts/save-logo.ps1
#   3. Done. Reload the site.

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$targetDir = Join-Path $PSScriptRoot "..\public\brand"
$targetPath = Join-Path $targetDir "aura-divina-full.png"

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

if ([System.Windows.Forms.Clipboard]::ContainsImage()) {
    $img = [System.Windows.Forms.Clipboard]::GetImage()
    $img.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Dispose()
    Write-Host "[OK] Logo saved to: $targetPath" -ForegroundColor Green
    Write-Host "     Size: $((Get-Item $targetPath).Length) bytes"
    Write-Host "     Reload your browser with Ctrl+Shift+R."
} else {
    Write-Host "[ERROR] No image on the clipboard." -ForegroundColor Red
    Write-Host "        Right-click the logo and choose 'Copy image' first,"
    Write-Host "        then re-run this script."
    exit 1
}
