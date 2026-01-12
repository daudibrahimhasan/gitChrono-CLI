import chalk from "chalk";
import ora from "ora";
import cliProgress from "cli-progress";
import { getAuthenticatedUser, getUserRepos, getRepoLanguages, GithubRepo, getLatestCommit } from "../github.js";
import { calculateAnalysis, formatTime, generateASCIIBar, AnalysisResult, LanguageStats } from "../analysis.js";
import { ensureToken } from "../config.js";
import { getCachedLanguageData, cacheLanguageData } from "../cache.js";

interface AnalyzeOptions {
  token?: string;
  user?: string;
  includeForks: boolean;
  includeArchived: boolean;
  top: string;
  output: "table" | "json" | "markdown";
  readme: boolean;
  outputFile?: string;
}

export async function analyze(options: AnalyzeOptions): Promise<void> {
  const token = await ensureToken(options.token);

  if (!token) {
    console.log(chalk.red("\n❌ No GitHub token provided!\n"));
    console.log("Run " + chalk.cyan("gitchrono auth") + " for instructions.\n");
    process.exit(1);
  }

  const spinner = ora();

  try {
    // Get authenticated user if no username specified
    spinner.start("Connecting to GitHub...");
    let username: string;
    try {
      username = options.user || await getAuthenticatedUser(token);
    } catch (e: unknown) {
      spinner.fail(chalk.red("Failed to connect to GitHub. Please check your token."));
      const error = e as { response?: { status: number }; message?: string };
      if (error.response?.status === 401) {
        console.log(chalk.yellow("\nYour token is invalid or expired."));
      } else {
        console.log(chalk.dim(`Detail: ${error.message || "Unknown error"}`));
      }
      process.exit(1);
    }
    spinner.succeed(chalk.green(`Connected as ${chalk.bold(username)}`));

    // Fetch repositories
    spinner.start("Fetching repositories...");
    let repos: GithubRepo[];
    try {
      repos = await getUserRepos(token, options.user);
    } catch (e: unknown) {
      spinner.fail(chalk.red("Failed to fetch repositories."));
      const error = e as { message?: string };
      console.log(chalk.dim(`Detail: ${error.message || "Unknown error"}`));
      process.exit(1);
    }
    spinner.succeed(chalk.green(`Found ${chalk.bold(repos.length)} repositories`));

    // Apply filters
    const originalCount = repos.length;
    repos = repos.filter((repo: GithubRepo) => {
      if (repo.fork && !options.includeForks) return false;
      if (repo.archived && !options.includeArchived) return false;
      return true;
    });

    // Apply top N filter
    const topN = parseInt(options.top, 10);
    if (topN > 0) {
      repos = repos.slice(0, topN);
    }

    if (repos.length !== originalCount) {
      console.log(chalk.dim(`  Analyzing ${repos.length} repos (filtered from ${originalCount})`));
    }

    if (repos.length === 0) {
      console.log(chalk.yellow("\n⚠️  No repositories to analyze.\n"));
      return;
    }

    // Analyze each repository
    console.log("");
    const progressBar = new cliProgress.SingleBar({
      format: chalk.cyan("{bar}") + " | {percentage}% | {value}/{total} repos | {repo}",
      barCompleteChar: "█",
      barIncompleteChar: "░",
      hideCursor: true,
    });

    progressBar.start(repos.length, 0, { repo: "Starting..." });

    const aggregatedLanguages: Record<string, number> = {};
    let processedCount = 0;

    // Process in batches of 10 for speed
    const batchSize = 10;
    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (repo: GithubRepo) => {
          try {
            // Check cache
            const commitSha = await getLatestCommit(token, repo.owner.login, repo.name);
            if (commitSha) {
              const cached = getCachedLanguageData(repo.full_name, commitSha);
              if (cached) {
                processedCount++;
                progressBar.update(processedCount, { repo: repo.name.substring(0, 30) });
                return cached;
              }
            }

            // Fetch fresh data
            const languages = await getRepoLanguages(token, repo.owner.login, repo.name);
            
            // Save to cache
            if (commitSha && Object.keys(languages).length > 0) {
              cacheLanguageData(repo.full_name, commitSha, languages);
            }

            processedCount++;
            progressBar.update(processedCount, { repo: repo.name.substring(0, 30) });
            return languages;
          } catch {
            processedCount++;
            progressBar.update(processedCount, { repo: `(error) ${repo.name.substring(0, 20)}` });
            return {};
          }
        })
      );

      // Aggregate results
      for (const languages of batchResults) {
        for (const [originalLang, bytes] of Object.entries(languages)) {
          const lang = originalLang === "Jupyter Notebook" ? "Jupyter Note" : originalLang;
          aggregatedLanguages[lang] = (aggregatedLanguages[lang] || 0) + bytes;
        }
      }
    }

    progressBar.stop();

    // Calculate final results
    const result = calculateAnalysis(aggregatedLanguages, repos.length);

    // Output results
    console.log("");
    outputResults(result, options.output, username, options.readme, options.outputFile);

  } catch (error: unknown) {
    if (spinner.isSpinning) spinner.fail(chalk.red("An unexpected error occurred."));
    const err = error as { message?: string };
    console.error(chalk.red("\n❌ Error: " + (err.message || "Unknown error")));
    process.exit(1);
  }
}

