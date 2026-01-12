import fs from "fs";
import path from "path";
import os from "os";

const CACHE_DIR = path.join(os.homedir(), ".gitchrono", "cache");

export function getCachePath(repoFullName: string, commitSha: string): string {
  // Replace slashes with underscores for filename safety
  const safeName = repoFullName.replace(/\//g, "_");
  return path.join(CACHE_DIR, `${safeName}_${commitSha}.json`);
}

export function getCachedLanguageData(repoFullName: string, commitSha: string): Record<string, number> | null {
  try {
    const filePath = getCachePath(repoFullName, commitSha);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    // Ignore cache read errors
  }
  return null;
}

export function cacheLanguageData(repoFullName: string, commitSha: string, data: Record<string, number>): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const filePath = getCachePath(repoFullName, commitSha);
    fs.writeFileSync(filePath, JSON.stringify(data));
  } catch {
    // Ignore cache write errors
  }
}
