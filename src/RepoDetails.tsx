import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { X, ExternalLink, Github, Star, GitFork, Info, Clock, ArrowLeft } from 'lucide-react';

export default function RepoDetails() {
  const { owner, repo } = useParams<{ owner: string, repo: string }>();
  const repoUrl = `${owner}/${repo}`;
  
  const [repoData, setRepoData] = useState<any>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepo() {
      setLoading(true);
      try {
        const res = await fetch(`https://api.github.com/repos/${repoUrl}`);
        if (res.ok) {
          const data = await res.json();
          setRepoData(data);
        }
        
        const readmeRes = await fetch(`https://api.github.com/repos/${repoUrl}/readme`);
        if (readmeRes.ok) {
          const readmeData = await readmeRes.json();
          // Decode base64
          // UTF-8 friendly decode
          const text = atob(readmeData.content);
          const bytes = new Uint8Array(text.length);
          for (let i = 0; i < text.length; i++) {
            bytes[i] = text.charCodeAt(i);
          }
          const decoder = new TextDecoder('utf-8');
          setReadme(decoder.decode(bytes));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (owner && repo) {
      fetchRepo();
    }
  }, [repoUrl, owner, repo]);

  return (
    <main className="relative z-20 flex flex-col items-center justify-start min-h-screen px-6 pt-32 pb-24 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="liquid-glass-card relative w-full p-8 md:p-12 text-left flex flex-col min-h-[70vh]">
        <Link 
          to="/esp" 
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/20 text-white/70 hover:text-brand hover:border-brand/50 hover:bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:scale-[1.03] transition-all duration-300 z-20"
        >
          <ArrowLeft size={16} />
          <span className="font-mono text-[10px] md:text-[11px] tracking-widest uppercase font-bold">Back to ESP Hub</span>
        </Link>

        <div className="flex flex-col gap-8 mt-12 md:mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
            <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <Github size={32} className="text-brand" />
              {repoData ? repoData.name : 'Loading Repository...'}
            </h2>
            <a 
              href={`https://github.com/${repoUrl}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-sm font-mono bg-white/10 hover:bg-brand hover:text-dark px-4 py-2 rounded-lg transition-colors flex items-center gap-2 w-fit"
            >
              View on GitHub <ExternalLink size={14} />
            </a>
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Star size={20} className="text-brand" />
              Repository Status
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
            </div>
          ) : repoData ? (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                  <Star size={24} className="text-yellow-400 mb-3" />
                  <span className="text-3xl font-bold text-white">{repoData.stargazers_count}</span>
                  <span className="text-sm font-mono text-white/50 uppercase">Stars</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                  <GitFork size={24} className="text-blue-400 mb-3" />
                  <span className="text-3xl font-bold text-white">{repoData.forks_count}</span>
                  <span className="text-sm font-mono text-white/50 uppercase">Forks</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                  <Info size={24} className="text-green-400 mb-3" />
                  <span className="text-3xl font-bold text-white">{repoData.open_issues_count}</span>
                  <span className="text-sm font-mono text-white/50 uppercase">Issues</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                  <Clock size={24} className="text-purple-400 mb-3" />
                  <span className="text-lg font-bold text-white mt-1">{new Date(repoData.updated_at).toLocaleDateString()}</span>
                  <span className="text-sm font-mono text-white/50 uppercase mt-1">Last Update</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h4 className="text-xl font-bold text-white mb-6">{repoData.full_name}</h4>
                <div className="mb-6">
                  <h5 className="text-lg font-bold text-white uppercase tracking-wider mb-2">About</h5>
                  <p className="text-white/70 text-base leading-relaxed">
                    {repoData.description === 'Herramienta para auditoría de redes 2.4Ghz ' 
                      ? '2.4GHz network auditing tool' 
                      : repoData.description === 'Herramienta para auditoría de redes 2.4Ghz'
                      ? '2.4GHz network auditing tool'
                      : (repoData.description || '').includes('expande la V1.0 con soporte para módulos IR M5Stack y CC1101')
                      ? 'ESP32-TOOLS-PRO-480x320-V2.0 expands V1.0 with support for M5Stack IR modules and CC1101. It adds IR capture/replay, saved controls, sub-GHz RF analysis, WiFi/BLE Radar, iPhone Remote, and advanced diagnostics for WiFi, BLE, IR, and RF testing on an ESP32 with a 480x320 TFT display.'
                      : repoData.description || "No description provided."}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {repoData.topics?.map((topic: string) => (
                    <span key={topic} className="bg-brand/20 text-brand px-3 py-1.5 rounded-md text-xs font-mono uppercase">
                      {topic}
                    </span>
                  ))}
                </div>

                {readme && (
                  <div className="mt-8 border-t border-white/10 pt-8">
                    <h5 className="text-base font-mono text-white/50 uppercase mb-6 tracking-wider flex items-center gap-2">
                      <Info size={16} /> README.md
                    </h5>
                    <div className="w-full overflow-x-auto">
                      <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap leading-relaxed bg-transparent p-0 m-0 border-none">{readme}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-white/50 font-mono text-lg">
              Could not load repository data.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
