import Link from "next/link";
import { Github, Timer, BarChart3, Share2 } from "lucide-react";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="container min-h-screen flex flex-col justify-center py-20">
      <div className="max-w-3xl animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary-400 mb-6" style={{
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderColor: 'rgba(139, 92, 246, 0.2)',
          color: '#a78bfa'
        }}>
          <Timer size={14} />
          <span>New: Deep Analysis v2.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient leading-tight">
          Your coding journey, <br />
          visualized in time.
        </h1>
        
        <p className="text-xl text-muted mb-10 leading-relaxed italic">
          &quot;Ever wondered how many hours of your life went into those Python scripts or React components?&quot;
        </p>

        <div className="flex flex-wrap gap-4 mb-20">
          {session ? (
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/api/auth/signin" className="btn-primary">
              <Github size={20} />
              Sign in with GitHub
            </Link>
          )}
          <Link href="#how-it-works" className="btn-secondary">
            How it works
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4 border border-violet-500/30">
              <BarChart3 className="text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Deep Analysis</h3>
            <p className="text-muted text-sm">We analyze every language in your public and private repos to calculate real metrics.</p>
          </div>
          
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 border border-cyan-500/30">
              <Timer className="text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Time Estimation</h3>
            <p className="text-muted text-sm">Using industry-standard LOC-to-time ratios tailored to each programming language.</p>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/30">
              <Share2 className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Shareable Stats</h3>
            <p className="text-muted text-sm">Export your stats as Markdown or share your public profile with the community.</p>
          </div>
        </div>
      </div>

      <div className="mt-32 glass-card opacity-80 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-10" />
        <div className="mono text-xs leading-loose whitespace-pre">
          {`# 📊 Time Spent on Code
          
Python      250 hrs 34 mins  ████████████░░░░░░░░  56.00 %
JavaScript   92 hrs 20 mins  ███░░░░░░░░░░░░░░░░░  14.00 %
HTML/CSS     45 hrs 50 mins  ██░░░░░░░░░░░░░░░░░░  11.00 %
SQL          22 hrs 15 mins  █░░░░░░░░░░░░░░░░░░░  05.00 %
Others       65 hrs 40 mins  ███░░░░░░░░░░░░░░░░░  16.00 %

**Total:** 475 hrs 39 mins across 47 repositories`}
        </div>
      </div>
    </main>
  );
}
