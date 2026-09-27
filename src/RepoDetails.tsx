import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ExternalLink, 
  Github, 
  Star, 
  GitFork, 
  Info, 
  Clock, 
  ArrowLeft, 
  Eye, 
  Key, 
  RefreshCw, 
  AlertCircle,
  Check
} from 'lucide-react';

export default function RepoDetails() {
  const { owner, repo } = useParams<{ owner: string, repo: string }>();
  const repoUrl = `${owner}/${repo}`;
  
  const [repoData, setRepoData] = useState<any>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const [customToken, setCustomToken] = useState<string>(() => {
    return sessionStorage.getItem('gh_classic_pat') || '';
  });
  const [showTokenPrompt, setShowTokenPrompt] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);

  const fetchRepo = async (token?: string) => {
    setLoading(true);
    setRateLimitExceeded(false);
    const activeToken = token ?? customToken;

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    };
    if (activeToken.trim()) {
      headers['Authorization'] = `Bearer ${activeToken.trim()}`;
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${repoUrl}`, { headers });
      
      if (res.status === 403 || res.status === 429) {
        setRateLimitExceeded(true);
      }

      if (res.ok) {
        const data = await res.json();
        setRepoData(data);
      }
      
      const readmeRes = await fetch(`https://api.github.com/repos/${repoUrl}/readme`, { headers });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        if (readmeData.content) {
          // Decode base64 - remove whitespace/newlines inserted by GitHub API
          const cleanBase64 = readmeData.content.replace(/\s+/g, '');
          const text = atob(cleanBase64);
          const bytes = new Uint8Array(text.length);
          for (let i = 0; i < text.length; i++) {
            bytes[i] = text.charCodeAt(i);
          }
          const decoder = new TextDecoder('utf-8');
          setReadme(decoder.decode(bytes));
        }
      }
    } catch (err) {
      console.error('Error fetching repository details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (owner && repo) {
      fetchRepo();
    }
  }, [repoUrl, owner, repo]);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (customToken.trim()) {
      sessionStorage.setItem('gh_classic_pat', customToken.trim());
      setTokenSaved(true);
      setTimeout(() => setTokenSaved(false), 2000);
      fetchRepo(customToken.trim());
    } else {
      sessionStorage.removeItem('gh_classic_pat');
      fetchRepo('');
    }
  };

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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
            <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <Github size={32} className="text-brand shrink-0" />
              <span className="truncate">{repoData ? repoData.name : repo || 'Repository'}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowTokenPrompt(!showTokenPrompt)}
                className={`text-xs font-mono px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 border ${
                  customToken 
                    ? 'bg-brand/10 border-brand/40 text-brand hover:bg-brand/20' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="GitHub Personal Access Token (classic)"
              >
                <Key size={14} />
                <span>{customToken ? 'Token Active' : 'PAT Token'}</span>
              </button>
              <a 
                href={`https://github.com/${repoUrl}/subscription`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-mono bg-cyan-500/10 hover:bg-cyan-500 hover:text-black border border-cyan-500/30 text-cyan-300 px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                title="Watch this repository on GitHub"
              >
                <Eye size={14} />
                <span>Watch</span>
              </a>
              <a 
                href={`https://github.com/${repoUrl}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-mono bg-white/10 hover:bg-brand hover:text-dark px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-white/10 text-white"
              >
                <span>View on GitHub</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Optional GitHub PAT (Classic) input drawer */}
          {(showTokenPrompt || rateLimitExceeded) && (
            <div className="bg-white/5 border border-brand/30 rounded-2xl p-6 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <Key className="text-brand shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    GitHub Personal Access Token (Classic)
                  </h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Khi API GitHub vượt quá giới hạn (60 lượt/giờ) hoặc cần xem repo riêng tư, hãy cung cấp <strong>GitHub Personal Access Token (classic)</strong>.
                    Tạo token tại: <code className="text-brand">Settings &gt; Developer settings &gt; Personal access tokens &gt; Tokens (classic)</code> với quyền <code className="text-brand">repo</code>.
                  </p>
                  <form onSubmit={handleSaveToken} className="mt-3 flex flex-wrap items-center gap-2">
                    <input 
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value={customToken}
                      onChange={(e) => setCustomToken(e.target.value)}
                      className="bg-black/50 border border-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-brand w-full max-w-md"
                    />
                    <button 
                      type="submit"
                      className="bg-brand text-dark font-mono text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand/90 transition-all flex items-center gap-1.5"
                    >
                      {tokenSaved ? <Check size={14} /> : <RefreshCw size={14} />}
                      {tokenSaved ? 'Saved & Applied' : 'Save & Reload'}
                    </button>
                    {customToken && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomToken('');
                          sessionStorage.removeItem('gh_classic_pat');
                          fetchRepo('');
                        }}
                        className="text-xs font-mono text-white/50 hover:text-red-400 px-3 py-2 transition-colors"
                      >
                        Clear Token
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Star size={20} className="text-brand" />
              Repository Status &amp; Watch Metrics
            </h3>
            <button
              onClick={() => fetchRepo()}
              className="text-xs font-mono text-white/50 hover:text-brand flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
            </div>
          ) : repoData ? (
            <div className="flex flex-col gap-8">
              {/* Stat Grid with Watchers / Stars / Forks / Issues / Last Update */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {/* Stars */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-yellow-400/30 transition-all">
                  <Star size={22} className="text-yellow-400 mb-2" />
                  <span className="text-2xl md:text-3xl font-bold text-white">{repoData.stargazers_count ?? 0}</span>
                  <span className="text-xs font-mono text-white/50 uppercase mt-0.5">Stars</span>
                </div>

                {/* Watchers / Subscribers */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-cyan-400/30 transition-all">
                  <Eye size={22} className="text-cyan-400 mb-2" />
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {repoData.subscribers_count ?? repoData.watchers_count ?? 0}
                  </span>
                  <span className="text-xs font-mono text-cyan-300/70 uppercase mt-0.5">Watchers</span>
                </div>

                {/* Forks */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-blue-400/30 transition-all">
                  <GitFork size={22} className="text-blue-400 mb-2" />
                  <span className="text-2xl md:text-3xl font-bold text-white">{repoData.forks_count ?? 0}</span>
                  <span className="text-xs font-mono text-white/50 uppercase mt-0.5">Forks</span>
                </div>

                {/* Issues */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-green-400/30 transition-all">
                  <Info size={22} className="text-green-400 mb-2" />
                  <span className="text-2xl md:text-3xl font-bold text-white">{repoData.open_issues_count ?? 0}</span>
                  <span className="text-xs font-mono text-white/50 uppercase mt-0.5">Issues</span>
                </div>

                {/* Last Update */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-purple-400/30 transition-all col-span-2 sm:col-span-1">
                  <Clock size={22} className="text-purple-400 mb-2" />
                  <span className="text-base md:text-lg font-bold text-white mt-1">
                    {repoData.updated_at ? new Date(repoData.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="text-xs font-mono text-white/50 uppercase mt-0.5">Last Update</span>
                </div>
              </div>

              {/* Repo Information Box */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-white">{repoData.full_name}</h4>
                    {repoData.license && (
                      <span className="inline-block mt-1 text-[11px] font-mono text-white/60 bg-white/10 px-2.5 py-0.5 rounded-full">
                        License: {repoData.license.spdx_id || repoData.license.name}
                      </span>
                    )}
                  </div>
                  {repoData.default_branch && (
                    <span className="text-xs font-mono text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full w-fit">
                      default branch: {repoData.default_branch}
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-2 text-white/80">About</h5>
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
                
                {repoData.topics && repoData.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {repoData.topics.map((topic: string) => (
                      <span key={topic} className="bg-brand/20 text-brand px-3 py-1.5 rounded-md text-xs font-mono uppercase">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* README */}
                {readme ? (
                  <div className="mt-8 border-t border-white/10 pt-8">
                    <h5 className="text-base font-mono text-white/50 uppercase mb-6 tracking-wider flex items-center gap-2">
                      <Info size={16} /> README.md
                    </h5>
                    <div className="w-full overflow-x-auto bg-black/40 rounded-xl p-6 border border-white/10">
                      <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap leading-relaxed bg-transparent p-0 m-0 border-none">
                        {readme}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 border-t border-white/10 pt-6 text-white/40 text-xs font-mono">
                    No README found or README content is empty.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 flex flex-col items-center justify-center gap-4 text-white/50 font-mono">
              <AlertCircle size={36} className="text-yellow-400" />
              <p className="text-lg">Could not load repository data for {repoUrl}.</p>
              {rateLimitExceeded && (
                <p className="text-xs text-yellow-300 max-w-md">
                  GitHub API rate limit exceeded. Please click PAT Token above and provide a GitHub Personal Access Token (classic).
                </p>
              )}
              <button 
                onClick={() => fetchRepo()}
                className="mt-2 px-4 py-2 bg-white/10 hover:bg-brand hover:text-dark rounded-xl text-xs uppercase font-bold transition-all"
              >
                Retry Request
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
