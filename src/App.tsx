/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { ArrowRight, Menu, X, Github, Instagram } from 'lucide-react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import EspBoards from './EspBoards';
import { HackerLoader } from './Loading';

const systemCode = `// [SYSTEM PROTOCOL INITIALIZED]
// ESTABLISHING SECURE CONNECTION...
import { QuantumCore } from '@cyber/core';
import { decryptPayload } from './security/encryption';

export async function overrideSystem(targetId: string) {
  const core = new QuantumCore({ mode: 'stealth' });
  
  try {
    console.log('Bypassing mainframe protocols...');
    await core.connect(targetId);
    
    // Injecting malicious footprint
    const payload = await core.intercept();
    const data = decryptPayload(payload, process.env.ROOT_KEY);
    
    return { status: 'breached', ...data };
  } catch (error) {
    console.error('Connection terminated by host.');
    process.exit(1);
  }
}

// [CONNECTION SECURED]
// AWAITING COMMAND_`.trim().split('\n');

function HackerSection() {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 mt-16 relative z-20 pb-32 text-left">
      <div className="flex items-center gap-4 mb-2 opacity-60">
         <span className="font-mono text-brand tracking-[0.3em] uppercase text-[10px] md:text-[12px] font-bold">System Logs // 01</span>
         <div className="h-[1px] flex-1 bg-gradient-to-r from-brand/50 to-transparent"></div>
      </div>
      
      <div className="rounded-2xl bg-[#030d09]/80 border border-brand/20 backdrop-blur-xl shadow-[0_0_50px_rgba(94,210,156,0.05)] overflow-hidden group hover:border-brand/40 transition-colors duration-500">
        <div className="flex items-center px-4 py-3 bg-brand/5 border-b border-brand/10 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
          <div className="w-3 h-3 rounded-full bg-brand/80 shadow-[0_0_8px_rgba(94,210,156,0.5)]"></div>
          <div className="ml-4 font-mono text-[10px] text-brand/50 tracking-widest uppercase">root@williamkreese:~</div>
        </div>
        
        <div className="p-6 md:p-8 font-mono text-[11px] md:text-[13px] leading-[1.8] text-brand overflow-x-auto">
          <div className="flex flex-col w-max">
            {systemCode.map((line, idx) => (
              <div key={idx} className="flex gap-6 opacity-70 hover:opacity-100 hover:bg-brand/10 px-2 rounded transition-colors">
                <span className="text-brand/30 select-none w-4 text-right">{String(idx + 1).padStart(2, '0')}</span>
                <span className="whitespace-pre">{line || ' '}</span>
              </div>
            ))}
            <div className="flex gap-6 px-2 mt-1">
              <span className="text-brand/30 select-none w-4 text-right">{String(systemCode.length + 1).padStart(2, '0')}</span>
              <span className="w-2.5 h-4 bg-brand animate-[pulse_1s_ease-in-out_infinite] mt-1 shadow-[0_0_8px_rgba(94,210,156,0.8)]"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <main className="relative z-20 flex flex-col w-full animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 pt-20 text-center w-full max-w-7xl mx-auto">
        {/* Hero Content */}
        <div className="flex flex-col items-center space-y-6 max-w-4xl mx-auto">
          {/* Eyebrow */}
        <div className="font-jakarta font-bold text-[11px] tracking-[0.2em] text-brand uppercase">
          Career-Ready Curriculum
        </div>

        {/* Main Headline */}
        <h1 className="font-inter font-extrabold text-[40px] md:text-[60px] lg:text-[72px] leading-[1.05] tracking-tight uppercase max-w-[1000px]">
          WILLIAM KREESE<span className="text-brand">.</span>
        </h1>

        {/* Description */}
        <p className="font-inter text-[14px] text-white/70 max-w-[512px] leading-relaxed mb-8">
          Master in-demand coding skills, explore cutting-edge design patterns, and discover real-world web development projects built from the ground up.
        </p>


      </div>
      </section>

      {/* Hacker Section */}
      <section className="w-full px-6 max-w-7xl mx-auto">
        <HackerSection />
      </section>
    </main>
  );
}

