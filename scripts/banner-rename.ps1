# PowerShell script to clean up banner image filenames
# Remove (1) suffix duplicates entirely

param(
    [string]$Path = ".\public\images\banners"
)

Write-Host "Starting banner cleanup - removing (1) duplicates in: $Path" -ForegroundColor Green

$files = Get-ChildItem -Path $Path -File

$toDelete = @()

foreach ($file in $files) {
    if ($file.Name -match '\s*\(1\)') {
        $toDelete += $file.FullName
    }
}

Write-Host "Found $($toDelete.Count) (1) duplicate files to remove:" -ForegroundColor Yellow

foreach ($filePath in $toDelete) {
    Write-Host "  Will delete: $($filePath)" -ForegroundColor Cyan
}

Write-Host "Proceeding with deletion..." -ForegroundColor Yellow

foreach ($filePath in $toDelete) {
    Remove-Item -Path $filePath -Force
    Write-Host "Deleted: $($filePath | Split-Path -Leaf)" -ForegroundColor Green
}

Write-Host "Banner cleanup completed! All (1) duplicates removed." -ForegroundColor Green
