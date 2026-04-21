/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { ArrowRight, Menu, X, Github, Instagram, Youtube } from 'lucide-react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

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
  const [isShooting, setIsShooting] = useState(false);

  const handleGetStarted = () => {
    if (isShooting) return;
    setIsShooting(true);
    setTimeout(() => {
      window.open("https://motionsites.ai/", "_blank");
      // Reset animation nicely shortly after opening link
      setTimeout(() => setIsShooting(false), 200);
    }, 500); // Wait for the transition
  };

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

        {/* CTA Button */}
        <button 
          onClick={handleGetStarted}
          className="group mt-4 relative flex items-center gap-3 overflow-hidden bg-brand text-dark hover:bg-white transition-all duration-300 rounded-full px-8 py-4 font-bold uppercase tracking-wider text-[13px]"
        >
          <span className="relative z-10 whitespace-nowrap">Get Started</span>
          <div className={`bg-dark/10 p-1 rounded-full bg-blend-difference transition-all duration-500 ease-in-out ${
            isShooting ? 'translate-x-[150px] opacity-0' : 'group-hover:bg-dark/20'
          }`}>
            <ArrowRight size={16} />
          </div>
        </button>
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
        <div className="font-jakarta font-bold text-[11px] tracking-[0.2em] text-brand uppercase mb-8">
          Real Name: Sang
        </div>
        
        <div className="space-y-6 text-[15px] md:text-[16px] text-white/80 leading-relaxed font-inter">
          <p className="flex items-center gap-4">
            <span className="w-1.5 h-1.5 bg-brand rounded-full shadow-[0_0_8px_rgba(94,210,156,0.8)]"></span>
            Tôi là 1 photographer, videographer and editor.
          </p>
          <p className="flex items-center gap-4">
            <span className="w-1.5 h-1.5 bg-brand rounded-full shadow-[0_0_8px_rgba(94,210,156,0.8)]"></span>
            Tôi ở HCM, Việt Nam.
          </p>
          <p className="flex items-center gap-4">
            <span className="w-1.5 h-1.5 bg-brand rounded-full shadow-[0_0_8px_rgba(94,210,156,0.8)]"></span>
            Tôi là 1 người đam mê học hỏi và thích trải nghiệm.
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