function About() {
  return (
    <main className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-12 text-center w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="liquid-glass-card relative w-full max-w-2xl p-8 pt-20 md:p-12 md:pt-24 text-left group">
        
        {/* Glass Distortion Exit Sign */}
        <Link 
          to="/" 
          title="Return to Home"
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/20 text-white/70 hover:text-brand hover:border-brand/50 hover:bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:scale-[1.03] transition-all duration-300 z-20"
        >
          <X size={16} />
          <span className="font-mono text-[10px] md:text-[11px] tracking-widest uppercase font-bold">Exit</span>
        </Link>

        <h1 className="font-inter font-extrabold text-[32px] md:text-[48px] leading-tight tracking-tight uppercase mb-2">
          WILLIAM KREESE<span className="text-brand">.</span>
        </h1>
        
        <div className="space-y-6 text-[15px] md:text-[16px] text-white/80 leading-relaxed font-inter">
          <p className="flex items-center gap-4">
            <span className="w-1.5 h-1.5 bg-brand rounded-full shadow-[0_0_8px_rgba(94,210,156,0.8)]"></span>
            I am a photographer, cinema videographer, and editor.
          </p>
          <p className="flex items-center gap-4">
            <span className="w-1.5 h-1.5 bg-brand rounded-full shadow-[0_0_8px_rgba(94,210,156,0.8)]"></span>
            I am passionate about learning and love experiencing new things.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10">
          <a href="mailto:nt146673@gmail.com" className="text-[14px] text-white/50 italic font-medium flex items-center justify-between hover:text-white transition-colors duration-300 group/mail">
            <span>* Contact for work</span>
            <ArrowRight size={16} className="text-brand opacity-80 group-hover/mail:translate-x-2 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </main>
  );
}

