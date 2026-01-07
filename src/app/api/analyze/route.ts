import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { getUserRepos, getRepoLanguages, getLatestCommit } from "@/lib/github";
import { calculateLOC } from "@/lib/analysis-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: true, settings: true },
  });

  const account = user?.accounts.find((a) => a.provider === "github");
  if (!account?.access_token) {
    return new Response("GitHub access token not found", { status: 400 });
  }

  // NextAuth stores it. If we encrypted it in our logic, decrypt it.
  // For now, let's assume it might be encrypted if we added the event.
  let token = account.access_token;
  try {
    token = decrypt(token);
  } catch (e) {
    // If decryption fails, maybe it's not encrypted yet (first time)
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send({ status: "fetching_repos", message: "Fetching your repositories..." });
        const allRepos = await getUserRepos(token);
        
        // Filter based on settings
        const filteredRepos = allRepos.filter(repo => {
          if (repo.fork && !user?.settings?.includeForks) return false;
          if (repo.archived && !user?.settings?.includeArchived) return false;
          return true;
        });

        const totalRepos = filteredRepos.length;
        send({ status: "analyzing", message: `Found ${totalRepos} repositories. Starting analysis...`, total: totalRepos, current: 0 });

        const batchSize = 10;
        const results: any[] = [];
        let processed = 0;

        for (let i = 0; i < filteredRepos.length; i += batchSize) {
          const batch = filteredRepos.slice(i, i + batchSize);
          const batchPromises = batch.map(async (repo) => {
            try {
              // Check cache
              const latestSha = await getLatestCommit(repo.owner.login, repo.name, token);
              const cached = await prisma.repoCache.findUnique({
                where: {
                  userId_repoName: {
                    userId,
                    repoName: repo.full_name,
                  },
                },
              });

              if (cached && cached.commitSha === latestSha) {
                processed++;
                send({ 
                  status: "analyzing", 
                  message: `Using cached data for ${repo.name}`, 
                  current: processed, 
                  total: totalRepos 
                });
                return JSON.parse(cached.languageData);
              }

              // Fetch new data
              const languages = await getRepoLanguages(repo.owner.login, repo.name, token);
              const langLoc = calculateLOC(languages);

              // Update cache
              await prisma.repoCache.upsert({
                where: {
                  userId_repoName: {
                    userId,
                    repoName: repo.full_name,
                  },
                },
                update: {
                  commitSha: latestSha || "",
                  languageData: JSON.stringify(langLoc),
                  lastUpdated: new Date(),
                },
                create: {
                  userId,
                  repoName: repo.full_name,
                  commitSha: latestSha || "",
                  languageData: JSON.stringify(langLoc),
                },
              });

              processed++;
              
              // Local aggregation for incremental update
              const partialTotals: Record<string, number> = {};
              [...results, langLoc].forEach(res => {
                for (const [l, loc] of Object.entries(res)) {
                  partialTotals[l] = (partialTotals[l] || 0) + (loc as number);
                }
              });

              send({ 
                status: "analyzing", 
                message: `Analyzed ${repo.name}`, 
                current: processed, 
                total: totalRepos,
                partialData: partialTotals
              });
              return langLoc;
            } catch (err) {
              processed++;
              console.error(`Error analyzing ${repo.name}:`, err);
              send({ 
                status: "analyzing", 
                message: `Skipped ${repo.name} due to error`, 
                current: processed, 
                total: totalRepos 
              });
              return {};
            }
          });

          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
        }

        // Final aggregation
        send({ status: "aggregating", message: "Finalizing results..." });
        
        // Sum LOC per language
        const totals: Record<string, number> = {};
        results.forEach(res => {
          for (const [lang, loc] of Object.entries(res)) {
            totals[lang] = (totals[lang] || 0) + (loc as number);
          }
        });

        send({ status: "completed", data: totals });
        controller.close();
      } catch (error: any) {
        send({ status: "error", message: error.message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