function Projects() {
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
        
        <h2 className="text-3xl md:text-5xl font-inter font-extrabold mb-8 tracking-tight uppercase">PROJECTS<span className="text-brand">.</span></h2>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
          {/* Featured Project - Bigger */}
          <a href="https://motionsites.ai/" target="_blank" rel="noopener noreferrer" className="liquid-glass-card col-span-2 sm:col-span-3 min-h-[160px] sm:min-h-[220px] rounded-2xl p-6 flex flex-col items-center justify-center group hover:-translate-y-2 hover:scale-[1.02] duration-500 ease-out text-white hover:text-brand">
            <span className="text-[28px] sm:text-[40px] font-bold tracking-tight mb-2 text-center">Tools Ai</span>
            <span className="text-[12px] font-mono opacity-60 flex items-center gap-2 group-hover:opacity-100 transition-opacity">
              Launch Platform <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          
          {/* Square Buttons */}
          <a href="https://e-d-k-r.vercel.app/" target="_blank" rel="noopener noreferrer" className="liquid-glass-card aspect-square rounded-2xl p-4 flex flex-col items-center justify-center group hover:-translate-y-2 hover:scale-[1.05] duration-500 ease-out text-white hover:text-brand text-center">
            <span className="text-[15px] sm:text-[18px] font-bold tracking-wide mb-1">E-D-K-R</span>
            <span className="text-[10px] sm:text-[11px] font-mono opacity-50">Vercel App</span>
          </a>
          
          <a href="http://williamkreese.wordpress.com/" target="_blank" rel="noopener noreferrer" className="liquid-glass-card aspect-square rounded-2xl p-4 flex flex-col items-center justify-center group hover:-translate-y-2 hover:scale-[1.05] duration-500 ease-out text-white hover:text-brand text-center">
            <span className="text-[15px] sm:text-[18px] font-bold tracking-wide mb-1">First web</span>
            <span className="text-[10px] sm:text-[11px] font-mono opacity-50">Blog Site</span>
          </a>
          
          <a href="https://william-kreese-21.vercel.app/" target="_blank" rel="noopener noreferrer" className="liquid-glass-card hover:aspect-square aspect-auto sm:aspect-square rounded-2xl p-4 flex flex-col items-center justify-center group hover:-translate-y-2 hover:scale-[1.05] duration-500 ease-out text-white hover:text-brand text-center col-span-2 sm:col-span-1 min-h-[100px] sm:min-h-0">
            <span className="text-[15px] sm:text-[18px] font-bold tracking-wide mb-1">Portfolio v2</span>
            <span className="text-[10px] sm:text-[11px] font-mono opacity-50">Archive App</span>
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
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
          {/* Featured Social - GitHub */}
          <a href="https://github.com/williamkreese21" target="_blank" rel="noopener noreferrer" className="liquid-glass-card col-span-2 sm:col-span-3 min-h-[160px] sm:min-h-[220px] rounded-2xl p-6 flex flex-col items-center justify-center group hover:-translate-y-2 hover:scale-[1.02] duration-500 ease-out text-white hover:text-brand">
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
          
          <a href="https://tiktok.com/@williamkreese21" target="_blank" rel="noopener noreferrer" className="liquid-glass-card aspect-square rounded-2xl p-4 flex flex-col items-center justify-center group hover:-translate-y-2 hover:scale-[1.05] duration-500 ease-out text-white hover:text-brand text-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mb-3 opacity-80 group-hover:opacity-100 transition-opacity"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
            <span className="text-[15px] sm:text-[18px] font-bold tracking-wide mb-1">TikTok</span>
            <span className="text-[10px] sm:text-[11px] font-mono opacity-50">Shorts</span>
          </a>
          
          <a href="https://youtube.com/@williamkreese21" target="_blank" rel="noopener noreferrer" className="liquid-glass-card hover:aspect-square aspect-auto sm:aspect-square rounded-2xl p-4 flex flex-col items-center justify-center group hover:-translate-y-2 hover:scale-[1.05] duration-500 ease-out text-white hover:text-brand text-center col-span-2 sm:col-span-1 min-h-[100px] sm:min-h-0">
            <Youtube size={32} className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity hidden sm:block" />
            <span className="text-[15px] sm:text-[18px] font-bold tracking-wide mb-1">YouTube</span>
            <span className="text-[10px] sm:text-[11px] font-mono opacity-50">Videos</span>
          </a>
        </div>
      </div>
    </main>
  );
}

