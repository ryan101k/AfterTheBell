param(
  [switch]$Watch
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LocalTweego = Join-Path $PSScriptRoot 'tweego\tweego.exe'
$SourceDir = Join-Path $ProjectRoot 'src'
$BuildDir = Join-Path $ProjectRoot 'build'
$OutputFile = Join-Path $BuildDir 'index.html'

if (Test-Path -LiteralPath $LocalTweego) {
  $Tweego = $LocalTweego
} else {
  $TweegoCommand = Get-Command tweego -ErrorAction SilentlyContinue
  if (-not $TweegoCommand) {
    throw 'Tweego를 찾을 수 없습니다. tools\tweego\tweego.exe를 설치하거나 tweego를 PATH에 추가하세요.'
  }
  $Tweego = $TweegoCommand.Source
}

New-Item -ItemType Directory -Force -Path $BuildDir | Out-Null
$Arguments = @('-f', 'sugarcube-2', '-o', $OutputFile)
if ($Watch) { $Arguments += '-w' }
$Arguments += $SourceDir

Write-Host "Building 폐장 후, 우리 -> $OutputFile"
& $Tweego @Arguments
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

