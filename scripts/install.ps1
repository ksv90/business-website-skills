param(
    [string]$Destination = (Join-Path ([Environment]::GetFolderPath('UserProfile')) '.agents\skills'),
    [string]$SourceDir = '',
    [ValidateSet('business-lead-research', 'business-website-delivery')]
    [string[]]$Skill = @('business-lead-research', 'business-website-delivery')
)
$ErrorActionPreference = 'Stop'
# Replaced when packaging release assets. Local tests use -SourceDir.
$releaseVersion = '__RELEASE_VERSION__'
if ($Skill.Count -eq 0 -or @($Skill | Select-Object -Unique).Count -ne $Skill.Count) {
    throw 'Select at least one skill without duplicates.'
}
foreach ($name in $Skill) {
    $target = Join-Path $Destination $name
    if (Test-Path -LiteralPath $target) { throw "Already exists: $target. Back up and review it before replacing." }
}
if (-not $SourceDir -and $releaseVersion -notmatch '^\d+\.\d+\.\d+$') {
    throw 'Use install.ps1 from a GitHub Release, or -SourceDir with local release assets.'
}
$workDir = Join-Path ([IO.Path]::GetTempPath()) ('business-website-install-' + [guid]::NewGuid())
New-Item -ItemType Directory -Path $workDir | Out-Null
$previousProtocol = [Net.ServicePointManager]::SecurityProtocol
try {
    [Net.ServicePointManager]::SecurityProtocol = $previousProtocol -bor [Net.SecurityProtocolType]::Tls12
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    foreach ($name in $Skill) {
        foreach ($file in @("$name.zip", "$name.zip.sha256")) {
            $local = Join-Path $workDir $file
            if ($SourceDir) {
                Copy-Item -LiteralPath (Join-Path $SourceDir $file) -Destination $local
            } else {
                Invoke-WebRequest -UseBasicParsing -Uri "https://github.com/ksv90/business-website-skills/releases/download/v$releaseVersion/$file" -OutFile $local
            }
        }
        $archive = Join-Path $workDir "$name.zip"
        $expected = ((Get-Content -LiteralPath "$archive.sha256" -Raw).Trim() -split '\s+')[0]
        $actual = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
        if ($expected -notmatch '^[0-9a-fA-F]{64}$' -or $actual -ne $expected) { throw "SHA-256 mismatch: $name" }
        $zip = [IO.Compression.ZipFile]::OpenRead($archive)
        try {
            foreach ($entry in $zip.Entries) {
                $path = $entry.FullName
                if (-not $path.StartsWith("$name/", [StringComparison]::Ordinal) -or $path.Contains('\') -or $path -match '(^|/)\.\.(/|$)') {
                    throw 'Unexpected archive path'
                }
                # Unix ZIP symlinks must not be installed as trusted skill files.
                if ((($entry.ExternalAttributes -shr 16) -band 0xF000) -eq 0xA000) { throw 'Symlink in archive' }
            }
        } finally { $zip.Dispose() }
        $unpacked = Join-Path $workDir 'unpacked'
        Expand-Archive -LiteralPath $archive -DestinationPath $unpacked
        if (-not (Test-Path -LiteralPath (Join-Path $unpacked "$name/SKILL.md") -PathType Leaf)) { throw 'SKILL.md missing' }
    }
    # Both archives must pass before either skill is installed.
    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    foreach ($name in $Skill) {
        Move-Item -LiteralPath (Join-Path $unpacked $name) -Destination $Destination
        Write-Output "Installed: $(Join-Path $Destination $name)"
    }
} finally {
    [Net.ServicePointManager]::SecurityProtocol = $previousProtocol
    Remove-Item -LiteralPath $workDir -Recurse -Force
}