function StarsLayer() {
  const [stars, setStars] = useState<{ id: number; left: string; top: string; delay: string; duration: string; size: number }[]>([]);

  useEffect(() => {
    // Generate massive star field on mount to prevent rendering huge CSS strings
    const generateStars = (count: number, maxSize: number = 2) => {
      return Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${Math.random() * 150 + 50}s`, // Between 50s and 200s
        size: Math.random() > 0.8 ? maxSize : 1, // 20% chance of bigger star
      }));
    };
    
    // Total 1000 stars, mixed sizes
    setStars(generateStars(1000, 3));
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-70 mix-blend-screen pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `animStar ${star.duration} linear infinite`,
            animationDelay: star.delay,
            boxShadow: star.size > 2 ? '0 0 8px 2px rgba(255,255,255,1)' : '0 0 2px 0px rgba(255,255,255,0.5)'
          }}
        />
      ))}
      <style>{`
        @keyframes animStar {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-2000px); opacity: 0.8; }
        }
      `}</style>
    </div>
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
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
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

      {/* Animated Deep Space Stars */}
      <StarsLayer />

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
            <Link to="/projects" className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none ${location.pathname === '/projects' ? 'text-brand' : ''}`}>PROJECTS</Link>
            <Link to="/blog" className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none ${location.pathname === '/blog' ? 'text-brand' : ''}`}>BLOG</Link>
            <Link to="/about" className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none ${location.pathname === '/about' ? 'text-brand' : ''}`}>ABOUT</Link>
            <a 
              href="https://aistudio.google.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 shadow-[inset_0_4px_6px_rgba(255,255,255,0.2),_0_8px_32px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:shadow-[inset_0_4px_6px_rgba(255,255,255,0.3),_0_12px_40px_rgba(0,0,0,0.6)] hover:scale-105 transition-all duration-300 group overflow-hidden focus:outline-none"
            >
              <svg className="w-5 h-5 text-blue-400 group-hover:text-brand transition-colors drop-shadow-[0_0_8px_rgba(94,210,156,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12C16.0294 12 12 7.97056 12 3C12 7.97056 7.97056 12 3 12C7.97056 12 12 16.0294 12 21C12 16.0294 16.0294 12 21 12Z"/>
              </svg>
              <span className="font-bold text-[13px] tracking-widest uppercase text-white/90 group-hover:text-white mt-0.5">AI Studio</span>
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
          <Link to="/projects" onClick={() => setIsMobileMenuOpen(false)} className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none text-2xl ${location.pathname === '/projects' ? 'text-brand' : ''}`}>PROJECTS</Link>
          <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none text-2xl ${location.pathname === '/blog' ? 'text-brand' : ''}`}>BLOG</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={`hover:text-brand transition-colors duration-300 uppercase focus:outline-none text-2xl ${location.pathname === '/about' ? 'text-brand' : ''}`}>ABOUT</Link>
          <a 
            href="https://aistudio.google.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-8 py-4 mt-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 shadow-[inset_0_4px_6px_rgba(255,255,255,0.2),_0_8px_32px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:scale-105 transition-all duration-300 group overflow-hidden focus:outline-none"
          >
            <svg className="w-8 h-8 text-blue-400 group-hover:text-brand transition-colors drop-shadow-[0_0_8px_rgba(94,210,156,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12C16.0294 12 12 7.97056 12 3C12 7.97056 7.97056 12 3 12C7.97056 12 12 16.0294 12 21C12 16.0294 16.0294 12 21 12Z"/>
            </svg>
            <span className="font-bold text-[18px] tracking-widest uppercase text-white/90 group-hover:text-white mt-1">AI Studio</span>
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
          POWERED / CRAFTED BY <span className="text-white/60 group-hover:text-white transition-colors duration-500 font-bold ml-1">WILLIAM KREESE</span>
        </span>
      </footer>
    </div>
  );
}

const hackerLines = [
  "Checking authority...",
  "Initializing system...",
  "Optimizing system...",
  "Checking data...",
  "Accessing data...",
  "Synchronizing data...",
  "Loading data...",
  "Waiting..."
];

function HackerLoader({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<{text: string, status: 'loading'|'ok'|'done'}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinner, setSpinner] = useState(0);
  const spinners = ['|', '/', '-', '\\'];

  // Terminal Spinner Effect
  useEffect(() => {
    const intId = setInterval(() => {
      setSpinner(s => (s + 1) % 4);
    }, 100);
    return () => clearInterval(intId);
  }, []);

  // Sequence Progression
  useEffect(() => {
    if (currentIndex < hackerLines.length) {
      setLines(prev => [...prev, { text: hackerLines[currentIndex], status: 'loading' }]);
      
      const timer = setTimeout(() => {
        setLines(prev => {
          const newLines = [...prev];
          newLines[newLines.length - 1].status = 'ok';
          return newLines;
        });
        setCurrentIndex(prev => prev + 1);
      }, Math.floor(Math.random() * 300) + 200); // Random loading time between 200-500ms
      
      return () => clearTimeout(timer);
    } else if (currentIndex === hackerLines.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, { text: "Complete.", status: 'done' }]);
        setTimeout(onComplete, 600); // Hold final screen for a moment before fading
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, onComplete]);

  return (
    <div className="w-full h-full p-8 md:p-16 font-mono text-[11px] md:text-[13px] leading-none text-brand flex flex-col justify-center items-center tracking-[0.25em] uppercase">
      <div className="flex flex-col gap-1.5 w-fit text-left origin-center">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span>{line.text}</span>
            {line.status === 'ok' && <span className="text-white ml-2">ok</span>}
            {line.status === 'loading' && <span className="ml-2">{spinners[spinner]}</span>}
          </div>
        ))}
        {/* Blinking CLI Cursor */}
        <div className="mt-2 w-3 h-5 bg-brand animate-[pulse_1s_ease-in-out_infinite]" />
      </div>
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
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blog" element={<Blog />} />
          </Routes>
        </Layout>
      </BrowserRouter>

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
