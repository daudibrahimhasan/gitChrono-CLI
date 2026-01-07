# GitChrono CLI

A command-line tool to analyze your GitHub repositories and calculate how much time you've spent coding.

## Installation

```bash
npm install -g gitchrono
```

Or run locally:

```bash
cd cli
npm install
npm run build
npm link
```

## Usage

### 1. Get a GitHub Token

```bash
gitchrono auth
```

This will show you instructions to create a Personal Access Token.

### 2. Analyze Your Repos

```bash
# Using environment variable
export GITHUB_TOKEN=your_token
gitchrono analyze

# Or pass token directly
gitchrono analyze --token your_token

# Analyze specific user
gitchrono analyze --user octocat

# Include forks and archived repos
gitchrono analyze --include-forks --include-archived

# Only analyze top 50 most recently active repos
gitchrono analyze --top 50

# Output as markdown (for README)
gitchrono analyze --output markdown

# Output as JSON (for scripting)
gitchrono analyze --output json
```

## Example Output

```
╔════════════════════════════════════════════════════════════════════╗
║                    📊 GitChrono Analysis                          ║
╚════════════════════════════════════════════════════════════════════╝

  Analyzed 47 repositories for @username

  Python         250 hrs 34 mins  █████████████████████████  56.0%
  JavaScript      92 hrs 20 mins  █████████░░░░░░░░░░░░░░░░  14.0%
  TypeScript      65 hrs 40 mins  ██████░░░░░░░░░░░░░░░░░░░  11.5%
  HTML/CSS        45 hrs 50 mins  █████░░░░░░░░░░░░░░░░░░░░   8.2%
  SQL             22 hrs 15 mins  ███░░░░░░░░░░░░░░░░░░░░░░   4.0%

─────────────────────────────────────────────────────────────────────

  📈 Summary
     Total Time:      475 hrs 39 mins
     Lines of Code:   127,450 LOC
     Repositories:    47
     Top Language:    Python
```

## How It Works

1. **Fetches** all your repositories (or a specific user's)
2. **Analyzes** language breakdown for each repo using GitHub's API
3. **Converts** bytes to lines of code using language-specific ratios
4. **Applies** complexity multipliers (e.g., C++ is harder than HTML)
5. **Calculates** time estimates based on industry averages (~30 weighted LOC/day)

## License

MIT
