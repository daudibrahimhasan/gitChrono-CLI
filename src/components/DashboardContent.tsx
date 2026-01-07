"use client";

import { useState } from "react";
import { 
  BarChart3, 
  Clock, 
  Code2, 
  RefreshCw, 
  Share2, 
  CheckCircle2,
  AlertCircle,
  Clipboard
} from "lucide-react";
import { formatTime, generateASCIIBar, calculateWeightedTime } from "@/lib/analysis-engine";

interface AnalysisResult {
  totalHours: number;
  totalLoc: number;
  breakdown: Record<string, { loc: number; hours: number; percentage: number }>;
}

export default function DashboardContent({ session }: { session: any }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: "", status: "" });
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [partialResults, setPartialResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    setResults(null);

    const eventSource = new EventSource("/api/analyze");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.status === "analyzing") {
        setProgress(prev => ({
          ...prev,
          current: data.current,
          total: data.total,
          message: data.message,
          status: "analyzing"
        }));
        if (data.partialData) {
          setPartialResults(calculateWeightedTime(data.partialData));
        }
      } else if (data.status === "fetching_repos" || data.status === "aggregating") {
        setProgress(prev => ({ ...prev, message: data.message, status: data.status }));
      } else if (data.status === "completed") {
        const aggregated = calculateWeightedTime(data.data);
        setResults(aggregated);
        setAnalyzing(false);
        eventSource.close();
      } else if (data.status === "error") {
        setError(data.message);
        setAnalyzing(false);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setError("Failed to connect to analysis stream.");
      setAnalyzing(false);
      eventSource.close();
    };
  };

  const copyMarkdown = () => {
    if (!results) return;
    
    let md = `# 📊 Time Spent on Code (via GitChrono)\n\n`;
    Object.entries(results.breakdown).sort((a: any, b: any) => b[1].hours - a[1].hours).forEach(([lang, data]: [string, any]) => {
      const bar = generateASCIIBar(data.percentage);
      md += `${lang.padEnd(12)} ${formatTime(data.hours).padStart(15)}  ${bar}  ${data.percentage.toFixed(2).padStart(6)} %\n`;
    });
    md += `\n**Total:** ${formatTime(results.totalHours)} across ${results.totalLoc} LOC\n`;
    md += `**Last updated:** ${new Date().toLocaleDateString()}\n`;

    navigator.clipboard.writeText(md);
    alert("Copied to clipboard!");
  };

  return (
    <div className="container py-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hello, {session?.user?.name || "Developer"}</h1>
          <p className="text-muted">Welcome to your GitChrono dashboard.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={startAnalysis} 
            disabled={analyzing}
            className="btn-primary"
          >
            {analyzing ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            {analyzing ? "Analyzing..." : "Refresh Analysis"}
          </button>
        </div>
      </header>

      {analyzing && (
        <div className="glass-card mb-12 border-violet-500/30">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="text-violet-400 animate-spin" size={20} />
            {progress.status === "fetching_repos" ? "Fetching Repositories..." : 
             progress.status === "aggregating" ? "Finalizing..." : "Analyzing Codebase..."}
          </h2>
          <p className="text-muted mb-4">{progress.message}</p>
          
          {progress.total > 0 && (
            <>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }} 
                />
              </div>
              <div className="flex justify-between text-xs text-muted mt-2">
                <span>{progress.current} / {progress.total} repositories processed</span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
            </>
          )}

          {partialResults && (
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="text-sm text-muted mb-2 uppercase tracking-wider">Current partial estimate</div>
              <div className="text-2xl font-bold text-gradient">{formatTime(partialResults.totalHours)}</div>
              <div className="text-xs text-muted mt-1">Based on {progress.current} repositories</div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
               <CheckCircle2 size={16} />
               <span>GitHub connection established</span>
            </div>
            {progress.current > 0 && (
               <div className="flex items-center gap-2 text-sm text-cyan-400">
                 <CheckCircle2 size={16} />
                 <span>Processing language metadata...</span>
               </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card mb-12 border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-semibold">Analysis Failed</h3>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {results && !analyzing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
          <div className="md:col-span-2 space-y-8">
            <div className="glass-card">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Language Breakdown</h2>
                <div className="flex gap-2">
                  <button onClick={copyMarkdown} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white" title="Copy Markdown">
                    <Clipboard size={20} />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white" title="Share Link">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(results.breakdown)
                  .sort((a: any, b: any) => b[1].hours - a[1].hours)
                  .map(([lang, data]: [string, any]) => (
                    <div key={lang}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{lang}</span>
                        <span className="text-muted">{formatTime(data.hours)} ({data.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="progress-container h-4">
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: `${data.percentage}%`,
                            background: lang === "Python" ? "#3776ab" : 
                                        lang === "JavaScript" ? "#f7df1e" : 
                                        lang === "TypeScript" ? "#3178c6" : 
                                        "var(--accent-primary)"
                          }} 
                        />
                      </div>
                    </div>
                ))}
              </div>

              <div className="mt-12 p-6 rounded-xl bg-black/40 border border-white/5 mono text-xs leading-loose overflow-x-auto">
                <div className="text-emerald-400 mb-4 font-bold"># Generated Markdown Output</div>
                {`# 📊 Time Spent on Code\n\n`}
                {Object.entries(results.breakdown)
                  .sort((a: any, b: any) => b[1].hours - a[1].hours)
                  .map(([lang, data]: [string, any]) => {
                    const bar = generateASCIIBar(data.percentage);
                    return `${lang.padEnd(12)} ${formatTime(data.hours).padStart(15)}  ${bar}  ${data.percentage.toFixed(2).padStart(6)} %\n`;
                  })}
                {`\n**Total:** ${formatTime(results.totalHours)} across codebase`}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card bg-violet-500/10 border-violet-500/20">
              <h3 className="text-sm font-medium text-violet-300 mb-4 uppercase tracking-wider">Total Time Invested</h3>
              <div className="text-4xl font-bold mb-2">{formatTime(results.totalHours).split(' ')[0]} <span className="text-xl">hrs</span></div>
              <p className="text-muted text-sm">{formatTime(results.totalHours).split(' ')[2]} mins of focused development</p>
            </div>

            <div className="glass-card bg-cyan-500/10 border-cyan-500/20">
              <h3 className="text-sm font-medium text-cyan-300 mb-4 uppercase tracking-wider">Largest Contribution</h3>
              <div className="text-2xl font-bold mb-2">
                {Object.entries(results.breakdown).sort((a: any, b: any) => b[1].hours - a[1].hours)[0][0]}
              </div>
              <p className="text-muted text-sm">Most dominant language in your workflow</p>
            </div>

            <div className="glass-card">
              <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider">Metrics Info</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1"><Clock size={16} className="text-muted" /></div>
                  <p className="text-sm text-muted">Estimated at 30 weighted lines of code per day, 8 hours/day.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1"><Code2 size={16} className="text-muted" /></div>
                  <p className="text-sm text-muted">Analysis includes language frequency and complexity multipliers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!analyzing && !results && !error && (
        <div className="glass-card text-center py-20 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
            <BarChart3 size={40} className="text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Ready to analyze your code?</h2>
          <p className="text-muted max-w-md mb-8">
            Click the button below to start fetching your repository data and calculating your time investment.
          </p>
          <button onClick={startAnalysis} className="btn-primary px-8 py-4 text-lg">
            Start Analysis
          </button>
        </div>
      )}
    </div>
  );
}