function outputResults(result: AnalysisResult, format: string, username: string, isReadme: boolean, outputFile?: string): void {
  const sortedLanguages = Object.entries(result.languages)
    .sort((a, b) => b[1].hours - a[1].hours);

  let output = "";

  if (format === "json") {
    output = JSON.stringify(result, null, 2);
  } else if (format === "markdown") {
    output = generateMarkdown(result, sortedLanguages, username, isReadme);
  } else {
    // Table format
    output += "\n";
    for (const [lang, stats] of sortedLanguages.slice(0, 15)) {
      const bar = generateASCIIBar(stats.percentage, 20);
      const langName = lang.length > 12 ? lang.substring(0, 11) + "." : lang.padEnd(12);
      const time = formatTime(stats.hours).padStart(18);
      const pct = stats.percentage.toFixed(2).padStart(8) + " %";
      output += `${langName.padEnd(12)}${time}    ${bar}    ${pct}\n`;
    }

    if (sortedLanguages.length > 15) {
      const othersHours = sortedLanguages.slice(15).reduce((sum, [, s]) => sum + s.hours, 0);
      const othersPct = sortedLanguages.slice(15).reduce((sum, [, s]) => sum + s.percentage, 0);
      const bar = generateASCIIBar(othersPct, 20);
      output += `${"Others".padEnd(14)}${formatTime(othersHours).padStart(18)}    ${bar}    ${othersPct.toFixed(2).padStart(8)} %\n`;
    }

    output += `\nTotal: ${formatTime(result.totalHours)} across ${result.repoCount} repositories\n`;
    output += `Lines of Code: ${result.totalLoc.toLocaleString()}\n`;
    output += `\ngenerated with ${chalk.hex("#A78BFA")("gitChrono")} built by @daudibrahimhasan\n`;
  }

  if (outputFile) {
    import("fs").then((fs) => {
      import("path").then((path) => {
        const dir = path.dirname(outputFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(outputFile, output.trim() + "\n");
        console.log(chalk.green(`\n✅ Results saved to ${chalk.bold(outputFile)}\n`));
      });
    });
  } else {
    console.log(output);
  }
}

function generateMarkdown(
  result: AnalysisResult, 
  sortedLanguages: [string, LanguageStats][], 
  username: string,
  isReadme: boolean
): string {
  let md = "";
  if (isReadme) {
    md += `## 💻 Time Spent Coding\n\n`;
    md += "```\n";
  } else {
    md += `# 📊 Time Spent on Code\n\n`;
    md += "```\n";
  }
  
  for (const [lang, stats] of sortedLanguages.slice(0, 15)) {
    const bar = generateASCIIBar(stats.percentage, 20);
    const langName = lang.padEnd(14);
    const time = formatTime(stats.hours).padStart(18);
    const pct = stats.percentage.toFixed(2).padStart(8) + " %";
    
    md += `${langName} ${time}    ${bar}    ${pct}\n`;
  }
  
  md += "```\n\n";
  
  if (isReadme) {
    md += `Total: ${formatTime(result.totalHours)} across ${result.repoCount} repositories  \n`;
    md += `Lines of Code: ${result.totalLoc.toLocaleString()}\n`;
  } else {
    md += `Total: ${formatTime(result.totalHours)} across ${result.repoCount} repositories  \n`;
    md += `Lines of Code: ${result.totalLoc.toLocaleString()}  \n`;
    md += `Last updated: ${new Date().toLocaleDateString()}\n\n`;
    md += `> Generated by [GitChrono](https://github.com/daudibrahimhasan/gitChrono) for @${username}`;
  }
  return md;
}
