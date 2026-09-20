import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Terminal as TerminalIcon, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Power, 
  Wifi, 
  Battery, 
  Cpu, 
  Sliders, 
  Maximize2, 
  Minimize2, 
  Send, 
  Trash2, 
  ArrowLeft, 
  CircleDot, 
  Keyboard,
  Radio,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Info,
  AlertTriangle,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BruceScreen from './components/BruceScreen';

// Board profiles supported
const BOARD_PROFILES = [
  { id: 'universal', name: 'Universal ESP32 / S2 / S3', desc: 'Standard D-Pad & Action Buttons' },
  { id: 'm5stack', name: 'M5Stack Core / Core2 / S3', desc: 'Triple Bottom Buttons (A/B/C) + Navigation' },
  { id: 'cyberdeck', name: 'CYBERDECK MINI ESP32', desc: 'Pepeangell5 Cyberdeck with Encoder' },
  { id: 'tembed', name: 'LilyGo T-Embed / T-Display', desc: 'Encoder Wheel & Dual Buttons' },
  { id: 'cardputer', name: 'M5Cardputer / StickC Plus', desc: 'Compact Screen & Keypad Controller' },
];

// Color themes for the virtual screen
const SCREEN_THEMES = [
  { id: 'green', name: 'Matrix Green', bg: '#03140b', fg: '#5ed29c', border: '#123824', accent: '#72ffbf' },
  { id: 'amber', name: 'Amber CRT', bg: '#160d02', fg: '#f59e0b', border: '#452703', accent: '#fbbf24' },
  { id: 'cyber', name: 'Cyber Blue', bg: '#041320', fg: '#38bdf8', border: '#0c3553', accent: '#7dd3fc' },
  { id: 'hacker', name: 'OLED Mono', bg: '#000000', fg: '#ffffff', border: '#262626', accent: '#a3a3a3' },
  { id: 'blood', name: 'Red Alert', bg: '#190404', fg: '#f87171', border: '#450a0a', accent: '#fca5a5' },
];

