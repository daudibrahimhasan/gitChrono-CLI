# ⏱️ GitChrono

**GitChrono** is a lightweight CLI tool that estimates how much time you’ve spent coding by analyzing your GitHub repositories.

It’s designed to be:

- easy to run locally
- transparent in how it works
- simple to refine, tweak, and extend

> GitChrono provides **estimates**, not exact measurements.  
> It’s built for insight, curiosity, and fun — **not** for billing or serious time tracking.

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

### Install via npm (Recommended)

```bash
npm install -g gitchrono
```

### Run locally or from source

```bash
git clone https://github.com/daudibrahimhasan/gitChrono.git
cd gitChrono/cli
npm install
npm run build
npm link
```

---

## 🚀 Quick Start

1. **Create a GitHub Personal Access Token**  
   → https://github.com/settings/tokens  
   (needs `repo` scope)

2. **Run the analysis**

   Using environment variable (recommended):

   ```bash
   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   gitchrono analyze
   ```

   Or pass token directly:

   ```bash
   gitchrono analyze --token ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**Example output:**

```
████████████████████████████████████████ | 100% | 20/20 repos | my-project

Jupyter Notebook   3322 hrs 48 mins   ███████░░░░░░░░░░░░░  36.75 %
TypeScript         2965 hrs  2 mins   ███████░░░░░░░░░░░░░  32.79 %
JavaScript         1552 hrs           ███░░░░░░░░░░░░░░░░░  17.17 %
CSS                691 hrs 52 mins    ██░░░░░░░░░░░░░░░░░░   7.65 %
Python             475 hrs 44 mins    █░░░░░░░░░░░░░░░░░░░   5.26 %

Total: 9041 hrs 26 mins across 20 repositories
Lines of Code: 45,519

generated with gitChrono • built by @daudibrahimhasan
```

---

## CLI Options

| Flag                   | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `--token <token>`      | GitHub Personal Access Token                              |
| `--user <username>`    | Analyze a specific user's repositories                    |
| `--include-forks`      | Include forked repositories                               |
| `--include-archived`   | Include archived repositories                             |
| `--top <n>`            | Analyze only the top N most recently updated repositories |
| `--output <format>`    | `table`, `json`, or `markdown`                            |
| `--readme`             | Generate README-friendly markdown                         |
| `--output-file <path>` | Save output to a file                                     |

---

## 🧠 How It Works

GitChrono keeps the logic **simple and transparent**:

1. Fetches your repositories using the GitHub API
2. Gets language byte counts per repository
3. Converts bytes → estimated lines of code
4. Applies language-specific **complexity multipliers**:
   - C / C++ → ×2.0
   - Python → ×1.0
   - HTML → ×0.5
   - … (and more — easy to change)
5. Estimates time using ~30 weighted LOC per productive coding day

All multipliers and assumptions live in the source code — feel free to tweak them!

---

## 📁 Project Structure

```
cli/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── commands/
│   │   ├── analyze.ts    # Main analyze command
│   │   └── auth.ts       # Token & auth helpers
│   ├── analysis.ts       # LOC + time estimation logic
│   ├── github.ts         # GitHub API client
│   ├── cache.ts          # Local caching layer
│   └── config.ts         # Token & config management
├── package.json
└── tsconfig.json
```

---

## 🛠️ Customization & Contributions

GitChrono is meant to be:

- forked
- tweaked
- experimented with

You can easily:

- adjust language multipliers
- try different time-estimation formulas
- add new output formats
- improve accuracy with commit timestamps, etc.

Pull requests, ideas, and forks are very welcome!

---

## 📄 License

MIT © [**@daudibrahimhasan**](https://github.com/daudibrahimhasan)

```

```
