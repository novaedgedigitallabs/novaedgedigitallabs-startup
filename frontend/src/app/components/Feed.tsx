"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Github, Link as LinkIcon, User, Code, MapPin } from "lucide-react";
import Image from "next/image";

export interface Startup {
  slug: string;
  owner_github_username: string;
  name: string;
  tagline: string;
  status: string;
  looking_for?: string[];
  tech_stack?: string[];
  links?: Record<string, string>;
  description?: string;
  logo_url?: string;
}

interface FeedProps {
  initialStartups: Startup[];
}

export default function Feed({ initialStartups }: FeedProps) {
  const [startups, setStartups] = useState<Startup[]>(initialStartups);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!searchQuery.trim()) {
        setStartups(initialStartups);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:4000/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setStartups(data.hits);
        }
      } catch (err) {
        console.error("Failed to search:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSearch();
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [searchQuery, initialStartups]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center justify-center text-center space-y-6 pt-10 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-white/80"
        >
          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          Platform is live
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-5xl font-outfit font-extrabold tracking-tight sm:text-6xl"
        >
          Discover Developer <br className="hidden sm:block" />
          <span className="text-gradient">Startups</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="max-w-2xl text-lg text-white/60 leading-relaxed"
        >
          Explore the next generation of developer tools, open-source projects, and technical startups built by engineers, for engineers.
        </motion.p>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative glass-panel rounded-2xl flex items-center p-2 border border-white/10 focus-within:border-white/30 transition-colors">
          <div className="pl-4 pr-2 text-white/50">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by tech stack, name, or looking for..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 py-3 px-2 text-lg"
          />
        </div>
      </motion.div>

      {/* Feed Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        <AnimatePresence mode="popLayout">
          {startups.length > 0 ? (
            startups.map((startup, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={startup.slug}
                className="glass-panel p-6 rounded-3xl flex flex-col gap-4 border border-white/5 hover:border-white/15 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden relative">
                    {startup.logo_url ? (
                      <Image src={startup.logo_url} alt={startup.name} fill className="object-cover" />
                    ) : (
                      <Code className="w-6 h-6 text-white/60" />
                    )}
                  </div>
                  {startup.status && (
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 uppercase tracking-wider">
                      {startup.status}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-outfit text-2xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {startup.name}
                  </h3>
                  <p className="text-white/60 text-sm line-clamp-2">
                    {startup.tagline}
                  </p>
                </div>

                <div className="flex-1">
                  {startup.tech_stack && startup.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {startup.tech_stack.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                          {tech}
                        </span>
                      ))}
                      {startup.tech_stack.length > 3 && (
                        <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
                          +{startup.tech_stack.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <User className="w-4 h-4" />
                    <span>@{startup.owner_github_username}</span>
                  </div>
                  
                  {startup.links?.github && (
                    <a href={startup.links.github} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center flex flex-col items-center justify-center text-white/50"
            >
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg">No startups found matching your criteria.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
