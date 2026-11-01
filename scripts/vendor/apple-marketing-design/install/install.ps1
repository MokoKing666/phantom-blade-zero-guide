<#
.SYNOPSIS
    Apple Marketing Design Language — Windows 安装脚本

.EXAMPLE
    .\install\install.ps1
    .\install\install.ps1 -Target codex
    .\install\install.ps1 -Target dir -Dir "D:\agent\skills"
#>

param(
    [ValidateSet('claude', 'codex', 'cursor', 'gemini', 'dir')]
    [string]$Target = 'claude',

    [string]$Dir = ''
)

$ErrorActionPreference = 'Stop'

$SkillName = 'apple-marketing-design'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SrcDir    = Split-Path -Parent $ScriptDir

if (-not (Test-Path (Join-Path $SrcDir 'SKILL.md'))) {
    Write-Error "在 $SrcDir 下找不到 SKILL.md，请在仓库目录内运行本脚本"
    exit 1
}

switch ($Target) {
    'claude' {
        $Dest = Join-Path $HOME ".claude\skills\$SkillName"
    }
    'codex'  { $Dest = Join-Path (Get-Location) ".agent-skills\$SkillName" }
    'cursor' { $Dest = Join-Path (Get-Location) ".agent-skills\$SkillName" }
    'gemini' { $Dest = Join-Path (Get-Location) ".agent-skills\$SkillName" }
    'dir' {
        if ([string]::IsNullOrWhiteSpace($Dir)) {
            Write-Error "-Target dir 需要同时指定 -Dir 「路径」"
            exit 1
        }
        $Dest = Join-Path $Dir $SkillName
    }
}

# 安全护栏：仅当目标目录确实是本技能时才覆盖
if (Test-Path $Dest) {
    $marker = Join-Path $Dest 'SKILL.md'
    $isOurs = $false
    if (Test-Path $marker) {
        $isOurs = (Get-Content $marker -TotalCount 5 -Encoding UTF8) -match "^name:\s+$SkillName"
    }
    if ($isOurs) {
        Write-Host "检测到已安装版本，将覆盖: $Dest"
        Remove-Item $Dest -Recurse -Force
    } else {
        Write-Error "$Dest 已存在且不是本技能，为避免误删已中止。请先手动移走该目录，或改用 -Target dir -Dir 「其他路径」"
        exit 1
    }
}

$parent = Split-Path -Parent $Dest
if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
New-Item -ItemType Directory -Path $Dest -Force | Out-Null

foreach ($item in @('SKILL.md', 'references', 'assets', 'scripts')) {
    Copy-Item -Path (Join-Path $SrcDir $item) -Destination $Dest -Recurse -Force
}

Write-Host "已安装到: $Dest"
Write-Host ""

switch ($Target) {
    'claude' {
        Write-Host "下一步: 重启会话，然后用自然语言描述任务即可，例如"
        Write-Host '  「做一个产品落地页，风格要极简、大留白」'
    }
    'codex' {
        Write-Host "下一步: 在项目根目录的 AGENTS.md 中加入一行"
        Write-Host "  - 设计类任务请先阅读 .agent-skills/$SkillName/SKILL.md"
    }
    'cursor' {
        Write-Host "下一步: 新建 .cursor/rules/$SkillName.mdc，内容为"
        Write-Host '  ---'
        Write-Host '  description: Apple 风格营销设计规范'
        Write-Host '  alwaysApply: false'
        Write-Host '  ---'
        Write-Host "  设计类任务请先阅读 .agent-skills/$SkillName/SKILL.md"
    }
    'gemini' {
        Write-Host "下一步: 在 GEMINI.md 中加入一行"
        Write-Host "  - 设计类任务请先阅读 .agent-skills/$SkillName/SKILL.md"
    }
    'dir' {
        Write-Host "下一步: 在你的工具中把该目录注册为技能目录。"
    }
}
