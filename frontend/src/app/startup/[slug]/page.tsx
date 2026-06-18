import { notFound } from "next/navigation";
import Image from "next/image";
import { Github, Link as LinkIcon, User, Code, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Startup } from "../../components/Feed";

async function getStartup(slug: string): Promise<Startup | null> {
  try {
    const res = await fetch(`http://localhost:4000/api/startups/${slug}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch startup:", error);
    return null;
  }
}

export default async function StartupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const startup = await getStartup(slug);

  if (!startup) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-8 py-10 w-full max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Feed
      </Link>
      
      <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] border border-white/10 flex flex-col gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center relative z-10">
          <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden relative">
            {startup.logo_url ? (
              <Image src={startup.logo_url} alt={startup.name} fill className="object-cover" />
            ) : (
              <Code className="w-12 h-12 text-white/40" />
            )}
          </div>
          <div className="flex flex-col gap-3">
            {startup.status && (
              <span className="w-fit px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-widest">
                {startup.status}
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl font-outfit font-extrabold text-white tracking-tight">
              {startup.name}
            </h1>
            <p className="text-xl text-white/60 font-medium">
              {startup.tagline}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4 relative z-10">
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">About</h2>
              <div className="prose prose-invert prose-p:text-white/70 prose-a:text-blue-400">
                {startup.description ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{startup.description}</p>
                ) : (
                  <p className="italic text-white/40">No description provided.</p>
                )}
              </div>
            </div>

            {startup.looking_for && startup.looking_for.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Looking For</h2>
                <ul className="flex flex-wrap gap-2">
                  {startup.looking_for.map((item) => (
                    <li key={item} className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 bg-black/40 p-6 rounded-2xl border border-white/5 h-fit">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {startup.tech_stack && startup.tech_stack.length > 0 ? (
                  startup.tech_stack.map((tech) => (
                    <span key={tech} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm font-medium">
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-white/40 text-sm">Not specified</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Links</h3>
              <div className="flex flex-col gap-3">
                <Link href={`/${startup.owner_github_username}`} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium">@{startup.owner_github_username}</span>
                </Link>
                
                {startup.links?.github && (
                  <a href={startup.links.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                      <Github className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Repository</span>
                  </a>
                )}
                
                {startup.links?.website && (
                  <a href={startup.links.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