export default function MyEsp() {
  // Web Serial state
  const [port, setPort] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [selectedBoard, setSelectedBoard] = useState<string>('universal');
  const [activeTab, setActiveTab] = useState<'screen' | 'terminal' | 'split'>('split');
  
  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM] My ESP Controller initialized.',
    '[SYSTEM] Ready to connect to any ESP32 / ESP8266 device via Web Serial.',
    '[HINT] Click "Connect ESP" to pair your USB device, or use the virtual screen controls below.'
  ]);
  const [commandInput, setCommandInput] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  // Screen & Emulator state
  const [screenTheme, setScreenTheme] = useState(SCREEN_THEMES[0]);
  const [brightness, setBrightness] = useState<number>(100);
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [rxPulse, setRxPulse] = useState<boolean>(false);
  const [txPulse, setTxPulse] = useState<boolean>(false);

  // Virtual Menu navigation state (like Bruce / Marauder)
  const [currentMenuIndex, setCurrentMenuIndex] = useState<number>(0);
  const [currentSubmenu, setCurrentSubmenu] = useState<string>('main');
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('');
  const [connectionError, setConnectionError] = useState<{
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  const screenRef = useRef<HTMLDivElement>(null);
  const serialReaderRef = useRef<any>(null);
  const serialWriterRef = useRef<any>(null);
  const writeQueueRef = useRef<Uint8Array[]>([]);
  const isFlushingQueueRef = useRef<boolean>(false);
  const keepReadingRef = useRef<boolean>(false);

  // Clean up serial port on unmount
  useEffect(() => {
    return () => {
      keepReadingRef.current = false;
      writeQueueRef.current = [];
      if (serialWriterRef.current) {
        try {
          serialWriterRef.current.releaseLock();
        } catch (e) {}
        serialWriterRef.current = null;
      }
      if (serialReaderRef.current) {
        serialReaderRef.current.cancel().catch(() => {});
      }
      if (port) {
        port.close().catch(() => {});
      }
    };
  }, [port]);

  // Sample menu items for the interactive ESP UI
  const menuItems = [
    { label: 'WiFi Scanner & Audit', desc: 'Scan 2.4GHz / 5GHz channels', icon: '📶' },
    { label: 'BLE Beacon & Radar', desc: 'Monitor Bluetooth Low Energy beacons', icon: '📡' },
    { label: 'Sub-GHz RF Tools', desc: 'CC1101 433/868/915MHz analyzer', icon: '📻' },
    { label: 'IR Capture & Remote', desc: 'Infrared recording and blaster', icon: '🔦' },
    { label: 'Packet Monitor', desc: 'Real-time 802.11 deauth/beacon graphs', icon: '📊' },
    { label: 'Hardware Diagnostics', desc: 'GPIO pins, I2C, SPI, Flash & RAM info', icon: '⚡' },
    { label: 'System Configuration', desc: 'Baud, brightness, WiFi AP & battery', icon: '⚙️' },
  ];

  // Auto scroll terminal
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, autoScroll]);

  // Flash TX LED briefly when sending
  const triggerTx = () => {
    setTxPulse(true);
    setTimeout(() => setTxPulse(false), 120);
  };

  // Flash RX LED briefly when receiving
  const triggerRx = () => {
    setRxPulse(true);
    setTimeout(() => setRxPulse(false), 120);
  };

  // Connect over Web Serial API with safe handling
  const handleConnectSerial = async () => {
    setConnectionError(null);

    if (!('serial' in navigator)) {
      setConnectionError({
        title: 'Trình duyệt không hỗ trợ Web Serial API',
        message: 'Web Serial API is not supported in this browser.',
        details: 'Vui lòng sử dụng Google Chrome, Microsoft Edge hoặc Opera trên máy tính để kết nối với ESP qua cổng USB.'
      });
      return;
    }

    try {
      // 1. Request port selection from user
      const selectedPort = await (navigator as any).serial.requestPort();

      // 2. Open port if not already open
      if (!selectedPort.readable) {
        try {
          await selectedPort.open({ baudRate });
        } catch (openErr: any) {
          console.error('Serial port open failed:', openErr);
          const errMsg = openErr.message || String(openErr);

          let friendlyReason = 'Cổng COM/Serial đang bị chiếm dụng bởi ứng dụng khác hoặc tab khác.';
          if (errMsg.includes('already open')) {
            friendlyReason = 'Cổng Serial này đã được mở sẵn.';
          }

          setConnectionError({
            title: 'Không thể mở cổng Serial (Port Busy / In Use)',
            message: errMsg,
            details: friendlyReason
          });
          appendLog(`[ERROR] Failed to open serial port: ${errMsg}`);
          return;
        }
      } else {
        appendLog('[INFO] Port was already open, hooking streams...');
      }

      setPort(selectedPort);
      setIsConnected(true);
      setConnectionError(null);
      appendLog(`[CONNECTED] Serial Port active @ ${baudRate} baud.`);

      // 3. Start reader loop
      startReading(selectedPort);
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        // User cancelled port picker dialog
        appendLog('[INFO] Port selection was cancelled.');
        return;
      }
      console.error('Serial connection failed:', err);
      setConnectionError({
        title: 'Lỗi kết nối Serial',
        message: err.message || String(err),
        details: 'Không thể kết nối đến cổng Serial. Vui lòng kiểm tra lại thiết bị hoặc rút cáp USB cắm lại.'
      });
      appendLog(`[ERROR] Connection failed: ${err.message || err}`);
    }
  };

  // Disconnect Web Serial cleanly
  const handleDisconnectSerial = async () => {
    keepReadingRef.current = false;
    appendLog('[DISCONNECTING] Releasing serial streams...');
    writeQueueRef.current = [];
    
    try {
      if (serialWriterRef.current) {
        try {
          await serialWriterRef.current.close();
        } catch (e) {
          try {
            serialWriterRef.current.releaseLock();
          } catch (e2) {}
        }
        serialWriterRef.current = null;
      }
    } catch (err) {
      console.warn('Writer release err:', err);
    }

    try {
      if (serialReaderRef.current) {
        await serialReaderRef.current.cancel();
      }
    } catch (err) {
      console.warn('Reader cancel err:', err);
    }

    // Wait a brief moment for stream to release lock
    await new Promise(r => setTimeout(r, 100));

    if (port) {
      try {
        await port.close();
      } catch (err: any) {
        console.warn('Port close err:', err);
      }
    }

    setPort(null);
    setIsConnected(false);
    serialReaderRef.current = null;
    serialWriterRef.current = null;
    appendLog('[DISCONNECTED] Serial Port closed and unlocked.');
  };

  // Serial reading worker without locking pipeTo
  const startReading = async (activePort: any) => {
    keepReadingRef.current = true;
    const textDecoder = new TextDecoder();

    while (activePort && activePort.readable && keepReadingRef.current) {
      try {
        const reader = activePort.readable.getReader();
        serialReaderRef.current = reader;

        try {
          while (keepReadingRef.current) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              triggerRx();
              const chunk = textDecoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              setTerminalLogs(prev => {
                const updated = [...prev];
                for (const line of lines) {
                  if (line.trim().length > 0) {
                    updated.push(line.replace(/\r/g, ''));
                  }
                }
                return updated.slice(-500);
              });
            }
          }
        } finally {
          reader.releaseLock();
          serialReaderRef.current = null;
        }
      } catch (error: any) {
        if (keepReadingRef.current) {
          console.warn('Serial read loop note:', error);
        }
        break;
      }
    }
  };

  const appendLog = (msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-490), msg]);
  };

  // Flush queued serial bytes sequentially without overlapping writers
  const flushWriteQueue = async () => {
    if (isFlushingQueueRef.current) return;
    isFlushingQueueRef.current = true;

    try {
      while (writeQueueRef.current.length > 0) {
        const chunk = writeQueueRef.current.shift();
        if (!chunk) continue;

        if (!port || !port.writable) {
          writeQueueRef.current = [];
          break;
        }

        // Reuse persistent writer or acquire if not locked
        if (!serialWriterRef.current) {
          if (port.writable.locked) {
            await new Promise(r => setTimeout(r, 25));
          }
          if (!port.writable.locked) {
            serialWriterRef.current = port.writable.getWriter();
          }
        }

        if (serialWriterRef.current) {
          await serialWriterRef.current.write(chunk);
        }
      }
    } catch (err: any) {
      console.error('Error writing to serial:', err);
      appendLog(`[WRITE ERROR] ${err.message || err}`);
      if (serialWriterRef.current) {
        try {
          serialWriterRef.current.releaseLock();
        } catch (e) {}
        serialWriterRef.current = null;
      }
    } finally {
      isFlushingQueueRef.current = false;
      if (writeQueueRef.current.length > 0 && port && port.writable) {
        setTimeout(flushWriteQueue, 10);
      }
    }
  };

  // Send raw text/bytes to ESP over Serial safely with FIFO queue
  const sendSerialData = async (data: string | Uint8Array) => {
    triggerTx();
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;

    if (typeof data === 'string') {
      const clean = data.replace(/[\r\n]+$/, '');
      if (clean.length > 0 && !clean.startsWith('\x1b')) {
        appendLog(`[TX] ${clean}`);
      }
    }

    if (port && port.writable && isConnected) {
      writeQueueRef.current.push(bytes);
      flushWriteQueue();
    } else {
      // Simulate local feedback if device not connected
      appendLog(`[TX SIMULATION] Key: ${JSON.stringify(typeof data === 'string' ? data : Array.from(data))}`);
    }
  };

  // Navigation handlers (Virtual Button Actions)
  const handleNav = (action: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'OK' | 'BACK' | 'MENU' | 'A' | 'B' | 'C') => {
    setLastKeyPressed(action);
    setTimeout(() => setLastKeyPressed(''), 300);

    let serialPayload = '';
    switch (action) {
      case 'UP':
        setCurrentMenuIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
        serialPayload = '\x1b[A'; // Standard ANSI UP or 'u'
        break;
      case 'DOWN':
        setCurrentMenuIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
        serialPayload = '\x1b[B'; // Standard ANSI DOWN or 'd'
        break;
      case 'LEFT':
        serialPayload = '\x1b[D'; // Standard ANSI LEFT or 'l'
        break;
      case 'RIGHT':
        serialPayload = '\x1b[C'; // Standard ANSI RIGHT or 'r'
        break;
      case 'OK':
        setCurrentSubmenu(menuItems[currentMenuIndex].label);
        serialPayload = '\r'; // Enter / select
        break;
      case 'BACK':
        setCurrentSubmenu('main');
        serialPayload = '\x1b'; // ESC
        break;
      case 'MENU':
        setCurrentSubmenu('main');
        serialPayload = 'm\r';
        break;
      case 'A':
        serialPayload = 'A\r';
        break;
      case 'B':
        serialPayload = 'B\r';
        break;
      case 'C':
        serialPayload = 'C\r';
        break;
    }

    sendSerialData(serialPayload);
  };

  // Rotary Encoder simulation
  const handleEncoder = (direction: 'CW' | 'CCW' | 'CLICK') => {
    if (direction === 'CW') {
      handleNav('DOWN');
      sendSerialData('+');
    } else if (direction === 'CCW') {
      handleNav('UP');
      sendSerialData('-');
    } else {
      handleNav('OK');
      sendSerialData('\r');
    }
  };

  // Hardware Reset (DTR/RTS trigger)
  const handleHardwareReset = async () => {
    appendLog('[SYSTEM] Sending Reset pulse to ESP32...');
    sendSerialData('reboot\r\n');
    if (port) {
      try {
        await port.setSignals({ dataTerminalReady: false, requestToSend: true });
        await new Promise(r => setTimeout(r, 100));
        await port.setSignals({ dataTerminalReady: false, requestToSend: false });
        appendLog('[SYSTEM] Hard reset pulse toggled.');
      } catch (e: any) {
        appendLog(`[RESET NOTE] Software reboot sent: ${e.message}`);
      }
    }
  };

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing when typing inside inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNav('UP');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNav('DOWN');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNav('LEFT');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNav('RIGHT');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleNav('OK');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleNav('BACK');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMenuIndex, isConnected]);

  // Handle Command Line Submit
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    appendLog(`> ${commandInput}`);
    sendSerialData(commandInput + '\r\n');
    setCommandInput('');
  };

  return (
    <main className="relative z-20 flex flex-col items-center justify-start min-h-screen px-4 md:px-8 pt-28 pb-20 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Top Bar Navigation & Return */}
      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <Link 
          to="/esp"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-brand hover:border-brand/40 hover:bg-white/10 transition-all font-mono text-xs uppercase"
        >
          <ArrowLeft size={14} /> Back to ESP Hub
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/40 uppercase hidden sm:inline">Inspired by bruce.computer</span>
          <div className="px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(94,210,156,0.15)]">
            <Radio size={12} className="animate-pulse" /> MY ESP CONTROLLER
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="w-full rounded-3xl bg-[#060b09]/90 border border-white/10 backdrop-blur-2xl shadow-2xl p-4 md:p-8 flex flex-col gap-6">
        
        {/* Connection Error / Troubleshooting Alert Banner */}
        {connectionError && (
          <div className="w-full p-5 rounded-2xl bg-red-950/40 border border-red-500/40 backdrop-blur-md flex flex-col md:flex-row items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5 border border-red-500/30">
                <AlertTriangle size={22} />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-bold font-mono text-sm tracking-wide">
                    {connectionError.title}
                  </h4>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    Failed to Open Port
                  </span>
                </div>
                <p className="text-red-200/80 text-xs font-mono">
                  {connectionError.message}
                </p>
                <div className="mt-2 text-xs text-white/80 leading-relaxed flex flex-col gap-1">
                  <span className="font-bold text-brand">👉 Cách khắc phục nhanh (Quick Fixes):</span>
                  <ul className="list-disc list-inside text-white/70 space-y-0.5 text-[11px]">
                    <li><strong>Nếu vừa mở tab ESP Web Flasher:</strong> Hãy quay lại tab Web Flasher và bấm <em>"Disconnect Device"</em>, hoặc tải lại trang web.</li>
                    <li><strong>Đóng các phần mềm đang dùng cổng COM:</strong> Tắt Arduino IDE (Serial Monitor), VS Code Serial, PuTTY, PlatformIO...</li>
                    <li><strong>Rút và cắm lại cáp USB:</strong> Rút cáp USB nối ESP ra và cắm lại vào máy tính, sau đó bấm <em>"Thử lại kết nối"</em>.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={handleConnectSerial}
                className="px-4 py-2 bg-brand text-dark hover:bg-brand/90 font-mono text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(94,210,156,0.3)]"
              >
                <RotateCw size={13} /> Thử lại kết nối
              </button>
              <button
                onClick={() => setConnectionError(null)}
                className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
                title="Đóng thông báo"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Device Connection & Board Profile Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Connect Button */}
            {!isConnected ? (
              <button
                onClick={handleConnectSerial}
                className="px-5 py-2.5 rounded-xl bg-brand text-dark font-mono text-xs font-bold uppercase tracking-wider hover:bg-brand/90 hover:shadow-[0_0_20px_rgba(94,210,156,0.4)] transition-all flex items-center gap-2"
              >
                <Radio size={14} /> Connect ESP
              </button>
            ) : (
              <button
                onClick={handleDisconnectSerial}
                className="px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-all flex items-center gap-2"
              >
                <Power size={14} /> Disconnect
              </button>
            )}

            {/* Baud Rate Selector */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-[11px] font-mono text-white/50 uppercase">Baud:</span>
              <select 
                value={baudRate}
                onChange={(e) => setBaudRate(Number(e.target.value))}
                disabled={isConnected}
                className="bg-transparent text-brand font-mono text-xs focus:outline-none cursor-pointer"
              >
                <option value={9600} className="bg-dark text-white">9600</option>
                <option value={57600} className="bg-dark text-white">57600</option>
                <option value={115200} className="bg-dark text-white">115200 (Default)</option>
                <option value={230400} className="bg-dark text-white">230400</option>
                <option value={460800} className="bg-dark text-white">460800</option>
                <option value={921600} className="bg-dark text-white">921600</option>
              </select>
            </div>

            {/* Board Hardware Profile */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <Cpu size={14} className="text-brand" />
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
              >
                {BOARD_PROFILES.map(b => (
                  <option key={b.id} value={b.id} className="bg-dark text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TX / RX Activity Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-white/40">TX:</span>
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-100 ${txPulse ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-white/10'}`} />
              <span className="text-white/40 ml-2">RX:</span>
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-100 ${rxPulse ? 'bg-brand shadow-[0_0_8px_#5ed29c]' : 'bg-white/10'}`} />
            </div>

            <button
              onClick={handleHardwareReset}
              title="Send reset pulse to ESP"
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-red-400 hover:border-red-500/40 transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <RotateCw size={13} /> Reset
            </button>
          </div>
        </div>

        {/* View Mode Tabs: Screen / Terminal / Split */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'split' 
                  ? 'bg-brand/20 text-brand border border-brand/40 shadow-[0_0_15px_rgba(94,210,156,0.15)]' 
                  : 'text-white/50 hover:text-white bg-white/5'
              }`}
            >
              <Layers size={13} /> Split Screen
            </button>
            <button
              onClick={() => setActiveTab('screen')}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'screen' 
                  ? 'bg-brand/20 text-brand border border-brand/40 shadow-[0_0_15px_rgba(94,210,156,0.15)]' 
                  : 'text-white/50 hover:text-white bg-white/5'
              }`}
            >
              <Tv size={13} /> Screen Only
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'terminal' 
                  ? 'bg-brand/20 text-brand border border-brand/40 shadow-[0_0_15px_rgba(94,210,156,0.15)]' 
                  : 'text-white/50 hover:text-white bg-white/5'
              }`}
            >
              <TerminalIcon size={13} /> Terminal Only
            </button>
          </div>

          {/* Quick theme & scanline controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
              {SCREEN_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setScreenTheme(theme)}
                  title={theme.name}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    screenTheme.id === theme.id ? 'scale-125 border-white ring-2 ring-brand/50' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: theme.fg }}
                />
              ))}
            </div>

            <button
              onClick={() => setScanlines(!scanlines)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
                scanlines ? 'border-brand/40 text-brand bg-brand/10' : 'border-white/10 text-white/40'
              }`}
              title="Toggle CRT Scanline Effect"
            >
              CRT
            </button>
          </div>
        </div>

        {/* Central Display & Controller Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Virtual Screen & Device Shell */}
          <div className={`${activeTab === 'terminal' ? 'hidden' : activeTab === 'screen' ? 'lg:col-span-8' : 'lg:col-span-7'} flex flex-col gap-4`}>
            
            {/* The Physical Device Bezel */}
            <div 
              ref={screenRef}
              className="relative w-full rounded-3xl p-5 md:p-6 bg-gradient-to-b from-[#181d1b] to-[#0c100e] border-2 border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300"
            >
              {/* Device Top Plate & Bezel Brand */}
              <div className="flex items-center justify-between mb-3 px-1 text-white/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/70 font-bold">
                    {BOARD_PROFILES.find(b => b.id === selectedBoard)?.name || 'ESP32 DEVICE'}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-white/40">
                  <span className="flex items-center gap-1"><Wifi size={11} className="text-brand" /> 2.4GHz</span>
                  <span className="flex items-center gap-1"><Battery size={11} className="text-brand" /> 98%</span>
                </div>
              </div>

              {/* The Virtual Bruce Animated Screen */}
              <BruceScreen
                theme={screenTheme}
                boardName={BOARD_PROFILES.find(b => b.id === selectedBoard)?.name || 'ESP32 DEVICE'}
                scanlines={scanlines}
                brightness={brightness}
                rotation={rotation}
                isConnected={isConnected}
                baudRate={baudRate}
                onSendSerial={sendSerialData}
                lastKeyPressed={lastKeyPressed}
                onKeyAction={handleNav}
              />

              {/* Hardware Device Bottom Speaker & Logo */}
              <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/30 font-bold">
                  BRUCE / ESP REMOTE CONTROLLER
                </span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </div>
            </div>

            {/* Keyboard Shortcut Info Pill */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-white/60 text-xs font-mono">
              <span className="flex items-center gap-2">
                <Keyboard size={14} className="text-brand" /> Keyboard Enabled:
              </span>
              <span className="text-[11px] text-white/40">
                [↑] Up &nbsp;|&nbsp; [↓] Down &nbsp;|&nbsp; [Enter] Select &nbsp;|&nbsp; [Esc] Back
              </span>
            </div>
          </div>

          {/* RIGHT: Hardware Navigation D-Pad & Control Panels */}
          <div className={`${activeTab === 'screen' ? 'lg:col-span-4' : activeTab === 'terminal' ? 'lg:col-span-12' : 'lg:col-span-5'} flex flex-col gap-6`}>
            
            {/* Virtual D-Pad & Navigation Controls */}
            {activeTab !== 'terminal' && (
              <div className="p-6 rounded-3xl bg-[#0a110e] border border-white/10 shadow-xl flex flex-col items-center gap-5">
                <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CircleDot size={14} className="text-brand" /> Navigation Pad
                  </span>
                  <span className="text-[10px] font-mono text-white/40 uppercase">Hardware D-Pad</span>
                </div>

                {/* Cross D-PAD Layout */}
                <div className="relative w-44 h-44 my-2 flex items-center justify-center">
                  {/* UP BUTTON */}
                  <button
                    onClick={() => handleNav('UP')}
                    className={`absolute top-0 w-12 h-14 rounded-t-2xl bg-white/10 hover:bg-brand hover:text-dark text-white border border-white/20 hover:border-brand flex items-center justify-center transition-all active:scale-95 shadow-lg ${
                      lastKeyPressed === 'UP' ? 'bg-brand text-dark scale-95 shadow-[0_0_15px_#5ed29c]' : ''
                    }`}
                    title="Navigate Up (ArrowUp)"
                  >
                    <ChevronUp size={22} />
                  </button>

                  {/* DOWN BUTTON */}
                  <button
                    onClick={() => handleNav('DOWN')}
                    className={`absolute bottom-0 w-12 h-14 rounded-b-2xl bg-white/10 hover:bg-brand hover:text-dark text-white border border-white/20 hover:border-brand flex items-center justify-center transition-all active:scale-95 shadow-lg ${
                      lastKeyPressed === 'DOWN' ? 'bg-brand text-dark scale-95 shadow-[0_0_15px_#5ed29c]' : ''
                    }`}
                    title="Navigate Down (ArrowDown)"
                  >
                    <ChevronDown size={22} />
                  </button>

                  {/* LEFT BUTTON */}
                  <button
                    onClick={() => handleNav('LEFT')}
                    className={`absolute left-0 w-14 h-12 rounded-l-2xl bg-white/10 hover:bg-brand hover:text-dark text-white border border-white/20 hover:border-brand flex items-center justify-center transition-all active:scale-95 shadow-lg ${
                      lastKeyPressed === 'LEFT' ? 'bg-brand text-dark scale-95 shadow-[0_0_15px_#5ed29c]' : ''
                    }`}
                    title="Navigate Left (ArrowLeft)"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  {/* RIGHT BUTTON */}
                  <button
                    onClick={() => handleNav('RIGHT')}
                    className={`absolute right-0 w-14 h-12 rounded-r-2xl bg-white/10 hover:bg-brand hover:text-dark text-white border border-white/20 hover:border-brand flex items-center justify-center transition-all active:scale-95 shadow-lg ${
                      lastKeyPressed === 'RIGHT' ? 'bg-brand text-dark scale-95 shadow-[0_0_15px_#5ed29c]' : ''
                    }`}
                    title="Navigate Right (ArrowRight)"
                  >
                    <ChevronRight size={22} />
                  </button>

                  {/* CENTER OK BUTTON */}
                  <button
                    onClick={() => handleNav('OK')}
                    className={`z-10 w-14 h-14 rounded-2xl bg-brand text-dark font-mono font-extrabold text-xs tracking-wider flex items-center justify-center shadow-[0_0_20px_rgba(94,210,156,0.3)] hover:scale-105 active:scale-90 transition-all ${
                      lastKeyPressed === 'OK' ? 'bg-white text-black scale-90' : ''
                    }`}
                    title="Select / OK / Enter"
                  >
                    OK
                  </button>
                </div>

                {/* Additional Action Buttons: BACK, MENU, A, B, C */}
                <div className="w-full grid grid-cols-3 gap-2.5 pt-2">
                  <button
                    onClick={() => handleNav('BACK')}
                    className="py-2.5 px-2 rounded-xl bg-white/5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleNav('MENU')}
                    className="py-2.5 px-2 rounded-xl bg-white/5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1"
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => handleHardwareReset()}
                    className="py-2.5 px-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-1"
                  >
                    Reset
                  </button>
                </div>

                {/* M5Stack / Multi-button row: BTN A, BTN B, BTN C */}
                <div className="w-full pt-1">
                  <div className="text-[10px] font-mono text-white/40 uppercase mb-1.5 text-center">
                    M5Stack / Generic Action Keys
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleNav('A')}
                      className="py-2 rounded-lg bg-white/5 hover:bg-brand hover:text-dark text-white font-mono text-xs font-bold border border-white/10 transition-colors"
                    >
                      BTN A
                    </button>
                    <button
                      onClick={() => handleNav('B')}
                      className="py-2 rounded-lg bg-white/5 hover:bg-brand hover:text-dark text-white font-mono text-xs font-bold border border-white/10 transition-colors"
                    >
                      BTN B
                    </button>
                    <button
                      onClick={() => handleNav('C')}
                      className="py-2 rounded-lg bg-white/5 hover:bg-brand hover:text-dark text-white font-mono text-xs font-bold border border-white/10 transition-colors"
                    >
                      BTN C
                    </button>
                  </div>
                </div>

                {/* Encoder Wheel Controls for T-Embed / Dial / Cyberdeck */}
                <div className="w-full pt-1 border-t border-white/10">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/40 uppercase mb-1.5">
                    <span>Rotary Encoder</span>
                    <span>T-Embed / Cyberdeck</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEncoder('CCW')}
                      className="py-2 rounded-lg bg-white/5 hover:bg-brand/20 hover:text-brand text-white/80 font-mono text-xs border border-white/10 transition-colors flex items-center justify-center gap-1"
                    >
                      ↺ Turn Left
                    </button>
                    <button
                      onClick={() => handleEncoder('CLICK')}
                      className="py-2 rounded-lg bg-white/5 hover:bg-brand hover:text-dark text-white font-mono text-xs font-bold border border-white/10 transition-colors flex items-center justify-center gap-1"
                    >
                      🔘 Click
                    </button>
                    <button
                      onClick={() => handleEncoder('CW')}
                      className="py-2 rounded-lg bg-white/5 hover:bg-brand/20 hover:text-brand text-white/80 font-mono text-xs border border-white/10 transition-colors flex items-center justify-center gap-1"
                    >
                      ↻ Turn Right
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Live Serial Console / Terminal Output */}
            {activeTab !== 'screen' && (
              <div className="p-5 rounded-3xl bg-[#060b09] border border-white/10 shadow-xl flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase tracking-wider">
                    <TerminalIcon size={14} className="text-brand" /> Serial Output Console
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAutoScroll(!autoScroll)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        autoScroll ? 'bg-brand/10 border-brand/30 text-brand' : 'border-white/10 text-white/40'
                      }`}
                    >
                      Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => setTerminalLogs([])}
                      title="Clear terminal logs"
                      className="p-1 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Console Log Stream */}
                <div className="w-full h-56 md:h-64 bg-black/80 rounded-2xl p-3 font-mono text-[11px] leading-relaxed overflow-y-auto border border-white/5 flex flex-col gap-1 text-white/70">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="break-all whitespace-pre-wrap selection:bg-brand selection:text-dark">
                      {log.startsWith('[') ? (
                        <span className="text-brand/80">{log}</span>
                      ) : log.startsWith('>') ? (
                        <span className="text-amber-400 font-bold">{log}</span>
                      ) : (
                        <span>{log}</span>
                      )}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                {/* Quick Serial Command Input */}
                <form onSubmit={handleCommandSubmit} className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Send command (e.g. help, reboot, status)..."
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-brand/60"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand/20 hover:bg-brand text-brand hover:text-dark font-mono text-xs font-bold rounded-xl border border-brand/40 transition-colors flex items-center gap-1.5"
                  >
                    <Send size={12} /> Send
                  </button>
                </form>

                {/* Quick Macros */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'help', cmd: 'help' },
                    { label: 'ble spam apple', cmd: 'ble spam apple' },
                    { label: 'ble spam stop', cmd: 'ble spam stop' },
                    { label: 'wifi scan', cmd: 'wifi scan' },
                    { label: 'stop', cmd: 'stop' },
                    { label: 'info', cmd: 'info' },
                    { label: 'reboot', cmd: 'reboot' },
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        appendLog(`> ${item.cmd}`);
                        sendSerialData(item.cmd + '\r\n');
                      }}
                      className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-brand font-mono text-[10px] border border-white/10 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </main>
  );
}
