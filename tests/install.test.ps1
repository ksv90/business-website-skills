$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$testRoot = Join-Path $repoRoot ('.build/install-test-' + [guid]::NewGuid())
$installer = Join-Path $repoRoot 'scripts/install.ps1'
try {
    $assets = Join-Path $testRoot 'assets'
    New-Item -ItemType Directory -Path $assets -Force | Out-Null
    foreach ($name in @('business-lead-research', 'business-website-delivery')) {
        $skillDir = Join-Path $testRoot $name
        New-Item -ItemType Directory -Path $skillDir | Out-Null
        Set-Content -LiteralPath (Join-Path $skillDir 'SKILL.md') -Value "Synthetic fixture: $name"
        $archive = Join-Path $assets "$name.zip"
        Compress-Archive -LiteralPath $skillDir -DestinationPath $archive
        $hash = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
        Set-Content -LiteralPath "$archive.sha256" -Value "$hash  $name.zip"
    }
    $destination = Join-Path $testRoot 'skills with spaces'
    & $installer -SourceDir $assets -Destination $destination
    foreach ($name in @('business-lead-research', 'business-website-delivery')) {
        if (-not (Test-Path -LiteralPath (Join-Path $destination "$name/SKILL.md"))) { throw 'Skill missing' }
    }
    $edited = Join-Path $destination 'business-lead-research/SKILL.md'
    Set-Content -LiteralPath $edited -Value 'user edit'
    $rejected = $false
    try { & $installer -SourceDir $assets -Destination $destination } catch { $rejected = $true }
    if (-not $rejected -or (Get-Content -LiteralPath $edited -Raw).Trim() -ne 'user edit') { throw 'Existing installation modified' }
    Add-Content -LiteralPath (Join-Path $assets 'business-website-delivery.zip') -Value 'tampered'
    $rejected = $false
    $blocked = Join-Path $testRoot 'must-not-install'
    try { & $installer -SourceDir $assets -Destination $blocked } catch { $rejected = $true }
    if (-not $rejected -or (Test-Path -LiteralPath $blocked)) { throw 'Checksum failure did not prevent installation' }
    Write-Output 'OK Windows native installer: both skills, paths with spaces, preservation, checksum failure'
} finally {
    if (Test-Path -LiteralPath $testRoot) { Remove-Item -LiteralPath $testRoot -Recurse -Force }
}
