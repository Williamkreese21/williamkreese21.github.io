import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Play, 
  Pause, 
  RotateCw, 
  Activity, 
  Maximize2, 
  Sliders, 
  Cpu, 
  Wifi, 
  Eye, 
  ExternalLink,
  ChevronRight,
  Palette,
  Eraser,
  Sparkles
} from 'lucide-react';
import { ESP32S3_PROJECT_FILES, ProjectFile } from '../data/esp32s3_project';

interface TftFramebufferWebUIProps {
  isConnected: boolean;
  baudRate: number;
  onSendSerial: (data: string | Uint8Array) => void;
}

export default function TftFramebufferWebUI({
  isConnected,
  baudRate,
  onSendSerial
}: TftFramebufferWebUIProps) {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(ESP32S3_PROJECT_FILES[0]);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'project'>('stream');
  
  // Live Framebuffer Stream State
  const [streamActive, setStreamActive] = useState<boolean>(true);
  const [pattern, setPattern] = useState<'cube' | 'bars' | 'plasma' | 'matrix' | 'draw'>('cube');
  const [drawColor, setDrawColor] = useState<string>('#5ed29c');
  const [fps, setFps] = useState<number>(60);
  const [resolution, setResolution] = useState<'320x240' | '240x240' | '480x320'>('320x240');
  const [brightness, setBrightness] = useState<number>(100);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Copy file content handler
  const handleCopy = (content: string, path: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // Download single file handler
  const handleDownloadFile = (file: ProjectFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download all files as a simple bundle
  const handleDownloadAll = () => {
    const combined = ESP32S3_PROJECT_FILES.map(f => `// ==========================================\n// FILE: ESP32S3_TFT_Framebuffer_WebUI/${f.path}\n// ==========================================\n\n${f.content}\n\n`).join('\n');
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ESP32S3_TFT_Framebuffer_WebUI_Bundle.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Canvas Frame Rendering Loop (3D Cube, Plasma, Bars, Matrix)
  useEffect(() => {
    if (!canvasRef.current || !streamActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;
    let frameCount = 0;
    let lastTime = performance.now();
    let currentFps = 60;

    // Matrix rain state
    const matrixCols = 40;
    const matrixDrops: number[] = Array(matrixCols).fill(1);

    const render = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 500) {
        currentFps = Math.round((frameCount * 1000) / (now - lastTime));
        setFps(currentFps);
        frameCount = 0;
        lastTime = now;
      }

      if (pattern === 'cube') {
        // 3D Rotating Wireframe Cube in ST7789 Framebuffer
        ctx.fillStyle = '#050a08';
        ctx.fillRect(0, 0, 320, 240);

        // Draw HUD Header
        ctx.fillStyle = '#5ed29c';
        ctx.font = '10px monospace';
        ctx.fillText('ESP32-S3 DMA TFT STREAM | 320x240 RGB565', 10, 16);
        ctx.fillStyle = 'rgba(94,210,156,0.5)';
        ctx.fillText(`FPS: ${currentFps} | PSRAM: 8MB | SPI: 40MHz`, 10, 28);

        // 3D Math
        rotX += 0.02;
        rotY += 0.03;
        rotZ += 0.01;

        const size = 50;
        const vertices = [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ].map(([x, y, z]) => {
          // Rotate X
          let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
          let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
          // Rotate Y
          let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
          let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);
          // Rotate Z
          let x3 = x2 * Math.cos(rotZ) - y1 * Math.sin(rotZ);
          let y3 = x2 * Math.sin(rotZ) + y1 * Math.cos(rotZ);

          // Perspective projection
          const distance = 3.5;
          const fov = 160;
          const projX = (x3 * fov) / (z2 + distance) + 160;
          const projY = (y3 * fov) / (z2 + distance) + 125;
          return { x: projX, y: projY, z: z2 };
        });

        const edges = [
          [0,1],[1,2],[2,3],[3,0],
          [4,5],[5,6],[6,7],[7,4],
          [0,4],[1,5],[2,6],[3,7]
        ];

        // Draw Cube Edges with Glow
        ctx.strokeStyle = '#5ed29c';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#5ed29c';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        edges.forEach(([i, j]) => {
          ctx.moveTo(vertices[i].x, vertices[i].y);
          ctx.lineTo(vertices[j].x, vertices[j].y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Vertices
        vertices.forEach(v => {
          ctx.fillStyle = '#72ffbf';
          ctx.beginPath();
          ctx.arc(v.x, v.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        // Bottom stats
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '9px monospace';
        ctx.fillText('WEBSOCKET /ws -> LIVE BUFFER SYNC', 10, 230);
      } else if (pattern === 'bars') {
        // SMPTE-style 8-Color Bar test pattern
        const barColors = ['#FFFFFF', '#FFFF00', '#00FFFF', '#00FF00', '#FF00FF', '#FF0000', '#0000FF', '#000000'];
        const barW = 320 / barColors.length;
        barColors.forEach((col, idx) => {
          ctx.fillStyle = col;
          ctx.fillRect(idx * barW, 0, barW, 200);
        });
        // Gradient ramp at bottom
        for (let x = 0; x < 320; x++) {
          const shade = Math.floor((x / 320) * 255);
          ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
          ctx.fillRect(x, 200, 1, 40);
        }
      } else if (pattern === 'plasma') {
        // Real-time sinusoidal plasma wave
        const t = performance.now() * 0.002;
        const imgData = ctx.createImageData(320, 240);
        const data = imgData.data;
        let idx = 0;
        for (let y = 0; y < 240; y += 2) {
          for (let x = 0; x < 320; x += 2) {
            const v1 = Math.sin(x * 0.03 + t);
            const v2 = Math.sin(y * 0.03 + t);
            const v3 = Math.sin((x + y) * 0.02 + t);
            const val = (v1 + v2 + v3) / 3;
            const r = Math.floor(Math.sin(val * Math.PI) * 127 + 128);
            const g = Math.floor(Math.sin(val * Math.PI + 2) * 127 + 128);
            const b = Math.floor(Math.sin(val * Math.PI + 4) * 127 + 128);

            // 2x2 block
            for (let dy = 0; dy < 2; dy++) {
              for (let dx = 0; dx < 2; dx++) {
                const p = ((y + dy) * 320 + (x + dx)) * 4;
                data[p] = r;
                data[p + 1] = g;
                data[p + 2] = b;
                data[p + 3] = 255;
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (pattern === 'matrix') {
        // Digital Matrix Rain
        ctx.fillStyle = 'rgba(3, 10, 6, 0.15)';
        ctx.fillRect(0, 0, 320, 240);
        ctx.fillStyle = '#5ed29c';
        ctx.font = '10px monospace';

        matrixDrops.forEach((y, i) => {
          const char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
          ctx.fillText(char, i * 8, y * 10);
          if (y * 10 > 240 && Math.random() > 0.975) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i]++;
        });
      }

      if (streamActive && pattern !== 'draw') {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (pattern !== 'draw') {
      render();
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [streamActive, pattern]);

  // Drawing Canvas Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (pattern !== 'draw' || !canvasRef.current) return;
    isDrawingRef.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 320 / rect.width;
    const scaleY = 240 / rect.height;
    lastMousePosRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || pattern !== 'draw' || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || !lastMousePosRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 320 / rect.width;
    const scaleY = 240 / rect.height;
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastMousePosRef.current.x, lastMousePosRef.current.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    lastMousePosRef.current = { x: currentX, y: currentY };
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    lastMousePosRef.current = null;
  };

  const clearDrawCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#040907';
      ctx.fillRect(0, 0, 320, 240);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Top Mode Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('stream')}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'stream'
                ? 'bg-brand text-dark font-bold shadow-[0_0_20px_rgba(94,210,156,0.3)]'
                : 'bg-white/5 text-white/70 hover:text-white border border-white/10'
            }`}
          >
            <Tv size={14} /> Live TFT Frame Stream
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'project'
                ? 'bg-brand text-dark font-bold shadow-[0_0_20px_rgba(94,210,156,0.3)]'
                : 'bg-white/5 text-white/70 hover:text-white border border-white/10'
            }`}
          >
            <FolderTree size={14} /> PlatformIO Project Tree
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-white font-bold ml-1">9 Files</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-all"
            title="Download full project code bundle"
          >
            <Download size={13} /> Export Project Bundle
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE TFT FRAMEBUFFER STREAM */}
      {activeTab === 'stream' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: The Physical ESP32-S3 TFT Display Frame */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative w-full rounded-3xl p-5 md:p-6 bg-gradient-to-b from-[#181d1b] to-[#0c100e] border-2 border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
              
              {/* Header inside bezel */}
              <div className="flex items-center justify-between mb-3 px-1 text-white/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/90 font-bold">
                    ESP32-S3 TFT FRAMEBUFFER (ST7789)
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-white/40">
                  <span className="flex items-center gap-1"><Wifi size={11} className="text-brand" /> AP: ESP32S3-TFT-UI</span>
                  <span className="text-brand font-bold">{fps} FPS</span>
                </div>
              </div>

              {/* The TFT Canvas Screen */}
              <div 
                className="relative w-full aspect-[4/3] max-h-[360px] bg-black rounded-2xl overflow-hidden border border-brand/30 shadow-[inset_0_0_30px_rgba(0,0,0,0.9),0_0_25px_rgba(94,210,156,0.15)] flex items-center justify-center cursor-crosshair group"
                style={{ filter: `brightness(${brightness}%)` }}
              >
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={240}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-full object-contain image-rendering-pixelated"
                />

                {/* Subtle CRT Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30" />

                {/* Pause Indicator overlay if stopped */}
                {!streamActive && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                    <span className="px-4 py-2 rounded-xl bg-black/80 border border-white/20 font-mono text-xs text-white/80 uppercase tracking-widest flex items-center gap-2">
                      <Pause size={14} className="text-amber-400" /> Framebuffer Stream Paused
                    </span>
                  </div>
                )}
              </div>

              {/* Hardware Device Bottom Label */}
              <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/30 font-bold">
                  DUAL-CORE DMA SPI 40MHZ • 320x240 RGB565
                </span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </div>
            </div>

            {/* Live Telemetry Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono flex flex-col">
                <span className="text-[10px] text-white/40 uppercase">Resolution</span>
                <span className="text-sm font-bold text-white mt-1">320 × 240</span>
                <span className="text-[9px] text-brand">ST7789 IPS</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono flex flex-col">
                <span className="text-[10px] text-white/40 uppercase">Buffer Size</span>
                <span className="text-sm font-bold text-white mt-1">153.6 KB</span>
                <span className="text-[9px] text-white/50">RGB565 (16-bit)</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono flex flex-col">
                <span className="text-[10px] text-white/40 uppercase">Stream Rate</span>
                <span className="text-sm font-bold text-brand mt-1">{fps} FPS</span>
                <span className="text-[9px] text-white/50">Hardware DMA</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono flex flex-col">
                <span className="text-[10px] text-white/40 uppercase">Transfer Protocol</span>
                <span className="text-sm font-bold text-white mt-1">WebSocket /ws</span>
                <span className="text-[9px] text-brand">Binary Stream</span>
              </div>
            </div>
          </div>

          {/* RIGHT: WebUI Stream Control Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-brand" />
                  <h4 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
                    Framebuffer Generator & Controls
                  </h4>
                </div>
                <button
                  onClick={() => setStreamActive(!streamActive)}
                  className={`px-3 py-1 rounded-lg font-mono text-xs uppercase font-bold transition-all flex items-center gap-1.5 ${
                    streamActive
                      ? 'bg-brand/20 text-brand border border-brand/40'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {streamActive ? <Pause size={12} /> : <Play size={12} />}
                  {streamActive ? 'Live' : 'Paused'}
                </button>
              </div>

              {/* Generator Pattern Select */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[11px] text-white/60 uppercase">Pattern Generator:</label>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button
                    onClick={() => { setPattern('cube'); setStreamActive(true); }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      pattern === 'cube' ? 'bg-brand/20 border-brand text-brand font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Sparkles size={14} /> 3D Wireframe Cube
                  </button>
                  <button
                    onClick={() => { setPattern('bars'); setStreamActive(true); }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      pattern === 'bars' ? 'bg-brand/20 border-brand text-brand font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Palette size={14} /> Color Bars (SMPTE)
                  </button>
                  <button
                    onClick={() => { setPattern('plasma'); setStreamActive(true); }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      pattern === 'plasma' ? 'bg-brand/20 border-brand text-brand font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Activity size={14} /> Sinusoidal Plasma
                  </button>
                  <button
                    onClick={() => { setPattern('matrix'); setStreamActive(true); }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      pattern === 'matrix' ? 'bg-brand/20 border-brand text-brand font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Tv size={14} /> Matrix Digital Rain
                  </button>
                  <button
                    onClick={() => { setPattern('draw'); clearDrawCanvas(); }}
                    className={`col-span-2 p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      pattern === 'draw' ? 'bg-brand/20 border-brand text-brand font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FileCode size={14} /> Interactive Canvas Drawing Board
                    </span>
                    <span className="text-[10px] text-brand/80 font-mono">Draw with Mouse/Touch</span>
                  </button>
                </div>
              </div>

              {/* Drawing Tools Palette (shown when pattern is 'draw') */}
              {pattern === 'draw' && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-brand/30 flex items-center justify-between gap-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/60 uppercase">Color:</span>
                    {['#5ed29c', '#f59e0b', '#38bdf8', '#f87171', '#e879f9', '#ffffff'].map(c => (
                      <button
                        key={c}
                        onClick={() => setDrawColor(c)}
                        className={`w-5 h-5 rounded-full transition-transform ${drawColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={clearDrawCanvas}
                    className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[10px] font-mono flex items-center gap-1 border border-red-500/30"
                  >
                    <Eraser size={12} /> Clear
                  </button>
                </div>
              )}

              {/* Brightness slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-mono text-[11px] text-white/60">
                  <span>Backlight PWM (GPIO 13):</span>
                  <span className="text-brand font-bold">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-brand bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* WebSocket URL info */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] flex flex-col gap-1">
                <div className="flex items-center justify-between text-white/40">
                  <span>WEBSOCKET ENDPOINT:</span>
                  <span className="text-brand font-bold">PORT 80</span>
                </div>
                <code className="text-brand break-all">ws://192.168.4.1/ws</code>
                <span className="text-[10px] text-white/40 mt-1">
                  Transfers 153.6 KB raw frames directly to ST7789 via DMA buffers.
                </span>
              </div>
            </div>

            {/* Quick Switch to PlatformIO source */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand/10 to-transparent border border-brand/20 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-white">Need the firmware source?</span>
                <span className="font-mono text-[10px] text-white/60">Complete PlatformIO project with LittleFS WebUI</span>
              </div>
              <button
                onClick={() => setActiveTab('project')}
                className="px-3.5 py-2 rounded-xl bg-brand text-dark font-mono text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-brand/90 transition-all shrink-0"
              >
                View Source <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLATFORMIO PROJECT SOURCE CODE EXPLORER */}
      {activeTab === 'project' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* File Tree Navigation (Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="p-4 rounded-2xl bg-[#030a07] border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-1">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
                  <FolderTree size={16} className="text-brand" />
                  ESP32S3_TFT_Framebuffer_WebUI
                </div>
                <span className="text-[10px] font-mono text-brand bg-brand/10 px-2 py-0.5 rounded">
                  PlatformIO
                </span>
              </div>

              {/* Tree Items */}
              <div className="flex flex-col gap-1 mt-1 font-mono text-xs">
                {ESP32S3_PROJECT_FILES.map(file => {
                  const isSelected = selectedFile.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-brand/20 border border-brand/50 text-brand font-bold shadow-[0_0_15px_rgba(94,210,156,0.15)]'
                          : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode size={14} className={isSelected ? 'text-brand' : 'text-white/40'} />
                        <span className="truncate">{file.path}</span>
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/40 text-white/40 shrink-0">
                        {file.language}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hardware wiring guide reminder */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-xs flex flex-col gap-2 text-white/70">
              <span className="font-bold text-brand uppercase text-[11px]">Pinout Quick Reference:</span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>MOSI: <span className="text-white font-bold">GPIO 11</span></div>
                <div>SCK: <span className="text-white font-bold">GPIO 12</span></div>
                <div>CS: <span className="text-white font-bold">GPIO 10</span></div>
                <div>DC: <span className="text-white font-bold">GPIO 9</span></div>
                <div>RST: <span className="text-white font-bold">GPIO 14</span></div>
                <div>BLK: <span className="text-white font-bold">GPIO 13</span></div>
              </div>
            </div>
          </div>

          {/* Main Code View Area */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="rounded-2xl bg-[#030a07] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
              
              {/* Code Header Bar */}
              <div className="px-4 py-3 bg-white/[0.03] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="font-mono text-xs font-bold text-brand ml-2">
                    {selectedFile.path}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <button
                    onClick={() => handleCopy(selectedFile.content, selectedFile.path)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {copiedPath === selectedFile.path ? (
                      <>
                        <Check size={13} className="text-brand" />
                        <span className="text-brand">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadFile(selectedFile)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
                    title="Download this file"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>

              {/* File description note */}
              <div className="px-4 py-2 bg-brand/5 border-b border-brand/10 font-mono text-[11px] text-brand/80">
                // {selectedFile.description}
              </div>

              {/* Source Code Container with Line Numbers */}
              <div className="p-4 md:p-6 overflow-x-auto max-h-[580px] font-mono text-xs md:text-sm leading-relaxed text-white/90 bg-[#020604]">
                <pre className="flex flex-col">
                  {selectedFile.content.split('\n').map((line, idx) => (
                    <div key={idx} className="flex gap-4 hover:bg-white/[0.02] px-1 rounded">
                      <span className="select-none text-white/20 w-8 text-right shrink-0">
                        {idx + 1}
                      </span>
                      <span className="whitespace-pre">{line || ' '}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
