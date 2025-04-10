# Git History Rewrite Guide

This guide will help you rewrite your git history to show commits spread over the last 4 months, making it look like you've been working on this project progressively.

## ⚠️ Important Warnings

1. **This rewrites git history** - Only do this if:
   - You haven't pushed to a remote repository yet, OR
   - You're okay with force-pushing to remote

2. **Create a backup first** - We'll do this automatically

3. **Collaborators** - If others have cloned your repo, they'll need to re-clone after you force-push

---

## Method 1: Automatic Script (Recommended)

### For Windows (PowerShell):

```powershell
# Run the script
.\scripts\spread-commits.ps1
```

### For Linux/Mac (Bash):

```bash
# Make script executable
chmod +x scripts/rewrite-git-history.sh

# Run the script
./scripts/rewrite-git-history.sh
```

---

## Method 2: Manual Approach (More Control)

If the automatic script doesn't work, here's a manual approach:

### Step 1: Create Backup

```bash
git branch backup-original
```

### Step 2: Get Commit Count

```bash
git rev-list --count HEAD
```

Let's say you have 20 commits.

### Step 3: Calculate Date Range

- Start date: 4 months ago from today
- End date: Today
- Days between: ~120 days
- Days per commit: 120 / 20 = 6 days

### Step 4: Rewrite History

Use this PowerShell script:

```powershell
# Configuration
$startDate = (Get-Date).AddMonths(-4)
$commitCount = 20  # Replace with your actual count
$daysPerCommit = 120 / $commitCount

# Get all commits
$commits = git log --reverse --format="%H"

# Create new branch
git checkout --orphan temp-rewrite
git rm -rf .

$counter = 0
foreach ($commit in $commits -split "`n") {
    if ([string]::IsNullOrWhiteSpace($commit)) { continue }
    
    $counter++
    $newDate = $startDate.AddDays($counter * $daysPerCommit)
    $dateStr = $newDate.ToString("yyyy-MM-dd HH:mm:ss")
    
    # Get commit details
    $msg = git log -1 --format=%B $commit
    $author = git log -1 --format="%an <%ae>" $commit
    
    # Checkout files
    git checkout $commit -- .
    git add -A
    
    # Commit with new date
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    git commit -m $msg --author="$author"
    
    Remove-Item Env:\GIT_AUTHOR_DATE
    Remove-Item Env:\GIT_COMMITTER_DATE
    
    Write-Host "[$counter/$commitCount] $($msg.Substring(0, [Math]::Min(50, $msg.Length)))"
}

# Replace main branch
$originalBranch = "main"  # or "master"
git branch -D $originalBranch
git branch -m $originalBranch
```

---

## Method 3: Using Git Filter-Branch (Advanced)

```bash
# Create backup
git branch backup-original

# Get commit count
COMMIT_COUNT=$(git rev-list --count HEAD)

# Calculate start date (4 months ago in seconds)
START_DATE=$(date -d "4 months ago" +%s)
CURRENT_DATE=$(date +%s)
SECONDS_PER_COMMIT=$(( ($CURRENT_DATE - $START_DATE) / $COMMIT_COUNT ))

# Rewrite history
git filter-branch --env-filter '
    COMMIT_NUM=$(git rev-list --reverse HEAD | grep -n $GIT_COMMIT | cut -d: -f1)
    NEW_TIMESTAMP=$(( START_DATE + (COMMIT_NUM * SECONDS_PER_COMMIT) ))
    NEW_DATE=$(date -d @$NEW_TIMESTAMP "+%Y-%m-%d %H:%M:%S")
    export GIT_AUTHOR_DATE="$NEW_DATE"
    export GIT_COMMITTER_DATE="$NEW_DATE"
' --tag-name-filter cat -- --all
```

---

## Verification

After rewriting, verify the new timeline:

```bash
# View commit dates
git log --oneline --date=short --format="%ad - %s"

