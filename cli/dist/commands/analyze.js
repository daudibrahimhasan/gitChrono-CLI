import chalk from "chalk";
import ora from "ora";
import cliProgress from "cli-progress";
import { getAuthenticatedUser, getUserRepos, getRepoLanguages } from "../github.js";
import { calculateAnalysis, formatTime, generateASCIIBar } from "../analysis.js";
export async function analyze(options) {
    const token = options.token || process.env.GITHUB_TOKEN;
    if (!token) {
        console.log(chalk.red("\n❌ No GitHub token provided!\n"));
        console.log("Run " + chalk.cyan("gitchrono auth") + " for instructions.\n");
        process.exit(1);
    }
    const spinner = ora();
    try {
        // Get authenticated user if no username specified
        spinner.start("Connecting to GitHub...");
        const username = options.user || await getAuthenticatedUser(token);
        spinner.succeed(chalk.green(`Connected as ${chalk.bold(username)}`));
        // Fetch repositories
        spinner.start("Fetching repositories...");
        let repos = await getUserRepos(token, options.user);
        spinner.succeed(chalk.green(`Found ${chalk.bold(repos.length)} repositories`));
        // Apply filters
        const originalCount = repos.length;
        repos = repos.filter((repo) => {
            if (repo.fork && !options.includeForks)
                return false;
            if (repo.archived && !options.includeArchived)
                return false;
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
        const aggregatedLanguages = {};
        let processedCount = 0;
        // Process in batches of 10 for speed
        const batchSize = 10;
        for (let i = 0; i < repos.length; i += batchSize) {
            const batch = repos.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(async (repo) => {
                const languages = await getRepoLanguages(token, repo.owner.login, repo.name);
                processedCount++;
                progressBar.update(processedCount, { repo: repo.name.substring(0, 30) });
                return languages;
            }));
            // Aggregate results
            for (const languages of batchResults) {
                for (const [lang, bytes] of Object.entries(languages)) {
                    aggregatedLanguages[lang] = (aggregatedLanguages[lang] || 0) + bytes;
                }
            }
        }
        progressBar.stop();
        // Calculate final results
        const result = calculateAnalysis(aggregatedLanguages, repos.length);
        // Output results
        console.log("");
        outputResults(result, options.output, username);
    }
    catch (error) {
        spinner.fail(chalk.red("Error: " + error.message));
        if (error.response?.status === 401) {
            console.log(chalk.yellow("\nYour token might be invalid or expired."));
            console.log("Run " + chalk.cyan("gitchrono auth") + " for instructions.\n");
        }
        process.exit(1);
    }
}
function outputResults(result, format, username) {
    const sortedLanguages = Object.entries(result.languages)
        .sort((a, b) => b[1].hours - a[1].hours);
    if (format === "json") {
        console.log(JSON.stringify(result, null, 2));
        return;
    }
    if (format === "markdown") {
        outputMarkdown(result, sortedLanguages, username);
        return;
    }
    // Default: table format - clean aligned output
    console.log("\n");
    // Language breakdown - clean aligned format
    for (const [lang, stats] of sortedLanguages.slice(0, 15)) {
        const bar = generateASCIIBar(stats.percentage, 20);
        const langName = lang.length > 12 ? lang.substring(0, 11) + "." : lang.padEnd(12);
        const time = formatTime(stats.hours).padStart(18);
        const pct = stats.percentage.toFixed(2).padStart(8) + " %";
        console.log(`${langName.padEnd(12)}${time}    ${bar}    ${pct}`);
    }
    if (sortedLanguages.length > 15) {
        const othersHours = sortedLanguages.slice(15).reduce((sum, [, s]) => sum + s.hours, 0);
        const othersPct = sortedLanguages.slice(15).reduce((sum, [, s]) => sum + s.percentage, 0);
        const bar = generateASCIIBar(othersPct, 20);
        console.log(`${"Others".padEnd(14)}${formatTime(othersHours).padStart(18)}    ${bar}    ${othersPct.toFixed(2).padStart(8)} %`);
    }
    // Summary
    console.log("\n");
    console.log(`Total: ${formatTime(result.totalHours)} across ${result.repoCount} repositories`);
    console.log(`Lines of Code: ${result.totalLoc.toLocaleString()}`);
    console.log("");
}
function outputMarkdown(result, sortedLanguages, username) {
    console.log(`# 📊 Time Spent on Code\n`);
    console.log(`> Generated by [GitChrono](https://github.com/yourusername/gitchrono) for @${username}\n`);
    console.log("```");
    for (const [lang, stats] of sortedLanguages.slice(0, 12)) {
        const bar = generateASCIIBar(stats.percentage, 20);
        const langName = lang.padEnd(12);
        const time = formatTime(stats.hours).padStart(15);
        const pct = stats.percentage.toFixed(2).padStart(6) + " %";
        console.log(`${langName} ${time}  ${bar}  ${pct}`);
    }
    console.log("```\n");
    console.log(`**Total:** ${formatTime(result.totalHours)} across ${result.repoCount} repositories  `);
    console.log(`**Last updated:** ${new Date().toLocaleDateString()}`);
}
