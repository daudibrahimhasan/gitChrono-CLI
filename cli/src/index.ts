#!/usr/bin/env node
import { Command } from "commander";
import { analyze } from "./commands/analyze.js";
import { config } from "dotenv";
import { saveConfig } from "./config.js";
import chalk from "chalk";

config();

const program = new Command();

program
  .name("gitchrono")
  .description("📊 Calculate how much time you've spent coding on GitHub")
  .version("1.0.0");

program
  .command("init")
  .description("Save your GitHub token to configuration")
  .argument("<token>", "GitHub Personal Access Token")
  .action((token) => {
    try {
      saveConfig({ githubToken: token });
      console.log(chalk.green("\n✅ Token saved successfully to ~/.gitchrono/config.json\n"));
    } catch (error: any) {
      console.log(chalk.red(`\n❌ Error saving config: ${error.message}\n`));
    }
  });

program
  .command("analyze")
  .description("Analyze your GitHub repositories and calculate time spent")
  .option("-t, --token <token>", "GitHub Personal Access Token (or set GITHUB_TOKEN env var)")
  .option("-u, --user <username>", "GitHub username (defaults to authenticated user)")
  .option("--include-forks", "Include forked repositories", false)
  .option("--include-archived", "Include archived repositories", false)
  .option("--top <n>", "Only analyze top N repositories by recent activity", "0")
  .option("-o, --output <format>", "Output format: table, json, markdown", "table")
  .option("--readme", "Format output for a GitHub README profile")
  .option("--save <file>", "Save the output directly to a file")
  .action((args) => analyze({ ...args, outputFile: args.save }));

program
  .command("export")
  .description("Alias for analyze --output markdown")
  .option("-u, --user <username>", "GitHub username")
  .option("--top <n>", "Only analyze top N repositories by recent activity", "0")
  .option("--readme", "Format output for a GitHub README profile")
  .option("--save <file>", "Save the output directly to a file")
  .action((options) => {
    analyze({ ...options, output: "markdown", includeForks: false, includeArchived: false, outputFile: options.save });
  });

program
  .command("auth")
  .description("Instructions for GitHub token configuration")
  .action(() => {
    console.log(`
To use GitChrono, you need a GitHub Personal Access Token.

1. Go to: https://github.com/settings/tokens/new
2. Give it a name like "GitChrono"
3. Select scopes: "repo" (for private repos) or "public_repo" (for public only)
4. Generate and copy the token

Then run:
  ${chalk.cyan("gitchrono init <your_token>")}

Or set it as an environment variable:
  ${chalk.cyan("export GITHUB_TOKEN=your_token")}
`);
  });

program.parse();
