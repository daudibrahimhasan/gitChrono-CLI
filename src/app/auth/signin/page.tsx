import { Github } from "lucide-react";
import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <div className="container min-h-screen flex items-center justify-center">
      <div className="glass-card max-w-md w-full text-center">
        <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-500/20">
          <Github className="text-violet-400" size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Welcome to GitChrono</h1>
        <p className="text-muted mb-8 leading-relaxed">
          Connect your GitHub account to analyze your repositories and visualize your coding journey.
        </p>
        
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit" className="btn-primary w-full justify-center py-4 text-lg">
            <Github size={24} />
            Sign in with GitHub
          </button>
        </form>
        
        <p className="mt-8 text-xs text-muted">
          GitChrono only asks for read-only access to your public and private repository metadata. We never read your source code.
        </p>
      </div>
    </div>
  );
}
