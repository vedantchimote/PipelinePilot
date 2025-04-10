# Script to rewrite git history to spread commits over 4 months
# WARNING: This rewrites git history. Use with caution!

Write-Host "⚠️  WARNING: This will rewrite git history!" -ForegroundColor Yellow
Write-Host "Only proceed if you haven't pushed to remote, or are okay with force-push." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Aborted." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Rewriting git history to spread over 4 months..." -ForegroundColor Cyan
Write-Host ""

# Get current date
$currentDate = Get-Date

# Calculate 4 months ago (approximately 120 days)
$fourMonthsAgo = $currentDate.AddDays(-120)

# Get list of all commits in reverse order (oldest first)
$commits = git rev-list --reverse HEAD
$commitArray = $commits -split "`n"
$commitCount = $commitArray.Count

Write-Host "Found $commitCount commits to rewrite" -ForegroundColor Green
Write-Host ""

# Calculate time increment (120 days / number of commits)
$timeIncrementMinutes = (120 * 24 * 60) / $commitCount

# Create a temporary branch
$originalBranch = git branch --show-current
git checkout --orphan temp-rewrite

# Counter
$counter = 0

# Process each commit
foreach ($commit in $commitArray) {
    if ([string]::IsNullOrWhiteSpace($commit)) { continue }
    
    $counter++
    
    # Calculate new date for this commit
    $newDate = $fourMonthsAgo.AddMinutes($counter * $timeIncrementMinutes)
    $newDateStr = $newDate.ToString("yyyy-MM-dd HH:mm:ss")
    
    # Get commit details
    $commitMsg = git log -1 --format=%B $commit
    $commitAuthor = git log -1 --format="%an <%ae>" $commit
    
    # Get the tree of this commit
    $tree = git rev-parse "$commit^{tree}"
    
    # Truncate message for display
    $displayMsg = if ($commitMsg.Length -gt 60) { $commitMsg.Substring(0, 60) + "..." } else { $commitMsg }
    Write-Host "[$counter/$commitCount] Rewriting: $displayMsg" -ForegroundColor Gray
    
    # Create new commit with modified date
    $env:GIT_AUTHOR_DATE = $newDateStr
    $env:GIT_COMMITTER_DATE = $newDateStr
    
    $newCommit = git commit-tree $tree -p HEAD -m $commitMsg 2>$null
    git reset --hard $newCommit 2>$null
    
    Remove-Item Env:\GIT_AUTHOR_DATE
    Remove-Item Env:\GIT_COMMITTER_DATE
}

# Replace original branch with rewritten history
git branch -D $originalBranch 2>$null
git branch -m $originalBranch

Write-Host ""
Write-Host "✅ Git history rewritten successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Commit timeline:" -ForegroundColor Cyan
git log --oneline --date=short --pretty=format:"%ad - %s" | Select-Object -First 20
Write-Host ""
Write-Host ""
Write-Host "⚠️  To push to remote (if already pushed before):" -ForegroundColor Yellow
Write-Host "    git push --force origin main" -ForegroundColor Yellow
Write-Host ""
