# Simple Git History Rewriter
# Spreads commits over 4 months

Write-Host "`n=== Git History Rewriter ===" -ForegroundColor Cyan
Write-Host "This will spread your commits over the last 4 months`n" -ForegroundColor Yellow

# Confirm
$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Aborted." -ForegroundColor Red
    exit
}

# Create backup
Write-Host "`nCreating backup branch..." -ForegroundColor Cyan
git branch backup-before-rewrite 2>$null

# Get commits
Write-Host "Analyzing commits..." -ForegroundColor Cyan
$commits = @(git log --reverse --format="%H" | Where-Object { $_ })
$count = $commits.Count

Write-Host "Found $count commits`n" -ForegroundColor Green

# Calculate dates
$start = (Get-Date).AddMonths(-4)
$daysPerCommit = 120.0 / $count

# Get current branch
$branch = git branch --show-current

# Create new branch
Write-Host "Rewriting history...`n" -ForegroundColor Cyan
git checkout --orphan temp-new-history 2>$null | Out-Null
git rm -rf . 2>$null | Out-Null

# Process each commit
for ($i = 0; $i -lt $count; $i++) {
    $commit = $commits[$i]
    $num = $i + 1
    
    # Calculate new date
    $date = $start.AddDays($i * $daysPerCommit)
    
    # Add some randomness (0-8 hours)
    $date = $date.AddHours((Get-Random -Minimum 0 -Maximum 8))
    
    # Skip weekends
    while ($date.DayOfWeek -eq 'Saturday' -or $date.DayOfWeek -eq 'Sunday') {
        $date = $date.AddDays(1)
    }
    
    $dateStr = $date.ToString("yyyy-MM-dd HH:mm:ss")
    
    # Get commit info
    $msg = git log -1 --format=%B $commit
    $author = git log -1 --format="%an <%ae>" $commit
    
    # Checkout files from this commit
    git checkout $commit -- . 2>$null | Out-Null
    git add -A 2>$null | Out-Null
    
    # Commit with new date
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    
    git commit -m $msg --author="$author" 2>$null | Out-Null
    
    Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
    
    # Progress
    $percent = [math]::Round(($num / $count) * 100)
    Write-Host "[$num/$count] $percent% - $($date.ToString('yyyy-MM-dd')) - $($msg.Split("`n")[0].Substring(0, [Math]::Min(50, $msg.Length)))" -ForegroundColor Gray
}

# Replace original branch
Write-Host "`nFinalizing..." -ForegroundColor Cyan
git branch -D $branch 2>$null | Out-Null
git branch -m $branch

Write-Host "`n✅ Done!`n" -ForegroundColor Green

# Show timeline
Write-Host "New timeline (first 15 commits):" -ForegroundColor Cyan
git log --oneline --date=short --format="%ad - %s" | Select-Object -First 15

Write-Host "`n📌 Backup saved as: backup-before-rewrite" -ForegroundColor Yellow
Write-Host "📤 To push: git push --force origin $branch`n" -ForegroundColor Yellow
