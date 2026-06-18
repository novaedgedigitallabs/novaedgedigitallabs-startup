import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Github, LayoutGrid } from "lucide-react";
import { Startup } from "../components/Feed";
import Image from "next/image";

async function getUserStartup(username: string): Promise<Startup | null> {
  try {
    // In our MVP, slug is exactly the github username
    const res = await fetch(`http://localhost:4000/api/startups/${username}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch user startup:", error);
    return null;
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const startup = await getUserStartup(username);

  return (
    <div className="flex flex-col gap-10 py-10 w-full max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Feed
      </Link>
      
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
             {/* Fetching github avatar based on username */}
             <Image src={`https://github.com/${username}.png`} alt={username} fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-outfit font-bold text-white tracking-tight">@{username}</h1>
            <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-2 text-white/60 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
              <span>GitHub Profile</span>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex items-center gap-2 mb-6 text-white/80">
            <LayoutGrid className="w-5 h-5" />
            <h2 className="text-xl font-bold">Startups</h2>
          </div>
          
          {startup ? (
            <Link href={`/startup/${startup.slug}`} className="block group">
              <div className="glass-panel p-6 rounded-2xl border border-white/5 group-hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {startup.logo_url ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-white/10">
                        <Image src={startup.logo_url} alt={startup.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <LayoutGrid className="w-6 h-6 text-white/40" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{startup.name}</h3>
                      <p className="text-white/60 text-sm">{startup.tagline}</p>
                    </div>
                  </div>
                  {startup.status && (
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 uppercase tracking-wider">
                      {startup.status}
                    </span>
                  )}
                </div>
                {startup.description && (
                  <p className="text-white/70 line-clamp-2 mt-2">{startup.description}</p>
                )}
              </div>
            </Link>
          ) : (
            <div className="text-center py-12 glass-panel rounded-2xl border border-white/5 border-dashed">
              <User className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">This user hasn't published a startup yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
