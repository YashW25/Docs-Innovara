import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Database, FolderGit2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 font-sans text-white relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.jpg" 
            alt="Docs Innovara Logo" 
            width={40} 
            height={40} 
            className="rounded-lg shadow-sm"
          />
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Docs Innovara
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/login">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/20 transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 text-center px-4 max-w-5xl mx-auto py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Enterprise Edition v2.0
        </div>
        
        <Image
          src="/logo.jpg"
          alt="Docs Innovara Hero Logo"
          width={120}
          height={120}
          className="rounded-2xl shadow-2xl shadow-indigo-500/20 mb-8 ring-1 ring-white/10"
          priority
        />
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400 leading-tight">
          Next-Generation <br className="hidden md:block" /> Document Management
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Docs Innovara is a secure, role-based platform designed to manage, upload, and review enterprise documents with a seamless developer-friendly architecture.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-xl shadow-indigo-900/20 transition-all hover:scale-105">
              Access Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10 transition-all">
            View Documentation
          </Button>
        </div>

        {/* Feature Highlights using Logo motif implicitly through brand colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">Enterprise Security</h3>
            <p className="text-zinc-400 text-sm">Strict Role-Based Access Control limits visibility and permissions natively on the server.</p>
          </div>
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">Live Supabase Sync</h3>
            <p className="text-zinc-400 text-sm">Real-time database triggers and instant hydration without complex data-fetching layers.</p>
          </div>
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-100">GitHub-Backed Storage</h3>
            <p className="text-zinc-400 text-sm">Large documents and repositories map safely to scalable external infrastructure seamlessly.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/5 py-8 mt-12 text-center text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} Docs Innovara. All rights reserved.</p>
      </footer>
    </div>
  );
}