function Blog() {
  return (
    <main className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-12 text-center w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="liquid-glass-card relative w-full max-w-2xl p-8 pt-20 md:p-12 md:pt-24 text-left group flex flex-col items-center">
        
        {/* Glass Distortion Exit Sign */}
        <Link 
          to="/" 
          title="Return to Home"
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/20 text-white/70 hover:text-brand hover:border-brand/50 hover:bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:scale-[1.03] transition-all duration-300 z-20"
        >
          <X size={16} />
          <span className="font-mono text-[10px] md:text-[11px] tracking-widest uppercase font-bold">Exit</span>
        </Link>

        <h2 className="text-3xl md:text-5xl font-inter font-extrabold mb-1 tracking-tight uppercase">SOCIALS<span className="text-brand">.</span></h2>
        <p className="text-white/50 text-[13px] mb-8 font-mono tracking-widest text-center">@williamkreese21</p>
        
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* Featured Social - GitHub */}
          <a href="https://github.com/williamkreese21" target="_blank" rel="noopener noreferrer" className="liquid-glass-card col-span-2 min-h-[160px] sm:min-h-[220px] rounded-2xl p-6 flex flex-col items-center justify-center group hover:-translate-y-2 hover:scale-[1.02] duration-500 ease-out text-white hover:text-brand">
            <Github size={48} className="mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-[28px] sm:text-[40px] font-bold tracking-tight mb-2 text-center">GitHub</span>
            <span className="text-[12px] font-mono opacity-60 flex items-center gap-2 group-hover:opacity-100 transition-opacity">
              View Repositories <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          
          {/* Square Buttons */}
          <a href="https://instagram.com/williamkreese21" target="_blank" rel="noopener noreferrer" className="liquid-glass-card aspect-square rounded-2xl p-4 flex flex-col items-center justify-center group hover:-translate-y-2 hover:scale-[1.05] duration-500 ease-out text-white hover:text-brand text-center">
            <Instagram size={32} className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-[15px] sm:text-[18px] font-bold tracking-wide mb-1">Instagram</span>
            <span className="text-[10px] sm:text-[11px] font-mono opacity-50">Photography</span>
          </a>
          
          <a href="https://www.tiktok.com/@williamkreese21" target="_blank" rel="noopener noreferrer" className="liquid-glass-card aspect-square rounded-2xl p-4 flex flex-col items-center justify-center group hover:-translate-y-2 hover:scale-[1.05] duration-500 ease-out text-white hover:text-brand text-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mb-3 opacity-80 group-hover:opacity-100 transition-opacity"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
            <span className="text-[15px] sm:text-[18px] font-bold tracking-wide mb-1">TikTok</span>
            <span className="text-[10px] sm:text-[11px] font-mono opacity-50">Shorts</span>
          </a>
        </div>
      </div>
    </main>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle Scroll state for Sticky Navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic continuous header values
  const scrollProgress = Math.min(Math.max(scrollY / 150, 0), 1); // Shrink continuously over 150px
  const paddingY = 24 - (scrollProgress * 12); // Shrinks from 24px to 12px
  const bgOpacity = scrollProgress * 0.8; // Fades background from 0 to 0.8
  const shadowOpacity = scrollProgress * 0.5; // Shadow fades in
  const blurValue = scrollProgress * 15; // Glassmorphism max blur forced to 15px

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoSrc = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
      });
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // Force max quality to 1080p
        const levels = data.levels;
        let bestLevel = -1;
        
        levels.forEach((level, index) => {
          if (level.height <= 1080) {
            bestLevel = Math.max(bestLevel, index);
          }
        });
        
        if (bestLevel !== -1) {
          hls.currentLevel = bestLevel;
        }
        
        video.play().catch((e) => console.log('Video auto-play suppressed', e));
      });
      
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch((e) => console.log('Video auto-play suppressed', e));
      });
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-dark text-white font-inter selection:bg-brand selection:text-dark flex flex-col">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-dark">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen scale-105"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent z-10" />
      </div>

      {/* Grid System (Visible on Desktop) */}
      <div className="absolute inset-0 z-0 hidden lg:flex w-full max-w-7xl mx-auto px-6 pointer-events-none">
        <div className="h-full w-px bg-white/10 absolute left-1/4" />
        <div className="h-full w-px bg-white/10 absolute left-2/4" />
        <div className="h-full w-px bg-white/10 absolute left-3/4" />
      </div>

      {/* Central Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-80">
        <svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
            </filter>
          </defs>
          <ellipse cx="400" cy="200" rx="300" ry="100" fill="#0f4c3a" filter="url(#glowBlur)" />
        </svg>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Masked Background Layer */}
        <div 
          className="absolute top-0 left-0 right-0 bottom-[-50px] pointer-events-none"
          style={{
            backgroundColor: `rgba(7, 11, 10, ${bgOpacity})`,
            backdropFilter: `blur(${blurValue}px)`,
            WebkitBackdropFilter: `blur(${blurValue}px)`,
            boxShadow: `0 10px 30px -10px rgba(0,0,0,${shadowOpacity})`,
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
          }}
        />
        
        {/* Header Content */}
        <div 
          className="relative z-10 flex items-center justify-between px-6 md:px-12 w-full max-w-7xl mx-auto transition-none"
          style={{
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`
          }}
        >
          <Link to="/" className="text-white font-bold tracking-widest text-xl z-50 hover:text-brand transition-colors">
            EDKR
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-inter text-[16px]">
            <Link to="/blog" className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none ${location.pathname === '/blog' ? 'text-brand' : ''}`}>BLOG</Link>
            <Link to="/about" className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none ${location.pathname === '/about' ? 'text-brand' : ''}`}>ABOUT</Link>
            <Link to="/esp" className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none ${location.pathname === '/esp' ? 'text-brand' : ''}`}>EsPiFF</Link>
            <a 
              href="https://github.com/williamkreese21" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 shadow-[inset_0_4px_6px_rgba(255,255,255,0.2),_0_8px_32px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:shadow-[inset_0_4px_6px_rgba(255,255,255,0.3),_0_12px_40px_rgba(0,0,0,0.6)] hover:scale-105 transition-all duration-300 group overflow-hidden focus:outline-none"
            >
              <Github className="w-5 h-5 text-white/70 group-hover:text-brand transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              <span className="font-bold text-[13px] tracking-widest uppercase text-white/90 group-hover:text-white mt-0.5">GITHUB</span>
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white z-50 p-2 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-dark/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 text-2xl font-inter md:hidden">
          <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none text-2xl ${location.pathname === '/blog' ? 'text-brand' : ''}`}>BLOG</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none text-2xl ${location.pathname === '/about' ? 'text-brand' : ''}`}>ABOUT</Link>
          <Link to="/esp" onClick={() => setIsMobileMenuOpen(false)} className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none text-2xl ${location.pathname === '/esp' ? 'text-brand' : ''}`}>EsPiFF</Link>
          <a 
            href="https://github.com/williamkreese21" 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-8 py-4 mt-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 shadow-[inset_0_4px_6px_rgba(255,255,255,0.2),_0_8px_32px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:scale-105 transition-all duration-300 group overflow-hidden focus:outline-none"
          >
            <Github className="w-8 h-8 text-white/70 group-hover:text-brand transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <span className="font-bold text-[18px] tracking-widest uppercase text-white/90 group-hover:text-white mt-1">GITHUB</span>
          </a>
        </div>
      )}

      {/* Render Pages */}
      <div className="flex-grow flex flex-col relative z-20">
        {children}
      </div>

      {/* Footer Powered By */}
      <footer className="w-full py-8 text-center bg-dark/20 backdrop-blur-md border-t border-white/5 relative z-20 mt-auto overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl pointer-events-none" />
        <span className="font-mono text-[10px] md:text-[12px] tracking-[0.3em] uppercase text-white/40 group-hover:text-brand/80 transition-colors duration-500">
          POWERED BY <span className="text-white/60 group-hover:text-white transition-colors duration-500 font-bold ml-1">WILLIAM KREESE</span>
        </span>
      </footer>
    </div>
  );
}



export default function App() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  function handleLoadingComplete() {
    setAppLoaded(true);
    setTimeout(() => setShowLoader(false), 1500); // Wait for the new 1500ms transition
  }

  return (
    <>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/esp" element={<EspBoards />} />
          </Routes>
        </Layout>
      </HashRouter>

      {/* Loading Overlay */}
      {showLoader && (
        <div 
          className={`fixed inset-0 z-[9999] bg-dark flex flex-col transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none shadow-[inset_0_0_150px_rgba(94,210,156,0.1)] ${
            appLoaded ? 'opacity-0 scale-[1.15] blur-xl' : 'opacity-100 scale-100 blur-0'
          }`}
        >
          <HackerLoader onComplete={handleLoadingComplete} />
        </div>
      )}
    </>
  );
}
