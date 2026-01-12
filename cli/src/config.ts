import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".gitchrono");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

import inquirer from "inquirer";
import chalk from "chalk";

export interface Config {
  githubToken?: string;
  defaultUsername?: string;
}

export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    // Ignore errors, return empty config
  }
  return {};
}

export function saveConfig(config: Config): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const current = loadConfig();
    const updated = { ...current, ...config };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
  } catch (error: any) {
    throw new Error(`Failed to save config: ${error.message}`);
  }
}

export async function ensureToken(providedToken?: string): Promise<string> {
  // 1. Check provided argument or ENV
  let token = providedToken || process.env.GITHUB_TOKEN || loadConfig().githubToken;

  if (token) return token;

  // 2. Interactive setup if missing
  console.log(chalk.red("\n❌ No GitHub token found!\n"));
  console.log(chalk.bold("To use GitChrono, you need a GitHub Personal Access Token."));
  console.log(`
📝 ${chalk.bold("Steps to create one:")}
   1. Go to: ${chalk.cyan("https://github.com/settings/tokens")}
   2. Click "Generate new token (classic)"
   3. Give it a name: "GitChrono"
   4. Select scopes: ${chalk.green("✓ repo")}, ${chalk.green("✓ read:user")}
   5. Click "Generate token"
   6. Copy the token (starts with ghp_...)
`);

  const answers = await inquirer.prompt([
    {
      type: "password",
      name: "token",
      message: "🔑 Paste your token here:",
      mask: "*",
      validate: (input) => (input.length > 0 ? true : "Token cannot be empty"),
    },
  ]);

  token = answers.token;
  saveConfig({ githubToken: token });
  console.log(chalk.green("\n✅ Token saved to ~/.gitchrono/config.json"));

  return token!;
}

export function getEffectiveToken(providedToken?: string): string | undefined {
  if (providedToken) return providedToken;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  return loadConfig().githubToken;
}
