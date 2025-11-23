@echo off
REM Image HTML Converter - Converts <img> tags to <picture> elements
REM Usage: convert-images.bat [file.html]

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo.
    echo Usage: %~nx0 ^<html-file^>
    echo Example: %~nx0 index.html
    echo.
    exit /b 1
)

set FILE=%~1

if not exist "%FILE%" (
    echo Error: File '%FILE%' not found
    exit /b 1
)

REM Backup original
copy "%FILE%" "%FILE%.backup" >nul
echo ✓ Backup created: %FILE%.backup

REM Create temporary PowerShell script for regex replacement
(
    echo $content = Get-Content '%FILE%' -Raw
    echo $pattern = '<img\s+src="([^"]+)"\s+alt="([^"]+)"'
    echo $replacement = '<picture>' + [Environment]::NewLine + '  <source srcset="$1" type="image/webp">' + [Environment]::NewLine + '  <source srcset="$1" type="image/jpeg">' + [Environment]::NewLine + '  <img src="$1" alt="$2" loading="lazy" decoding="async">' + [Environment]::NewLine + '</picture>'
    echo $newContent = [regex]::Replace($content, $pattern, $replacement)
    echo Set-Content '%FILE%' -Value $newContent
) > "%TEMP%\convert-img.ps1"

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "%TEMP%\convert-img.ps1"

echo ✓ HTML file updated: %FILE%
echo Note: Review the changes and adjust WebP paths if needed

REM Cleanup
del /q "%TEMP%\convert-img.ps1"

exit /b 0
