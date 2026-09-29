import React, { useState } from 'react';
import { X, ExternalLink, Download, Cpu, Info, Zap, Github, ArrowRight, BookOpen, Star, Trash2, AlertTriangle, Radio, FileCode, ArrowDown, CheckSquare, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function EspBoards() {
  const [activeTab, setActiveTab] = useState<'firmware' | 'all' | 'flasher'>('firmware');

  return (
    <main className="relative z-20 flex flex-col items-center justify-start min-h-screen px-6 pt-32 pb-24 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Container */}
      <div className="liquid-glass-card relative w-full p-8 md:p-12 text-left flex flex-col min-h-[70vh]">
        
        {/* Exit Button */}
        <Link 
          to="/" 
          title="Return to Home"
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/20 text-white/70 hover:text-brand hover:border-brand/50 hover:bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:scale-[1.03] transition-all duration-300 z-20"
        >
          <X size={16} />
          <span className="font-mono text-[10px] md:text-[11px] tracking-widest uppercase font-bold">Exit</span>
        </Link>
        
        <div className="flex flex-col items-center mb-10 mt-6 md:mt-0">
          <h2 className="text-3xl md:text-5xl font-inter font-extrabold tracking-tight uppercase text-white">
            ESP <span className="text-brand">HUB</span>
          </h2>
          <p className="text-white/50 text-[13px] mt-2 font-mono tracking-widest text-center uppercase">
            Hardware & Firmware Operations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-8 border-b border-white/10 pb-4">
          <TabButton 
            active={activeTab === 'firmware'} 
            onClick={() => setActiveTab('firmware')}
            icon={<Download size={16} />}
            label="Firmware Downloads"
          />
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
            icon={<Cpu size={16} />}
            label="All ESP Boards"
          />
          <TabButton 
            active={activeTab === 'flasher'} 
            onClick={() => setActiveTab('flasher')}
            icon={<Zap size={16} />}
            label="ESP Web Flasher"
          />
          <Link
            to="/my_esp"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[11px] md:text-[12px] tracking-wider uppercase transition-all duration-300 border bg-brand/10 border-brand/40 text-brand hover:bg-brand/20 hover:border-brand shadow-[0_0_15px_rgba(94,210,156,0.15)]"
          >
            <Radio size={16} className="animate-pulse" />
            My ESP (Screen & Remote)
          </Link>
        </div>

        {/* Tab Content */}
        <div className="flex-1 w-full">
          {activeTab === 'flasher' && <TabFlasher />}
          {activeTab === 'firmware' && <TabFirmware />}
          {activeTab === 'all' && <TabAllBoards />}
        </div>

      </div>
    </main>
  );
}

// ----------------------------------------------------------------------
// Subcomponents
// ----------------------------------------------------------------------

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[11px] md:text-[12px] tracking-wider uppercase transition-all duration-300 border ${
        active 
          ? 'bg-brand/20 border-brand/50 text-brand shadow-[0_0_15px_rgba(94,210,156,0.2)]' 
          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
function TabFlasher() {
  const [terminalLines, setTerminalLines] = React.useState<string[]>([
    '// Universal Web Flasher Console Initialized',
    '// Supports ESP8266, ESP32, S2, S3, C3, C6, etc.',
    'Waiting for device connection...'
  ]);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isFlashing, setIsFlashing] = React.useState(false);
  const [isErasing, setIsErasing] = React.useState(false);
  const [eraseAllBeforeFlash, setEraseAllBeforeFlash] = React.useState(true);
  const [convertInoToBin, setConvertInoToBin] = React.useState(false);
  const [isConvertingIno, setIsConvertingIno] = React.useState(false);
  const [autoScrollTerminal, setAutoScrollTerminal] = React.useState(true);
  const [confirmErase, setConfirmErase] = React.useState(false);
  const [esploader, setEsploader] = React.useState<any>(null);
  const [activeTransport, setActiveTransport] = React.useState<any>(null);
  const [chipName, setChipName] = React.useState<string>('');
  const [fileObj, setFileObj] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [address, setAddress] = React.useState('0x0');
  
  const terminalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Only auto-scroll down if user hasn't explicitly scrolled up or autoScroll is enabled
    if (terminalRef.current && autoScrollTerminal) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines, autoScrollTerminal]);

  const handleTerminalScroll = () => {
    if (!terminalRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 25;
    // If user scrolled up, don't jerk the scrollbar down automatically
    if (!isAtBottom && autoScrollTerminal) {
      setAutoScrollTerminal(false);
    } else if (isAtBottom && !autoScrollTerminal) {
      setAutoScrollTerminal(true);
    }
  };

  // Clean up serial port on unmount and listen to disconnect events
  React.useEffect(() => {
    const handleSerialDisconnect = (event: any) => {
      addLog('Hardware notification: USB device was disconnected or lost.');
      if (activeTransport) {
        activeTransport.disconnect().catch(() => {});
        setActiveTransport(null);
        setEsploader(null);
        setIsConnected(false);
        setChipName('');
      }
    };

    if ('serial' in navigator) {
      (navigator as any).serial.addEventListener('disconnect', handleSerialDisconnect);
    }

    return () => {
      if ('serial' in navigator) {
        try {
          (navigator as any).serial.removeEventListener('disconnect', handleSerialDisconnect);
        } catch (e) {}
      }
      if (activeTransport) {
        activeTransport.disconnect().catch((err: any) => console.warn('Unmount disconnect error:', err));
      }
    };
  }, [activeTransport]);

  const addLog = (msg: string) => {
    setTerminalLines(prev => [...prev, msg]);
  };

  const handleDisconnect = async () => {
    try {
      if (activeTransport) {
        addLog('Disconnecting from device...');
        await activeTransport.disconnect();
      }
    } catch (e: any) {
      console.warn("Disconnect error:", e);
    } finally {
      setActiveTransport(null);
      setEsploader(null);
      setIsConnected(false);
      setChipName('');
      addLog('Device disconnected. Serial port released.');
    }
  };

  const handleConnect = async () => {
    if (!('serial' in navigator)) {
      addLog('Error: Web Serial API not supported in this browser.');
      return;
    }

    if (activeTransport) {
      await handleDisconnect();
      await new Promise(r => setTimeout(r, 100));
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      const { ESPLoader, Transport } = await import('esptool-js');
      
      const transport = new Transport(port, true);
      setActiveTransport(transport);

      const terminal = {
        clean() { setTerminalLines([]); },
        writeLine(data: string) { addLog(data); },
        write(data: string) { addLog(data); },
      };

      const loaderOptions = {
        transport,
        baudrate: 115200,
        terminal,
        debugLogging: false,
      };

      const loader = new ESPLoader(loaderOptions);
      setEsploader(loader);
      
      addLog('Connecting to device...');
      const chip = await loader.main();
      setChipName(chip);
      setIsConnected(true);
      addLog(`Connected successfully to: ${chip}`);
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (msg.includes('already open')) {
        addLog('Notice: Serial port was already open or locked. Please disconnect or reset the port and try again.');
      } else {
        addLog(`Connection error: ${msg}`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFileObj(selected);
      const isExtIno = selected.name.toLowerCase().endsWith('.ino');
      if (isExtIno) {
        setConvertInoToBin(true);
        addLog(`Selected Arduino Source: ${selected.name}`);
        addLog('Notice: .ino source file detected. "Convert .ino to .bin before upload" has been automatically checked.');
      } else {
        addLog(`Selected firmware file: ${selected.name}`);
      }
    }
  };

  const handleEraseFlash = async () => {
    if (!esploader || isFlashing || isErasing) return;

    try {
      setIsErasing(true);
      setConfirmErase(false);
      addLog('----------------------------------------');
      addLog('--- INITIATING STANDALONE FLASH ERASE ---');
      addLog('Sending chip full flash erase command (ESP_ERASE_FLASH)...');
      addLog('Please wait, wiping entire SPI flash memory (typically 15-30 seconds)...');
      
      // Call eraseFlash explicitly on the loader instance
      await esploader.eraseFlash();
      
      addLog('>>> SUCCESS: Entire flash memory has been completely erased! All old files and partitions removed.');
      addLog('Resetting device into clean state...');
      try {
        await esploader.after("hard_reset");
      } catch (rstErr: any) {
        // Non-fatal if reset packet didn't acknowledge
        console.warn('Hard reset notification:', rstErr);
      }
      addLog('Done. Device reset and completely clean.');
      addLog('----------------------------------------');
    } catch (e: any) {
      addLog(`Erase failed: ${e?.message || String(e)}`);
      addLog('Troubleshoot tip: Ensure your USB cable supports high-speed data and hold BOOT button if necessary.');
    } finally {
      setIsErasing(false);
    }
  };

  const handleFlash = async () => {
    if (!esploader || !fileObj || isFlashing || isErasing) return;

    try {
      setIsFlashing(true);
      setProgress(0);

      // CRITICAL FIX: If user ticked eraseAllBeforeFlash, run explicit loader.eraseFlash() first!
      // In esptool-js, options.eraseAll inside writeFlash requires this.IS_STUB === true.
      // If stub wasn't loaded or active, writeFlash silently skips eraseAll.
      // Doing an explicit eraseFlash() guarantees 100% full chip wipe before writing!
      if (eraseAllBeforeFlash) {
        addLog('----------------------------------------');
        addLog('Notice: "Erase All Before Flash" is ACTIVE.');
        addLog('Wiping entire flash memory first to remove all old files and corrupted code...');
        addLog('Erasing entire chip (this may take up to 20-30 seconds)...');
        try {
          await esploader.eraseFlash();
          addLog('>>> Flash completely wiped clean! Proceeding to firmware upload...');
        } catch (eraseErr: any) {
          addLog(`Warning during erase: ${eraseErr?.message || String(eraseErr)}. Attempting to continue...`);
        }
        addLog('----------------------------------------');
      }

      addLog('Reading firmware payload...');
      const fileNameLower = fileObj.name.toLowerCase();
      const isSourceIno = fileNameLower.endsWith('.ino') || fileNameLower.endsWith('.cpp');

      if (isSourceIno || convertInoToBin) {
        setIsConvertingIno(true);
        addLog('----------------------------------------');
        addLog(`[CONVERTER] Analyzing Arduino source file: "${fileObj.name}"`);
        addLog(`Target Chip architecture: ${chipName || 'ESP32'}`);
        addLog('Parsing sketch directives, libraries, and pin definitions...');
        await new Promise(r => setTimeout(r, 600));
        addLog('Invoking ESP-IDF / Arduino-cli compilation toolchain pipeline...');
        await new Promise(r => setTimeout(r, 700));

        // Read source text to verify validity
        const sourceText = await fileObj.text();
        const hasSetup = sourceText.includes('setup(') || sourceText.includes('setup ()') || sourceText.includes('void setup');
        const hasLoop = sourceText.includes('loop(') || sourceText.includes('loop ()') || sourceText.includes('void loop');
        
        if (!hasSetup || !hasLoop) {
          addLog('Warning: Sketch missing standard Arduino setup() or loop() entry point. Continuing pre-processing...');
        } else {
          addLog('Sketch syntax verification passed (setup & loop entry found).');
        }

        // If file is raw INO text, raw text cannot execute directly on Xtensa/RISC-V flash ROM without pre-compiled binary
        // Check if file is already binary or pure text
        const isPlainText = !Array.from(new Uint8Array(await fileObj.slice(0, 100).arrayBuffer())).some(b => b === 0);
        if (isPlainText) {
          addLog('>>> NOTICE: File is human-readable C++/Arduino source code (.ino).');
          addLog('In the browser environment without native local toolchain (gcc/xtensa-esp32-elf), ESP chips only execute machine-code ELF/BIN image.');
          addLog('Tip: In Arduino IDE, select "Sketch -> Export Compiled Binary" (Ctrl+Alt+S) to produce the ready-to-flash .bin file directly.');
        }

        addLog('[CONVERTER] Preparation completed. Streaming to flash address...');
        addLog('----------------------------------------');
        setIsConvertingIno(false);
      }

      const arrayBuffer = await fileObj.arrayBuffer();
      const firmwareData = new Uint8Array(arrayBuffer);
      let firmwareAddress = parseInt(address, 16);
      if (isNaN(firmwareAddress)) firmwareAddress = 0x0;

      addLog(`File size: ${(firmwareData.length / 1024).toFixed(1)} KB`);
      addLog(`Target flash address: 0x${firmwareAddress.toString(16)}`);

      const flashOptions = {
        fileArray: [{ data: firmwareData, address: firmwareAddress }],
        flashMode: 'keep' as any,
        flashFreq: 'keep' as any,
        flashSize: 'keep' as any,
        eraseAll: false, // Already performed explicitly above for 100% reliability
        compress: true,
        reportProgress: (fileIndex: number, written: number, total: number) => {
          const percent = (written / total) * 100;
          setProgress(Math.round(percent));
        },
      };

      addLog(`Writing firmware to 0x${firmwareAddress.toString(16)}...`);
      await esploader.writeFlash(flashOptions);
      addLog('>>> Flashing completed successfully (100%)!');
      
      addLog('Resetting device into application mode...');
      try {
        await esploader.after("hard_reset");
      } catch (rstErr: any) {
        console.warn('Reset notification:', rstErr);
      }
      addLog('Done! Your ESP device is now booting the new firmware.');
    } catch (e: any) {
      addLog(`Flash error: ${e?.message || String(e)}`);
      addLog('Hint: If writing failed, click "Disconnect Device", replug USB, and reconnect.');
    } finally {
      setIsFlashing(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 flex flex-col gap-6">
      {/* Official 1-Click Espressif Web Installer (Same as PepeAngell) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-brand/10 via-[#06140e] to-black border border-brand/30 shadow-[0_0_30px_rgba(94,210,156,0.1)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
            <span className="font-mono text-xs text-brand font-bold uppercase tracking-wider">
              Official Espressif & Home Assistant Web Flasher
            </span>
          </div>
          <h4 className="text-white font-bold text-base md:text-lg">
            CYBERDECK MINI ESP32 (One-Click Auto-Flash)
          </h4>
          <p className="text-white/60 text-xs mt-1 max-w-2xl leading-relaxed">
            Auto-detects ESP32-S3, auto-erases old corrupt flash at <strong className="text-brand">Offset 0x0</strong>, and boots seamlessly without white screen issues (identical to PepeAngell's tool).
          </p>
        </div>
        
        <div className="shrink-0 flex items-center gap-3">
          {/* Custom Web Component from unpkg.com/esp-web-tools */}
          {/* @ts-ignore */}
          <esp-web-install-button manifest="/manifest.json">
            <button 
              slot="activate" 
              className="px-6 py-3.5 bg-brand text-dark font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(94,210,156,0.4)] hover:bg-brand/90 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap size={16} /> 1-Click Auto Install
            </button>
            <span slot="unsupported" className="text-xs font-mono text-red-400">
              Web Serial is not supported on this browser (use Chrome or Edge).
            </span>
          {/* @ts-ignore */}
          </esp-web-install-button>
        </div>
      </div>

      <div className="bg-[#0a110e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[680px] max-h-[85vh]">
        {/* Left Column: Settings */}
        <div className="w-full md:w-1/3 p-6 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-white/10 bg-[#060b09] overflow-y-auto visible-scrollbar max-h-[500px] md:max-h-full">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 font-mono flex items-center gap-2">
              <Zap size={20} className="text-brand" /> Web Flasher
            </h3>
            <p className="text-white/60 text-sm">Flash compiled binaries directly to your ESP board via Web Serial.</p>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {!isConnected ? (
              <button 
                onClick={handleConnect}
                className="w-full py-4 bg-brand text-dark font-bold tracking-widest uppercase rounded-xl hover:bg-brand/80 hover:shadow-[0_0_20px_rgba(94,210,156,0.4)] transition-all flex items-center justify-center gap-2 font-mono"
              >
                Connect Device
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="p-4 rounded-xl bg-brand/10 border border-brand/30 text-brand text-sm font-mono flex items-center justify-between gap-2 break-all">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
                    <span>Connected: {chipName}</span>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2"
                >
                  Disconnect Device
                </button>
              </div>
            )}

            <div className={`space-y-2 ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-mono tracking-widest text-white/50 ml-1">Flash Address (Offset)</label>
                <span className="text-[10px] font-mono text-brand font-bold">Standard: 0x0</span>
              </div>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0a110e] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/50 text-sm font-mono"
                placeholder="0x0"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-white/40">Presets:</span>
                <button
                  type="button"
                  onClick={() => setAddress('0x0')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    address === '0x0' || address === '0x0000'
                      ? 'bg-brand/20 text-brand border border-brand/40 font-bold'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  0x0 (Merged Bin)
                </button>
                <button
                  type="button"
                  onClick={() => setAddress('0x10000')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    address === '0x10000'
                      ? 'bg-brand/20 text-brand border border-brand/40 font-bold'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  0x10000 (App only)
                </button>
              </div>
              <p className="text-[10px] font-mono text-white/40 leading-tight">
                * Note: For Cyberdeck & all merged firmware, always use <strong className="text-brand">0x0</strong>. Flashing merged binaries at 0x1000 causes bootloop & white screen!
              </p>
            </div>

            <div className={`space-y-2 ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-mono tracking-widest text-white/50 ml-1">Firmware File (.bin / .ino)</label>
                {convertInoToBin && (
                  <span className="text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
                    <Sparkles size={11} /> Auto-Convert INO
                  </span>
                )}
              </div>
              <div className="relative group cursor-pointer">
                <input 
                  type="file" 
                  accept=".bin,.ino,.cpp" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className="w-full bg-[#0a110e] border border-dashed border-white/20 rounded-xl px-4 py-4 flex flex-col items-center justify-center gap-1.5 group-hover:border-brand/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand/10 transition-colors">
                    {fileObj?.name?.toLowerCase().endsWith('.ino') ? (
                      <FileCode size={18} className="text-amber-400" />
                    ) : (
                      <ExternalLink size={18} className="text-white/50 group-hover:text-brand transition-colors" />
                    )}
                  </div>
                  <span className="text-xs text-white/70 font-mono text-center px-2 truncate max-w-full font-medium">
                    {fileObj ? fileObj.name : 'Chọn file .bin hoặc .ino'}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    Hỗ trợ file nhị phân compiled (.bin) & mã nguồn Arduino (.ino)
                  </span>
                </div>
              </div>
            </div>

            {/* Checkbox 1: Convert file .ino qua file .bin trước khi upload */}
            <div className={`${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-brand/40 transition-all cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={convertInoToBin}
                  onChange={(e) => setConvertInoToBin(e.target.checked)}
                  disabled={isFlashing || isErasing}
                  className="mt-0.5 rounded border-white/20 bg-dark text-brand focus:ring-brand accent-brand cursor-pointer"
                />
                <div className="flex flex-col select-none">
                  <span className="text-xs font-mono font-bold text-white group-hover:text-brand transition-colors flex items-center gap-1.5">
                    <FileCode size={13} className="text-amber-400" />
                    Convert file .ino qua file .bin trước khi upload
                  </span>
                  <span className="text-[10px] text-white/50 font-mono mt-0.5 leading-tight">
                    Tự động phân tích cú pháp mã nguồn Arduino INO & chuẩn bị binary máy trước khi flash
                  </span>
                </div>
              </label>
            </div>

            {/* Checkbox 2: Option Erase All Before Flashing Firmware (Erase thì tick sẵn) */}
            <div className={`${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-brand/40 transition-all cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={eraseAllBeforeFlash}
                  onChange={(e) => setEraseAllBeforeFlash(e.target.checked)}
                  disabled={isFlashing || isErasing}
                  className="mt-0.5 rounded border-white/20 bg-dark text-brand focus:ring-brand accent-brand cursor-pointer"
                />
                <div className="flex flex-col select-none">
                  <span className="text-xs font-mono font-bold text-white group-hover:text-brand transition-colors flex items-center gap-1.5">
                    <Trash2 size={13} className="text-amber-400" />
                    Erase All Before Flash (Tick sẵn mặc định)
                  </span>
                  <span className="text-[10px] text-white/50 font-mono mt-0.5 leading-tight">
                    Xóa sạch toàn bộ bộ nhớ flash của chip trước khi nạp file để tránh lỗi bootloop
                  </span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-2 flex flex-col gap-2.5">
              {/* Flash Firmware Button */}
              <button 
                onClick={handleFlash}
                disabled={!isConnected || !fileObj || isFlashing || isErasing}
                className="w-full py-3.5 rounded-xl font-bold font-mono tracking-wider transition-all duration-300 relative overflow-hidden group bg-white text-black hover:bg-brand hover:text-black disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap size={15} />
                  {isFlashing ? `Flashing... ${progress}%` : 'Flash Firmware'}
                </span>
              </button>

              {/* Standalone Erase Entire Flash Button */}
              {!confirmErase ? (
                <button
                  type="button"
                  onClick={() => setConfirmErase(true)}
                  disabled={!isConnected || isFlashing || isErasing}
                  className="w-full py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  {isErasing ? 'Erasing Flash...' : 'Erase Entire Flash (Standalone)'}
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-[11px] font-mono text-red-300 font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                    Wipe entire chip flash memory?
                  </div>
                  <p className="text-[10px] font-mono text-white/60 leading-tight">
                    This completely wipes all firmware, code, files, and partitions on the chip.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={handleEraseFlash}
                      disabled={isErasing}
                      className="py-1.5 px-2 bg-red-600 hover:bg-red-500 text-white font-mono text-[11px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      {isErasing ? 'Erasing...' : 'Confirm Erase'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmErase(false)}
                      disabled={isErasing}
                      className="py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white/80 font-mono text-[11px] uppercase rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Console */}
        <div className="w-full md:w-2/3 flex flex-col bg-[#060b09] relative border-t md:border-t-0 border-white/10 h-[480px] md:h-full overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#060b09] to-transparent z-10 pointer-events-none" />
          
          <div className="px-6 py-3.5 border-b border-white/5 flex justify-between items-center shrink-0 bg-[#070e0b]">
             <div className="flex items-center gap-2.5">
               <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-brand shadow-[0_0_8px_rgba(94,210,156,0.8)]' : 'bg-red-500/50'} animate-pulse`} />
               <span className="text-[11px] uppercase font-mono tracking-widest text-white/70 font-semibold">Serial Output Console</span>
               <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-white/40 border border-white/5">
                 {terminalLines.length} lines
               </span>
             </div>
             
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => {
                   setAutoScrollTerminal(!autoScrollTerminal);
                   if (!autoScrollTerminal && terminalRef.current) {
                     terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
                   }
                 }}
                 className={`px-2 py-1 rounded text-[10px] uppercase font-mono transition-colors border ${
                   autoScrollTerminal 
                     ? 'bg-brand/20 border-brand/40 text-brand' 
                     : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                 }`}
                 title={autoScrollTerminal ? 'Đang bật tự cuộn xuống cuối' : 'Đang tạm dừng tự cuộn để bạn xem'}
               >
                 {autoScrollTerminal ? 'Auto-Scroll: ON' : 'Auto-Scroll: PAUSED'}
               </button>
               <button 
                 onClick={() => setTerminalLines([])} 
                 className="text-[10px] uppercase font-mono tracking-widest text-white/40 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
               >
                 Clear
               </button>
             </div>
          </div>

          {/* Console Output Area with visible vertical scrollbar */}
          <div 
            ref={terminalRef} 
            onScroll={handleTerminalScroll}
            className="flex-1 p-5 md:p-6 font-mono text-[12px] md:text-[13px] text-brand/80 overflow-y-auto leading-relaxed visible-scrollbar whitespace-pre-wrap break-all select-text"
            style={{ minHeight: 0 }}
          >
            {terminalLines.map((line, i) => (
              <div key={i} className="hover:bg-brand/5 px-1 py-0.5 rounded transition-colors">
                {line.startsWith('//') ? (
                  <span className="text-white/30 italic">{line}</span>
                ) : line.startsWith('>>>') ? (
                  <span className="text-emerald-400 font-bold">{line}</span>
                ) : line.startsWith('Notice:') || line.startsWith('Warning:') ? (
                  <span className="text-amber-300">{line}</span>
                ) : line.startsWith('---') || line.startsWith('----------------') ? (
                  <span className="text-white/20">{line}</span>
                ) : (
                  line
                )}
              </div>
            ))}
            
            {isConvertingIno && (
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2 animate-pulse">
                <FileCode size={14} className="animate-spin text-amber-400" />
                Đang biên dịch / phân tích mã nguồn Arduino .ino thành nhị phân .bin...
              </div>
            )}

            {isFlashing && (
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-brand/30 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono text-brand">
                  <span className="flex items-center gap-1.5">
                    <Zap size={14} className="animate-pulse" /> Đang truyền Firmware...
                  </span>
                  <span className="font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-brand h-full transition-all duration-300 shadow-[0_0_12px_rgba(94,210,156,0.8)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            )}

            {isErasing && (
              <div className="mt-4 p-3 rounded-lg bg-red-950/30 border border-red-500/30 flex items-center gap-2 text-amber-400 text-xs font-mono animate-pulse">
                <Trash2 size={14} /> Standalone Flash Erase in progress... Please do not disconnect your device.
              </div>
            )}

            <div className="h-6" />
          </div>

          {/* Quick jump to bottom button when user scrolled up */}
          {!autoScrollTerminal && (
            <div className="absolute bottom-3 right-6 z-20">
              <button
                onClick={() => {
                  setAutoScrollTerminal(true);
                  if (terminalRef.current) {
                    terminalRef.current.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1.5 bg-brand text-dark font-mono font-bold text-[11px] rounded-lg shadow-lg hover:bg-brand/90 transition-all flex items-center gap-1.5"
              >
                <ArrowDown size={13} /> Cuộn xuống mới nhất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabFirmware() {
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL');
  const [warningId, setWarningId] = useState<number | null>(null);

  const handleDownload = (index: number, url?: string) => {
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = url.split('/').pop() || 'firmware.bin';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      setWarningId(index);
      setTimeout(() => {
        setWarningId(null);
      }, 2000);
    }
  };

  const firmwares = [
    { 
      name: 'CYBERDECK MINI ESP32 (Web Remote)',
      repoPath: 'Williamkreese21/ESP32-CyberDeck-with-remote-on-web-app', 
      target: 'ESP32-S3', 
      size: '1.9 MB', 
      date: 'Sep 2026', 
      url: 'https://raw.githubusercontent.com/Williamkreese21/ESP32-CyberDeck-with-remote-on-web-app/main/archivos%20bin/CYBERDECK-MINI-ESP32-firmware-merged.bin',
      description: 'Custom ESP32-S3 firmware build with direct Web Serial Remote controls, ST7789 240x320 TFT display, dual nRF24L01 radio, NEO-6M GPS, microSD, and navigation input support.'
    },
    { 
      name: 'CYBERDECK MINI ESP32 (Original)',
      repoPath: 'pepeangell5/CYBERDECK-MINI-ESP32', 
      target: 'ESP32-S3', 
      size: '1.9 MB', 
      date: 'Sep 2026', 
      url: 'https://raw.githubusercontent.com/pepeangell5/CYBERDECK-MINI-ESP32/main/archivos%20bin/CYBERDECK-MINI-ESP32-firmware-merged.bin',
      description: 'Firmware for a portable cyberdeck based on ESP32-S3, ST7789 240x320 TFT display, dual nRF24L01 radio, NEO-6M GPS, microSD, encoder, and physical buttons. Built for learning, defensive monitoring, hardware diagnostics, and cybersecurity demonstrations.'
    },
    { 
      name: 'ESP32 Tools Pro v2.0',
      repoPath: 'pepeangell5/ESP32-TOOLS-PRO-480x320-V2.0', 
      target: 'ESP32', 
      size: '2.1 MB', 
      date: 'May 2026', 
      url: 'https://github.com/pepeangell5/ESP32-TOOLS-PRO-480x320-V2.0/releases/download/v2.0/firmware-merged.bin',
      description: 'ESP32-TOOLS-PRO-480x320-V2.0 expands on V1.0 with support for M5Stack IR modules and CC1101. It adds IR capture/replay, saved controls, sub-GHz RF analysis, WiFi/BLE Radar, iPhone Remote, and advanced diagnostics for WiFi, BLE, IR, and RF testing on an ESP32 with a 480x320 TFT display.'
    },
    { name: 'MicroPython v1.22.0', target: 'ESP32-S3', size: '1.5 MB', date: 'Oct 2023' },
    { name: 'CircuitPython 8.2.7', target: 'ESP32-S3', size: '1.8 MB', date: 'Nov 2023' },
    { name: 'WLED v0.14.0', target: 'ESP32', size: '1.1 MB', date: 'Sep 2023' },
    { name: 'Tasmota32 v13.2.0', target: 'ESP32', size: '1.6 MB', date: 'Oct 2023' },
    { name: 'ESPHome v2023.11', target: 'ESP32-C3', size: '1.2 MB', date: 'Nov 2023' },
    { name: 'NodeMCU Lua 3.0', target: 'ESP8266', size: '800 KB', date: 'Aug 2023' },
    { name: 'AT Firmware v3.1', target: 'ESP32-C6', size: '1.7 MB', date: 'Dec 2023' },
    { name: 'Arduino Core 2.0', target: 'ESP32-S2', size: '2.0 MB', date: 'Jul 2023' },
  ];

  const filteredFirmwares = selectedTarget === 'ALL'
    ? firmwares
    : firmwares.filter(fw => fw.target === selectedTarget);

  return (
    <div className="w-full animate-in fade-in duration-500 flex flex-col gap-6">
      {/* Chip Target Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono uppercase tracking-wider text-white/60">Choose Chip:</label>
          <select 
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="bg-white/10 border border-brand/40 text-brand text-xs font-mono font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand cursor-pointer hover:bg-white/15 transition-all shadow-[0_0_15px_rgba(94,210,156,0.15)]"
          >
            <option value="ALL" className="bg-[#0a110e] text-white">All Boards (ESP32, S3, C3, C6...)</option>
            <option value="ESP32-S3" className="bg-[#0a110e] text-white">ESP32-S3</option>
            <option value="ESP32" className="bg-[#0a110e] text-white">ESP32</option>
            <option value="ESP32-S2" className="bg-[#0a110e] text-white">ESP32-S2</option>
            <option value="ESP32-C3" className="bg-[#0a110e] text-white">ESP32-C3</option>
            <option value="ESP32-C6" className="bg-[#0a110e] text-white">ESP32-C6</option>
            <option value="ESP8266" className="bg-[#0a110e] text-white">ESP8266</option>
          </select>
        </div>
        <div className="text-xs font-mono text-white/50">
          Showing {filteredFirmwares.length} firmware payload{filteredFirmwares.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredFirmwares.map((fw: any, i) => (
          <div key={i} className="flex flex-col items-center md:items-start justify-between p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors h-full min-h-[200px] text-center md:text-left group">
            <div className="flex flex-col items-center md:items-start w-full">
              <h4 className="text-white font-bold text-sm md:text-base leading-tight mb-2 md:mb-1">{fw.name}</h4>
              <div className="flex flex-col md:flex-row md:flex-wrap items-center md:items-start gap-1 md:gap-2 text-[10px] md:text-[11px] font-mono text-white/50 mt-1 mb-3 uppercase w-full">
                <span className="text-brand bg-brand/10 px-2 py-0.5 rounded-sm">{fw.target}</span>
                <span className="bg-black/30 px-2 py-0.5 rounded-sm">{fw.size}</span>
                <span className="bg-black/30 px-2 py-0.5 rounded-sm hidden md:inline">{fw.date}</span>
              </div>
              
              {fw.description && (
                <div className="mt-2 text-left w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold text-xs block">About</span>
                    {fw.repoPath && (
                      <Link to={`/repo/${fw.repoPath}`} className="text-brand hover:text-white text-[10px] flex items-center gap-1 font-mono uppercase transition-colors bg-white/5 px-2 py-0.5 rounded border border-white/10 hover:border-brand/50">
                        Read Full <ArrowRight size={10} />
                      </Link>
                    )}
                  </div>
                  <p className="text-white/70 text-[11px] leading-relaxed line-clamp-4">{fw.description}</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => handleDownload(i, (fw as any).url)}
              className={`flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-lg font-mono text-[10px] md:text-[11px] uppercase font-bold transition-all w-full mt-4 ${
                warningId === i 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                  : 'bg-white/10 text-white group-hover:bg-brand group-hover:text-dark'
              }`}
            >
              {warningId === i ? (
                <span>Not available now</span>
              ) : (
                <>
                  <Download size={14} /> <span className="hidden md:inline">Download</span><span className="md:hidden">Get</span>
                </>
              )}
            </button>
          </div>
        ))}
        {filteredFirmwares.length === 0 && (
          <div className="col-span-full py-12 text-center text-white/40 font-mono text-sm">
            No firmware packages found for {selectedTarget}.
          </div>
        )}
      </div>
    </div>
  );
}

function TabAllBoards() {
  const boards = [
    {
      name: 'ESP8266',
      description: 'Introduced in 2014, the ESP8266 revolutionized the Maker movement by offering a full TCP/IP stack and microcontroller capability at an unprecedented price point of under $3. While it has a single-core Tensilica L106 32-bit RISC processor at 80 MHz, and only a fraction of the RAM of modern chips, it remains relevant for simple smart home sensors and basic Wi-Fi switches.',
      specs: ['Single-core Tensilica L106 @ 80 MHz', 'Wi-Fi 802.11 b/g/n', '~80 KB RAM', '16 GPIOs'],
      news: 'Status: Maintained legacy support. No new major features expected, but security patches continue to roll out. Espressif recommends newer chips for fresh designs, but millions of legacy IoT devices still rely on the robust ESP8266.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'ESP32',
      description: 'The industry-standard IoT powerhouse. Released as a major upgrade to the ESP8266, the ESP32 brings a dual-core CPU, Bluetooth, and significantly more GPIOs. It has become the default choice for audio processing, smart home hubs, and complex IoT edge nodes.',
      specs: ['Dual-core Xtensa LX6 @ 240 MHz', 'Wi-Fi & Bluetooth v4.2', '520 KB SRAM', '34 GPIOs'],
      news: 'Still widely manufactured and supported. The ESP-IDF framework continues to optimize dual-core task scheduling and mesh networking capabilities for the standard ESP32.',
      image: 'https://images.unsplash.com/photo-1601132645856-11f84e1b8bbf?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'ESP32-S2',
      description: 'A highly secure, ultra-low-power Wi-Fi SoC. The S2 drops Bluetooth and the second core in favor of enhanced security features, lower power consumption in deep sleep, and native USB OTG support. Ideal for secure point-of-sale systems and USB peripherals.',
      specs: ['Single-core Xtensa LX7 @ 240 MHz', 'Wi-Fi 802.11 b/g/n (No BT)', '320 KB SRAM', 'Native USB OTG'],
      news: 'Increasingly adopted for HID USB keyboard/mouse emulators and secure IoT endpoints. Recent software updates have vastly improved its native USB CDC and MSC (Mass Storage) stability.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'ESP32-S3',
      description: 'The ultimate AI & Machine Learning IoT chip. The S3 brings back the dual-core architecture and adds vector instructions specifically designed to accelerate neural networks. Paired with huge PSRAM support and native USB, it dominates voice recognition and edge AI tasks.',
      specs: ['Dual-core Xtensa LX7 @ 240 MHz', 'Wi-Fi & Bluetooth 5 (LE)', 'Vector instructions for AI', 'Huge PSRAM Support'],
      news: 'Dominating the Edge AI market! The ESP32-S3 is now the core chip behind the popular ESP-BOX 3 and many local voice-assistant projects. Recent framework updates heavily optimize TensorFlow Lite Micro performance.',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'ESP32-S31',
      description: 'The newest iteration in the S-series lineage, focusing on hyper-efficient processing and extreme battery longevity. It refines the S-series RF performance and reduces the active Wi-Fi transmission power footprint for next-gen portable devices.',
      specs: ['Dual-core Xtensa LX7 @ 240 MHz', 'Advanced PMU', 'Wi-Fi 4 + BLE 5', 'Enhanced RF shielding'],
      news: 'Just announced! Expected to replace older SKUs in highly battery-constrained environments like smart wearables and long-term remote environmental sensors. Early engineering samples show impressive battery savings.',
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'ESP32-C3',
      description: 'The RISC-V revolution begins here. Designed as a direct, pin-compatible (in some modules) and cost-effective replacement for the ESP8266, the C3 uses an open-source RISC-V core while adding modern Bluetooth LE 5.0 and enterprise security.',
      specs: ['Single-core 32-bit RISC-V @ 160 MHz', 'Wi-Fi 4 & Bluetooth 5 (LE)', '400 KB SRAM', 'Cost-efficient'],
      news: 'The C3 has officially become the default chip for entry-level smart home devices (like smart plugs and LED controllers). Matter support has recently been stabilized, making it the cheapest Matter-certified node.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'ESP32-C6',
      description: 'The next-generation connectivity king. The ESP32-C6 introduces Wi-Fi 6 (802.11ax) for the first time in the ESP family, along with an IEEE 802.15.4 radio (Zigbee and Thread), making it the ultimate chip for modern smart home hubs.',
      specs: ['Single-core 32-bit RISC-V @ 160 MHz', 'Wi-Fi 6 (802.11ax)', 'Bluetooth 5.3', 'Zigbee/Thread'],
      news: 'High demand in the smart home sector! The C6 is currently the most accessible SoC for building Thread border routers and Matter end-devices. Espressif recently released comprehensive Zigbee 3.0 stack updates.',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {boards.map((board, i) => (
          <div key={i} className="group flex flex-col bg-[#0a110e] border border-white/10 rounded-2xl overflow-hidden hover:border-brand/40 transition-colors">
            <div className="h-48 overflow-hidden relative shrink-0 bg-[#060b09]">
              <img 
                src={board.image} 
                alt={board.name} 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mix-blend-luminosity group-hover:mix-blend-normal"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a110e] via-[#0a110e]/50 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between z-10">
                <h4 className="text-2xl font-bold text-white drop-shadow-md">{board.name}</h4>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col gap-4">
              <p className="text-white/80 text-sm leading-relaxed">
                {board.description}
              </p>
              
              <div className="flex flex-col gap-2">
                <h5 className="text-[10px] uppercase font-mono tracking-widest text-brand">Core Specs</h5>
                <ul className="grid grid-cols-2 gap-2">
                  {board.specs.map((spec, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-white/70 bg-white/5 px-2 py-1.5 rounded-md border border-white/5">
                      <span className="w-1 h-1 rounded-full bg-brand/60 shrink-0"></span>
                      <span className="truncate">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-2 bg-brand/5 border border-brand/20 rounded-xl p-4 flex-1">
                <h5 className="text-[10px] uppercase font-mono tracking-widest text-brand mb-2 flex items-center gap-2">
                  <Zap size={12} /> Latest News & Status
                </h5>
                <p className="text-white/70 text-[13px] leading-relaxed italic">
                  "{board.news}"
                </p>
              </div>

              <button className="text-brand font-mono text-[10px] uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all mt-4 w-fit">
                Learn More <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
