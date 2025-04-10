# PowerShell script to spread git commits over 4 months
# This creates a realistic commit history

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Git History Rewriter - Spread Commits Over 4 Months      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  WARNING: This will rewrite git history!" -ForegroundColor Yellow
Write-Host "   - Only use if you haven't pushed to remote yet" -ForegroundColor Yellow
Write-Host "   - Or if you're okay with force-pushing" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Aborted." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Analyzing current commits..." -ForegroundColor Cyan

# Get all commits
$commits = git log --reverse --format="%H|%s" | ForEach-Object { $_ -split '\|' }
$commitCount = ($commits | Measure-Object).Count / 2

Write-Host "   Found: $commitCount commits" -ForegroundColor Green
Write-Host ""

# Define start date (4 months ago)
$startDate = (Get-Date).AddMonths(-4)
$endDate = Get-Date

Write-Host "📅 Timeline:" -ForegroundColor Cyan
Write-Host "   Start: $($startDate.ToString('yyyy-MM-dd'))" -ForegroundColor Gray
Write-Host "   End:   $($endDate.ToString('yyyy-MM-dd'))" -ForegroundColor Gray
Write-Host ""

# Calculate days between
$totalDays = ($endDate - $startDate).TotalDays
$daysPerCommit = $totalDays / $commitCount

Write-Host "🔄 Rewriting history..." -ForegroundColor Cyan
Write-Host ""

# Create backup branch
git branch backup-before-rewrite 2>$null

# Get original branch name
$originalBranch = git branch --show-current

# Create filter script
$filterScript = @"
#!/bin/bash
# Auto-generated filter script

# Get commit number (1-indexed)
COMMIT_NUM=`$(git rev-list --reverse HEAD | grep -n `$GIT_COMMIT | cut -d: -f1)

# Calculate date
START_TIMESTAMP=$($startDate.ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss'))
DAYS_PER_COMMIT=$daysPerCommit

# Calculate new timestamp
NEW_DATE=`$(date -d "`$START_TIMESTAMP + `$((`$COMMIT_NUM * `$DAYS_PER_COMMIT)) days" "+%Y-%m-%d %H:%M:%S")

export GIT_AUTHOR_DATE="`$NEW_DATE"
export GIT_COMMITTER_DATE="`$NEW_DATE"
"@

# For Windows, we'll use a different approach with git rebase
Write-Host "   Creating new timeline..." -ForegroundColor Gray

# Get list of commits with their hashes
$commitList = git log --reverse --format="%H" | ForEach-Object { $_.Trim() }
$commitArray = @($commitList)

# Create a new orphan branch
git checkout --orphan temp-timeline 2>$null
git rm -rf . 2>$null

$counter = 0
foreach ($commitHash in $commitArray) {
    $counter++
    
    # Calculate new date
    $newDate = $startDate.AddDays($counter * $daysPerCommit)
    $dateStr = $newDate.ToString("yyyy-MM-dd HH:mm:ss")
    
    # Get commit message and author
    $commitMsg = git log -1 --format=%B $commitHash
    $author = git log -1 --format="%an <%ae>" $commitHash
    
    # Get files from this commit
    git checkout $commitHash -- . 2>$null
    
    # Stage all changes
    git add -A 2>$null
    
    # Create commit with new date
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    
    git commit -m $commitMsg --author="$author" 2>$null | Out-Null
    
    # Progress indicator
    $percent = [math]::Round(($counter / $commitArray.Count) * 100)
    Write-Progress -Activity "Rewriting commits" -Status "$counter of $($commitArray.Count)" -PercentComplete $percent
    
    # Clean up env vars
    Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
}

Write-Progress -Activity "Rewriting commits" -Completed

# Replace original branch
git branch -D $originalBranch 2>$null
git branch -m $originalBranch

Write-Host ""
Write-Host "✅ Success! Git history has been rewritten." -ForegroundColor Green
Write-Host ""

# Show new timeline
Write-Host "📊 New commit timeline (first 20):" -ForegroundColor Cyan
Write-Host ""
git log --oneline --date=short --format="%ad - %s" | Select-Object -First 20 | ForEach-Object {
    Write-Host "   $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "💾 Backup created: 'backup-before-rewrite' branch" -ForegroundColor Yellow
Write-Host ""
Write-Host "📤 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review the new history: git log --oneline --date=short" -ForegroundColor Gray
Write-Host "   2. If satisfied, push to remote: git push --force origin $originalBranch" -ForegroundColor Gray
Write-Host "   3. If not satisfied, restore: git checkout backup-before-rewrite" -ForegroundColor Gray
Write-Host ""
