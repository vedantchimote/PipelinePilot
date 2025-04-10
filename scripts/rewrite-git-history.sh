#!/bin/bash

# Script to rewrite git history to spread commits over 4 months
# WARNING: This rewrites git history. Use with caution!

echo "⚠️  WARNING: This will rewrite git history!"
echo "Only proceed if you haven't pushed to remote, or are okay with force-push."
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "🔄 Rewriting git history to spread over 4 months..."
echo ""

# Get current date
current_date=$(date +%s)

# Calculate 4 months ago (approximately 120 days)
four_months_ago=$((current_date - 120*24*60*60))

# Get list of all commits
commits=$(git rev-list --reverse HEAD)
commit_count=$(echo "$commits" | wc -l)

echo "Found $commit_count commits to rewrite"
echo ""

# Calculate time increment (120 days / number of commits)
time_increment=$((120*24*60*60 / commit_count))

# Counter
counter=0

# Rewrite each commit with new date
for commit in $commits; do
    counter=$((counter + 1))
    
    # Calculate new date for this commit
    new_timestamp=$((four_months_ago + counter * time_increment))
    new_date=$(date -d "@$new_timestamp" "+%Y-%m-%d %H:%M:%S")
    
    # Get commit message
    commit_msg=$(git log -1 --format=%B $commit)
    
    echo "[$counter/$commit_count] Rewriting: ${commit_msg:0:60}..."
    
    # Rewrite commit with new date
    GIT_COMMITTER_DATE="$new_date" git commit --amend --no-edit --date="$new_date" > /dev/null 2>&1
done

echo ""
echo "✅ Git history rewritten successfully!"
echo ""
echo "📊 Commit timeline:"
git log --oneline --date=short --pretty=format:"%ad - %s" | head -20
echo ""
echo ""
echo "⚠️  To push to remote (if already pushed before):"
echo "    git push --force origin main"
echo ""
