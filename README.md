# ⏱️ GitChrono

**GitChrono** is a lightweight CLI tool that estimates how much time you’ve spent coding by analyzing your GitHub repositories.

It’s designed to be:

- easy to run locally
- transparent in how it works
- simple to refine, tweak, and extend

> GitChrono provides **estimates**, not exact measurements. It’s built for insight, curiosity, and fun — not billing or tracking.

---

## ✨ Features

- 📊 Language-wise coding time breakdown
- 🧮 Estimated total coding hours
- 📁 Multi-repository analysis
- 🚀 Fast CLI with progress indicators
- 📝 Output as table, JSON, or Markdown
- 📦 README-friendly report generation

---

## 📦 Installation

### Clone and run locally

```bash
git clone https://github.com/daudibrahimhasan/gitChrono.git
cd gitChrono/cli
npm install
npm run build
npm link
```

### 🚀 Quick Start

1. **Create a GitHub Token**

Create a Personal Access Token with repo access:

https://github.com/settings/tokens

2. Run the analysis

Using an environment variable:
export GITHUB_TOKEN=your_token_here
gitchrono analyze
Or pass the token directly:
gitchrono analyze --token your_token_here

**Example Output**
████████████████████████████████████████ | 100% | 20/20 repos | my-project

Jupyter Note 3322 hrs 48 mins ███████░░░░░░░░░░░░░ 36.75 %
TypeScript 2965 hrs 2 mins ███████░░░░░░░░░░░░░ 32.79 %
JavaScript 1552 hrs ███░░░░░░░░░░░░░░░░░ 17.17 %
CSS 691 hrs 52 mins ██░░░░░░░░░░░░░░░░░░ 7.65 %
Python 475 hrs 44 mins █░░░░░░░░░░░░░░░░░░░ 5.26 %

Total: 9041 hrs 26 mins across 20 repositories
Lines of Code: 45,519

generated with gitChrono built by @daudibrahimhasan

CLI Options
| Flag | Description |
| ---------------------- | -------------------------------------- |
| `--token <token>` | GitHub Personal Access Token |
| `--user <username>` | Analyze a specific user's repositories |
| `--include-forks` | Include forked repositories |
| `--include-archived` | Include archived repositories |
| `--top <n>` | Analyze top N most recent repositories |
| `--output <format>` | `table`, `json`, or `markdown` |
| `--readme` | Generate README-friendly markdown |
| `--output-file <path>` | Save output to a file |

🧠 How It Works

GitChrono intentionally keeps its logic simple and transparent:

Fetches repositories using the GitHub API

Retrieves language usage per repository

Converts language byte counts into estimated lines of code

Applies language complexity multipliers

C / C++ → 2.0×

Python → 1.0×

HTML → 0.5×

Estimates time using an industry-average productivity model
(~30 weighted LOC per day)

All assumptions are easy to find and modify in the codebase.

📁 Project Structure

cli/
├── src/
│ ├── index.ts # CLI entry point
│ ├── commands/
│ │ ├── analyze.ts # Main analyze command
│ │ └── auth.ts # Auth instructions
│ ├── analysis.ts # LOC & time estimation logic
│ ├── github.ts # GitHub API integration
│ ├── cache.ts # Local caching
│ └── config.ts # Token management
├── package.json
└── tsconfig.json

🛠️ Customization & Contributions

GitChrono is built to be:

forked

tweaked

experimented with

Feel free to:

adjust language multipliers

change time estimation models

add new output formats

improve accuracy

Pull requests and ideas are welcome.

📄 License

MIT © daudibrahimhasan

<sub>generated with gitChrono · built by @daudibrahimhasan</sub>
