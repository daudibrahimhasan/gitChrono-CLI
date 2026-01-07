#!/usr/bin/env node
import { Command } from "commander";
import { analyze } from "./commands/analyze.js";
import { config } from "dotenv";
config();
const program = new Command();
program
    .name("gitchrono")
    .description("📊 Calculate how much time you've spent coding on GitHub")
    .version("1.0.0");
program
    .command("analyze")
    .description("Analyze your GitHub repositories and calculate time spent")
    .option("-t, --token <token>", "GitHub Personal Access Token (or set GITHUB_TOKEN env var)")
    .option("-u, --user <username>", "GitHub username (defaults to authenticated user)")
    .option("--include-forks", "Include forked repositories", false)
    .option("--include-archived", "Include archived repositories", false)
    .option("--top <n>", "Only analyze top N repositories by recent activity", "0")
    .option("-o, --output <format>", "Output format: table, json, markdown", "table")
    .action(analyze);
program
    .command("auth")
    .description("Configure your GitHub token")
    .action(() => {
    console.log(`
To use GitChrono, you need a GitHub Personal Access Token.

1. Go to: https://github.com/settings/tokens/new
2. Give it a name like "GitChrono"
3. Select scopes: "repo" (for private repos) or "public_repo" (for public only)
4. Generate and copy the token

Then either:
  - Set it as an environment variable: export GITHUB_TOKEN=your_token
  - Or pass it directly: gitchrono analyze --token your_token
`);
});
program.parse();