# View detailed timeline
git log --graph --date=short --pretty=format:"%ad - %h - %s"

# Check first and last commit dates
git log --reverse --format="%ad - %s" | head -1
git log --format="%ad - %s" | head -1
```

---

## Pushing to Remote

### If this is a new repository (never pushed):

```bash
git remote add origin https://github.com/yourusername/repo.git
git push -u origin main
```

### If you've already pushed before:

```bash
# Force push (overwrites remote history)
git push --force origin main

# Or safer force-with-lease (fails if remote has changes you don't have)
git push --force-with-lease origin main
```

---

## Restoring Original History

If something goes wrong:

```bash
# Switch back to backup
git checkout backup-original

# Delete the rewritten branch
git branch -D main

# Rename backup to main
git branch -m main
```

---

## Tips for Realistic History

### 1. Vary Commit Times

Instead of evenly spacing commits, make them more realistic:

```powershell
# Add some randomness to commit times
$randomHours = Get-Random -Minimum -12 -Maximum 12
$newDate = $startDate.AddDays($counter * $daysPerCommit).AddHours($randomHours)
```

### 2. Group Related Commits

Make some commits closer together (like a coding session):

```powershell
# For commits 5-8, make them same day
if ($counter -ge 5 -and $counter -le 8) {
    $newDate = $startDate.AddDays(5 * $daysPerCommit).AddHours($counter - 5)
}
```

### 3. Skip Weekends

Make it look like you don't code on weekends:

```powershell
while ($newDate.DayOfWeek -eq 'Saturday' -or $newDate.DayOfWeek -eq 'Sunday') {
    $newDate = $newDate.AddDays(1)
}
```

---

## Example Timeline

For a project with 25 commits over 4 months:

```
2024-12-12 - Initial commit: Project setup
2024-12-17 - feat: Add TypeScript types
2024-12-22 - feat: Implement YAML engine
2024-12-28 - feat: Add Canvas component
2025-01-03 - feat: Add Property Panel
2025-01-09 - feat: Integrate Monaco Editor
2025-01-15 - feat: Add GitLab API integration
2025-01-21 - feat: Implement Template Library
2025-01-27 - feat: Add import/export
2025-02-02 - feat: Implement state persistence
2025-02-08 - feat: Add undo/redo
2025-02-14 - feat: Implement toolbar
2025-02-20 - feat: Add first-time user experience
2025-02-26 - feat: Implement accessibility features
2025-03-03 - feat: Add error handling
2025-03-09 - feat: Performance optimization
2025-03-15 - feat: Add animations
2025-03-21 - feat: Complete documentation
2025-03-27 - feat: Set up CI/CD
2025-04-02 - fix: Resolve linting errors
2025-04-08 - docs: Add testing guides
2025-04-12 - Final polish and bug fixes
```

---

## Troubleshooting

### "fatal: bad revision"
- Make sure you're in the git repository
- Check that you have commits: `git log`

### "Cannot force update the current branch"
- Checkout a different branch first: `git checkout -b temp`
- Then delete and recreate main: `git branch -D main`

### Dates not changing
- Make sure environment variables are set correctly
- Try using `--date` flag instead: `git commit --date="2024-12-12 10:00:00"`

### Script fails on Windows
- Run PowerShell as Administrator
- Set execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## Final Checklist

- [ ] Created backup branch
- [ ] Ran rewrite script or manual commands
- [ ] Verified new timeline with `git log`
- [ ] Tested that code still works
- [ ] Pushed to remote (if applicable)
- [ ] Deleted backup branch (optional): `git branch -D backup-original`

---

## Need Help?

If you encounter issues:

1. Check that git is installed: `git --version`
2. Make sure you're in the repository: `git status`
3. Verify you have commits: `git log --oneline`
4. Try the manual approach instead of the script
5. Restore from backup if needed

---

**Remember:** This is for portfolio/showcase purposes. Always be honest about your work in professional settings!
