import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, 
  Battery, 
  Radio, 
  Shield, 
  Cpu, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  Play, 
  Square, 
  Zap, 
  Activity, 
  Tv, 
  Smartphone, 
  Key, 
  Layers, 
  AlertCircle,
  Clock,
  Terminal,
  Compass,
  Crosshair,
  Lock,
  Unlock,
  Sliders
} from 'lucide-react';

interface BruceScreenProps {
  theme: { id: string; name: string; bg: string; fg: string; border: string; accent: string };
  boardName: string;
  scanlines: boolean;
  brightness: number;
  rotation: number;
  isConnected: boolean;
  baudRate: number;
  onSendSerial: (data: string) => void;
  lastKeyPressed: string;
  onKeyAction: (action: string) => void;
}

// 8 Authentic Bruce Applications
export const BRUCE_APPS = [
  { id: 'wifi', name: 'WiFi Attacks & Audit', desc: 'Scan APs, Beacon Flooder, Deauth & EAPOL', icon: '📶', badge: 'RF' },
  { id: 'ble', name: 'BLE Spam & Radar', desc: 'AirTag radar, Apple & Android popup spam', icon: '📡', badge: 'BT' },
  { id: 'subghz', name: 'Sub-GHz Spectrum', desc: 'CC1101 433/868MHz FFT waterfall & replay', icon: '📻', badge: '433M' },
  { id: 'ir', name: 'IR Remote & TV-B-Gone', desc: 'Universal power cycle, blaster & NEC decoder', icon: '🔦', badge: 'IR' },
  { id: 'badusb', name: 'BadUSB & Ducky Run', desc: 'Keystroke injection & payload runner', icon: '⌨️', badge: 'USB' },
  { id: 'csi', name: 'WiFi CSI 2D Radar', desc: 'Spatial human motion & presence tracking', icon: '🎯', badge: 'SLAM' },
  { id: 'pktmon', name: 'Packet Monitor & Alert', desc: '802.11 deauth alert & traffic histogram', icon: '📊', badge: 'SNIF' },
  { id: 'system', name: 'Hardware Diagnostics', desc: 'CPU cores, PSRAM, battery voltage & temp', icon: '⚡', badge: 'SYS' },
];

export default function BruceScreen({
  theme,
  boardName,
  scanlines,
  brightness,
  rotation,
  isConnected,
  baudRate,
  onSendSerial,
  lastKeyPressed,
  onKeyAction
}: BruceScreenProps) {
  // Navigation & Boot State
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [currentAppIndex, setCurrentAppIndex] = useState<number>(0);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('12:00:00');
  const [batteryLevel, setBatteryLevel] = useState<number>(94);
  const [blinkPulse, setBlinkPulse] = useState<boolean>(false);

  // App 1: WiFi State
  const [wifiScanning, setWifiScanning] = useState<boolean>(false);
  const [wifiPackets, setWifiPackets] = useState<number>(1420);
  const [wifiChannel, setWifiChannel] = useState<number>(6);
  const [beaconCount, setBeaconCount] = useState<number>(88);
  const [wifiMode, setWifiMode] = useState<'scan' | 'beacon' | 'deauth' | 'handshake'>('scan');
  const [channelPowers, setChannelPowers] = useState<number[]>([35, 60, 42, 85, 20, 95, 70, 45, 80, 50, 65, 30, 40]);

  // App 2: BLE State
  const [bleRadarActive, setBleRadarActive] = useState<boolean>(true);
  const [bleSpamActive, setBleSpamActive] = useState<boolean>(false);
  const [bleSpamType, setBleSpamType] = useState<'apple' | 'android' | 'windows'>('apple');
  const [bleSpamCount, setBleSpamCount] = useState<number>(0);
  const [radarAngle, setRadarAngle] = useState<number>(0);

  // App 3: SubGHz State
  const [subGhzRunning, setSubGhzRunning] = useState<boolean>(true);
  const [rfFreq, setRfFreq] = useState<string>('433.92 MHz');
  const [rfRssi, setRfRssi] = useState<number>(-62);
  const [spectrumBars, setSpectrumBars] = useState<number[]>(Array(32).fill(20));

  // App 4: IR State
  const [irBlasting, setIrBlasting] = useState<boolean>(false);
  const [irBrand, setIrBrand] = useState<string>('Sony TV');
  const [irCodeIndex, setIrCodeIndex] = useState<number>(0);

  // App 5: BadUSB State
  const [duckyRunning, setDuckyRunning] = useState<boolean>(false);
  const [duckyLine, setDuckyLine] = useState<number>(0);

  // App 6: CSI State
  const [csiMotion, setCsiMotion] = useState<boolean>(false);
  const [csiGrid, setCsiGrid] = useState<number[][]>(() => 
    Array(6).fill(0).map(() => Array(8).fill(10))
  );

  // App 7: Packet Monitor State
  const [pktHistory, setPktHistory] = useState<number[]>([12, 18, 25, 40, 32, 28, 55, 62, 48, 70, 85, 42, 36, 60, 92, 45]);
  const [deauthDetected, setDeauthDetected] = useState<boolean>(false);

  // App 8: System State
  const [cpuUsage0, setCpuUsage0] = useState<number>(38);
  const [cpuUsage1, setCpuUsage1] = useState<number>(14);
  const [tempC, setTempC] = useState<number>(37.4);

  // Web Audio Context for Authentic Piezo Beeps
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBuzzer = (freq = 1200, durationMs = 15, type: OscillatorType = 'square') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + durationMs / 1000);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + durationMs / 1000);
      }
    } catch (e) {
      // Audio context might need user gesture
    }
  };

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0]);
      setBlinkPulse(p => !p);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Boot Sequence Simulation
  useEffect(() => {
    if (isBooting) {
      setBootProgress(0);
      setBootLog([
        '[0.000] ESP-IDF v5.1.2 Bootloader 2nd stage',
        '[0.040] Chip: ESP32-S3 Dual-Core @ 240MHz',
        '[0.080] PSRAM 8MB OCTAL, Flash 16MB QIO',
        '[0.120] SPIFFS mount: /spiffs ok (1240 KB free)',
        '[0.180] ST7789 TFT SPI Display: 240x135 init',
        '[0.240] CC1101 Radio Sub-GHz: FOUND @ SPI2',
        '[0.320] BLE Controller: NimBLE 1.4 initialized',
        '[0.400] Loading Bruce Predatory Firmware v1.7.2...',
      ]);

      const interval = setInterval(() => {
        setBootProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsBooting(false);
              playBuzzer(1800, 50, 'triangle');
            }, 300);
            return 100;
          }
          playBuzzer(800 + p * 10, 10, 'square');
          return p + 10;
        });
      }, 120);

      return () => clearInterval(interval);
    }
  }, [isBooting]);

  // Handle Key Press Reactions
  useEffect(() => {
    if (!lastKeyPressed) return;

    if (isBooting) {
      setIsBooting(false);
      return;
    }

    if (lastKeyPressed === 'UP') {
      playBuzzer(1000, 15);
      if (activeApp === null) {
        setCurrentAppIndex(prev => (prev > 0 ? prev - 1 : BRUCE_APPS.length - 1));
      }
    } else if (lastKeyPressed === 'DOWN') {
      playBuzzer(1000, 15);
      if (activeApp === null) {
        setCurrentAppIndex(prev => (prev < BRUCE_APPS.length - 1 ? prev + 1 : 0));
      }
    } else if (lastKeyPressed === 'OK' || lastKeyPressed === 'RIGHT') {
      playBuzzer(1600, 30);
      if (activeApp === null) {
        setActiveApp(BRUCE_APPS[currentAppIndex].id);
      }
    } else if (lastKeyPressed === 'BACK' || lastKeyPressed === 'LEFT') {
      playBuzzer(600, 20);
      if (activeApp !== null) {
        setActiveApp(null);
      }
    } else if (lastKeyPressed === 'MENU') {
      playBuzzer(1400, 25);
      setActiveApp(null);
    }
  }, [lastKeyPressed]);

  // Simulation Loops for Live Active Animations
  useEffect(() => {
    const animTimer = setInterval(() => {
      // 1. Radar angle
      setRadarAngle(a => (a + 15) % 360);

      // 2. WiFi Channels dynamic fluctuations
      setChannelPowers(prev => prev.map(v => Math.min(100, Math.max(15, v + (Math.random() * 20 - 10)))));
      if (wifiScanning) {
        setWifiPackets(p => p + Math.floor(Math.random() * 25 + 5));
        setWifiChannel(c => (c % 13) + 1);
        if (Math.random() > 0.85) {
          playBuzzer(1900, 10);
        }
      }

      // 3. Sub-GHz Spectrum live bounce
      setSpectrumBars(prev => prev.map((_, i) => {
        const center = 15;
        const dist = Math.abs(i - center);
        const peak = Math.max(10, 85 - dist * 5 + Math.sin(Date.now() / 200 + i) * 15);
        return Math.floor(peak);
      }));

      // 4. Packet monitor history
      setPktHistory(h => [...h.slice(1), Math.floor(Math.random() * 80 + 20)]);

      // 5. BLE Spam counter
      if (bleSpamActive) {
        setBleSpamCount(c => c + 1);
        playBuzzer(2100, 8);
      }

      // 6. CSI Radar Motion disturbance
      setCsiGrid(Array(6).fill(0).map((_, r) => 
        Array(8).fill(0).map((_, c) => {
          const val = Math.floor(Math.random() * 90 + 10);
          return val;
        })
      ));

      // 7. CPU load fluctuation
      setCpuUsage0(Math.floor(25 + Math.random() * 30));
      setCpuUsage1(Math.floor(10 + Math.random() * 20));
    }, 150);

    return () => clearInterval(animTimer);
  }, [wifiScanning, bleSpamActive]);

  // Restart Bruce Boot Animation
  const handleReboot = () => {
    playBuzzer(400, 60);
    setIsBooting(true);
    setActiveApp(null);
    onSendSerial('reboot\r\n');
  };

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[16/10] border-2 transition-all flex flex-col select-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
        filter: `brightness(${brightness}%)`,
        transform: `rotate(${rotation}deg)`
      }}
    >
      {/* Authentic CRT Scanline Shader Overlay */}
      {scanlines && (
        <div 
          className="absolute inset-0 pointer-events-none z-30 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.5) 50%)',
            backgroundSize: '100% 4px'
          }}
        />
      )}

      {/* Screen Vignette & Glass Glare */}
      <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)]" />
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none z-20" />

      {/* 1. TOP STATUS BAR (Authentic Bruce Screen Header) */}
      <div 
        className="relative z-20 w-full px-3 py-1.5 flex items-center justify-between border-b font-mono text-[11px] tracking-tight bg-black/40"
        style={{ borderColor: theme.border, color: theme.fg }}
      >
        {/* Left: Device & Firmware Name */}
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-brand">💀</span>
          <span className="tracking-wider uppercase">BRUCE v1.7</span>
          <span 
            className="text-[9px] px-1.5 py-0.2 rounded font-mono font-normal border ml-1 hidden sm:inline"
            style={{ borderColor: theme.border, color: theme.fg }}
          >
            {boardName.split(' ')[0]}
          </span>
        </div>

        {/* Center: Live / Sim Indicator */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {isConnected ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SERIAL LIVE
            </span>
          ) : (
            <span className="flex items-center gap-1 opacity-70">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              SIM ENGINE
            </span>
          )}
        </div>

        {/* Right: Hardware State Icons */}
        <div className="flex items-center gap-2 text-[10px]">
          {/* Audio Buzzer Toggle */}
          <button 
            onClick={() => {
              playBuzzer(1500, 20);
              setSoundEnabled(!soundEnabled);
            }}
            title={soundEnabled ? "Mute Buzzer" : "Unmute Buzzer"}
            className="hover:scale-110 transition-transform"
          >
            {soundEnabled ? <Volume2 size={12} className="text-brand" /> : <VolumeX size={12} className="opacity-40" />}
          </button>

          {/* WiFi Wave Indicator */}
          <span className={`flex items-center ${wifiScanning ? 'text-brand animate-pulse' : 'opacity-60'}`}>
            <Wifi size={12} />
          </span>

          {/* SD Mount */}
          <span className="text-[9px] font-bold px-1 bg-white/10 rounded">SD</span>

          {/* Battery */}
          <span className="flex items-center gap-0.5 font-mono text-[10px] font-bold text-emerald-400">
            <Battery size={12} />
            <span>{batteryLevel}%</span>
          </span>

          {/* Live RTC Time */}
          <span className="hidden md:inline font-mono opacity-80 text-[10px]">{currentTime}</span>
        </div>
      </div>

      {/* 2. MAIN DISPLAY BODY */}
      <div className="relative z-10 flex-1 p-3 font-mono overflow-y-auto flex flex-col justify-between" style={{ color: theme.fg }}>
        {isBooting ? (
          /* BOOT SEQUENCE ANIMATION */
          <div className="flex-1 flex flex-col justify-between py-2 animate-in fade-in">
            <div>
              {/* ASCII Skull Banner */}
              <pre className="text-[9px] sm:text-[10px] leading-none text-center font-mono font-black tracking-widest text-brand mb-2 opacity-90 drop-shadow-[0_0_8px_rgba(94,210,156,0.6)]">
{`   ___  ___  _   _  ____ ____
  / _ )/ _ \\/ / / / ___/ __/
 / _  / , _/ /_/ / /__/ _/  
/____/_/|_|\\____/\\___/___/  `}
              </pre>
              <div className="text-center text-[10px] tracking-widest uppercase opacity-70 mb-3 font-bold">
                PREDATORY ESP32 SUITE // M5STACK & LILYGO
              </div>

              {/* Scrolling Boot Diagnostics */}
              <div className="p-2.5 rounded-lg border bg-black/60 text-[10px] flex flex-col gap-0.5 max-h-[140px] overflow-hidden" style={{ borderColor: theme.border }}>
                {bootLog.slice(0, Math.floor(bootProgress / 12) + 1).map((log, idx) => (
                  <div key={idx} className="truncate">
                    <span className="text-brand mr-1">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Boot Progress Bar */}
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span>SYSTEM BOOT</span>
                <span>{bootProgress}%</span>
              </div>
              <div className="w-full h-2 rounded bg-black/80 border overflow-hidden p-0.5" style={{ borderColor: theme.border }}>
                <div 
                  className="h-full rounded transition-all duration-100" 
                  style={{ width: `${bootProgress}%`, backgroundColor: theme.fg }}
                />
              </div>
            </div>
          </div>
        ) : activeApp === null ? (
          /* MAIN BRUCE MENU VIEW */
          <div className="flex-1 flex flex-col gap-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[10px] pb-1 border-b uppercase tracking-widest opacity-70" style={{ borderColor: theme.border }}>
              <span>MAIN MENU ({BRUCE_APPS.length} APPS)</span>
              <span className="text-brand animate-pulse">USE D-PAD OR KEYBOARD</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 overflow-y-auto max-h-[220px] pr-1">
              {BRUCE_APPS.map((app, index) => {
                const isSelected = index === currentAppIndex;
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setCurrentAppIndex(index);
                      setActiveApp(app.id);
                      playBuzzer(1600, 30);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 border ${
                      isSelected 
                        ? 'font-bold scale-[1.01] shadow-lg' 
                        : 'opacity-70 hover:opacity-100 hover:bg-white/[0.02] border-transparent'
                    }`}
                    style={{
                      backgroundColor: isSelected ? theme.fg : 'transparent',
                      color: isSelected ? theme.bg : theme.fg,
                      borderColor: isSelected ? theme.accent : 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-sm">{app.icon}</span>
                      <div className="flex flex-col truncate text-left">
                        <span className="text-xs truncate font-bold">{app.name}</span>
                        <span className="text-[10px] truncate opacity-80">{app.desc}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span 
                        className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase"
                        style={{
                          backgroundColor: isSelected ? theme.bg : theme.border,
                          color: isSelected ? theme.fg : theme.fg
                        }}
                      >
                        {app.badge}
                      </span>
                      {isSelected && (
                        <span className="text-xs animate-pulse">▶</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ACTIVE APPLICATION LIVE RUNNER */
          <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
            {/* Sub-App Top Bar */}
            <div className="flex items-center justify-between pb-1.5 border-b mb-2" style={{ borderColor: theme.border }}>
              <div className="flex items-center gap-2">
                <span className="text-base">{BRUCE_APPS.find(a => a.id === activeApp)?.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                  {BRUCE_APPS.find(a => a.id === activeApp)?.name}
                </span>
              </div>
              <button 
                onClick={() => {
                  playBuzzer(600, 20);
                  setActiveApp(null);
                }}
                className="text-[10px] px-2 py-0.5 rounded border hover:bg-white/10 transition-colors uppercase font-bold"
                style={{ borderColor: theme.border }}
              >
                [ESC] BACK
              </button>
            </div>

            {/* APP 1: WIFI SUITE */}
            {activeApp === 'wifi' && (
              <div className="flex-1 flex flex-col gap-2">
                {/* Live Channel Graph */}
                <div className="p-2 rounded-lg border bg-black/40 flex flex-col gap-1" style={{ borderColor: theme.border }}>
                  <div className="flex justify-between text-[10px] opacity-80">
                    <span>2.4GHz SPECTRUM (CH 1 - 13)</span>
                    <span className="font-bold text-brand">CURRENT CH: {wifiChannel}</span>
                  </div>
                  <div className="flex items-end justify-between h-14 gap-1 px-1 pt-2">
                    {channelPowers.map((p, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                        <div 
                          className="w-full rounded-t transition-all duration-150"
                          style={{
                            height: `${p}%`,
                            backgroundColor: idx + 1 === wifiChannel ? '#72ffbf' : theme.fg,
                            opacity: idx + 1 === wifiChannel ? 1 : 0.6
                          }}
                        />
                        <span className="text-[8px] opacity-60">{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discovered AP Table */}
                <div className="flex-1 p-2 rounded-lg border bg-black/50 text-[10px] flex flex-col gap-1 overflow-hidden" style={{ borderColor: theme.border }}>
                  <div className="grid grid-cols-12 font-bold opacity-70 border-b pb-0.5" style={{ borderColor: theme.border }}>
                    <span className="col-span-5">SSID</span>
                    <span className="col-span-3">BSSID</span>
                    <span className="col-span-2 text-center">CH</span>
                    <span className="col-span-2 text-right">RSSI</span>
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden text-[9px]">
                    <div className="grid grid-cols-12 text-emerald-300">
                      <span className="col-span-5 truncate font-bold">CoffeeShop_5G</span>
                      <span className="col-span-3 font-mono opacity-80">E4:5F:01:2A</span>
                      <span className="col-span-2 text-center font-bold">6</span>
                      <span className="col-span-2 text-right font-bold">-48 dBm</span>
                    </div>
                    <div className="grid grid-cols-12 text-white/90">
                      <span className="col-span-5 truncate font-bold">Corp_Secure_WPA3</span>
                      <span className="col-span-3 font-mono opacity-80">18:E8:29:A1</span>
                      <span className="col-span-2 text-center font-bold">1</span>
                      <span className="col-span-2 text-right font-bold">-62 dBm</span>
                    </div>
                    <div className="grid grid-cols-12 text-white/80">
                      <span className="col-span-5 truncate font-bold">Tesla_Fleet_Guest</span>
                      <span className="col-span-3 font-mono opacity-80">00:23:CD:45</span>
                      <span className="col-span-2 text-center font-bold">11</span>
                      <span className="col-span-2 text-right font-bold">-72 dBm</span>
                    </div>
                    <div className="grid grid-cols-12 text-white/70">
                      <span className="col-span-5 truncate font-bold">iPhone_Mobile_AP</span>
                      <span className="col-span-3 font-mono opacity-80">AC:BC:32:88</span>
                      <span className="col-span-2 text-center font-bold">3</span>
                      <span className="col-span-2 text-right font-bold">-55 dBm</span>
                    </div>
                  </div>
                </div>

                {/* Live Controls */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button 
                    onClick={() => {
                      setWifiScanning(!wifiScanning);
                      playBuzzer(wifiScanning ? 600 : 1600, 30);
                      onSendSerial(wifiScanning ? 'stop\r\n' : 'scanap\r\n');
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 transition-all ${
                      wifiScanning ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-brand/20 text-brand border-brand/40'
                    }`}
                  >
                    {wifiScanning ? <Square size={11} /> : <Play size={11} />}
                    {wifiScanning ? 'STOPPING SCAN' : 'START LIVE SCAN'}
                  </button>
                  <button 
                    onClick={() => {
                      playBuzzer(1800, 20);
                      setBeaconCount(b => b + 24);
                      onSendSerial('beaconspam\r\n');
                    }}
                    className="px-3 py-1.5 rounded-lg border text-[10px] uppercase font-bold hover:bg-white/10"
                    style={{ borderColor: theme.border }}
                  >
                    BEACON SPAM ({beaconCount})
                  </button>
                </div>
              </div>
            )}

            {/* APP 2: BLE SPAM & RADAR */}
            {activeApp === 'ble' && (
              <div className="flex-1 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Radar Sonar Canvas */}
                  <div className="p-2 rounded-lg border bg-black/50 flex flex-col items-center justify-center relative aspect-square max-h-[140px]" style={{ borderColor: theme.border }}>
                    <div className="w-24 h-24 rounded-full border border-dashed relative flex items-center justify-center" style={{ borderColor: theme.fg }}>
                      <div className="w-16 h-16 rounded-full border opacity-50" style={{ borderColor: theme.fg }} />
                      <div className="w-8 h-8 rounded-full border opacity-30" style={{ borderColor: theme.fg }} />
                      
                      {/* Radar sweep line */}
                      <div 
                        className="absolute w-12 h-0.5 origin-left top-1/2 left-1/2 shadow-[0_0_8px_#5ed29c]"
                        style={{
                          backgroundColor: theme.accent,
                          transform: `rotate(${radarAngle}deg)`
                        }}
                      />

                      {/* Blips */}
                      <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-brand animate-ping" />
                      <div className="absolute bottom-6 right-5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <div className="absolute top-8 right-7 w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                    <span className="text-[9px] mt-1 opacity-70 font-mono">RADAR SWEEP 360°</span>
                  </div>

                  {/* Detected Devices List */}
                  <div className="p-2 rounded-lg border bg-black/40 text-[9px] flex flex-col justify-between overflow-hidden" style={{ borderColor: theme.border }}>
                    <span className="font-bold border-b pb-0.5 opacity-80" style={{ borderColor: theme.border }}>TARGETS IN RANGE</span>
                    <div className="flex flex-col gap-1 my-1">
                      <div className="flex justify-between text-blue-300">
                        <span>🍎 AirTag</span>
                        <span className="font-bold">-42 dBm</span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span>🐬 Flipper Zero</span>
                        <span className="font-bold">-58 dBm</span>
                      </div>
                      <div className="flex justify-between text-purple-300">
                        <span>⌚ Galaxy Watch</span>
                        <span className="font-bold">-67 dBm</span>
                      </div>
                      <div className="flex justify-between text-emerald-300">
                        <span>🎧 Sony XM5</span>
                        <span className="font-bold">-73 dBm</span>
                      </div>
                    </div>
                    <span className="text-[8px] text-brand">Total Detected: 6 Beacons</span>
                  </div>
                </div>

                {/* Spoofer Controls */}
                <div className="p-2 rounded-lg border bg-black/30 flex flex-col gap-1.5" style={{ borderColor: theme.border }}>
                  <div className="flex justify-between text-[10px]">
                    <span>BLE SPOOFER MODE:</span>
                    <span className="font-bold text-amber-400">{bleSpamType.toUpperCase()} MODAL ATTACK</span>
                  </div>
                  <div className="flex gap-1.5">
                    {(['apple', 'android', 'windows'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => {
                          setBleSpamType(t);
                          playBuzzer(1400, 20);
                        }}
                        className={`flex-1 py-1 rounded text-[9px] font-bold uppercase border transition-all ${
                          bleSpamType === t ? 'bg-brand/20 text-brand border-brand' : 'opacity-60 border-transparent hover:opacity-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const next = !bleSpamActive;
                      setBleSpamActive(next);
                      playBuzzer(next ? 2000 : 500, 40);
                      onSendSerial(next ? `ble spam ${bleSpamType}\r\n` : 'ble spam stop\r\n');
                    }}
                    className={`w-full py-2 rounded-lg border font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      bleSpamActive ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse' : 'bg-brand/20 text-brand border-brand/50 hover:bg-brand/30'
                    }`}
                  >
                    {bleSpamActive ? <Square size={11} /> : <Zap size={11} />}
                    {bleSpamActive ? `TRANSMITTING SPAM (${bleSpamCount})` : 'LAUNCH BLE SPAM PAIRING'}
                  </button>
                  {isConnected && (
                    <div className="text-[9px] text-center text-emerald-400/80 font-mono">
                      ● Cổng Serial đang kết nối: Lệnh CLI được gửi trực tiếp tới ESP32
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* APP 3: SUB-GHZ SPECTRUM (CC1101) */}
            {activeApp === 'subghz' && (
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] p-1.5 rounded border bg-black/40" style={{ borderColor: theme.border }}>
                  <span className="opacity-80">CARRIER: <strong className="text-brand">{rfFreq}</strong></span>
                  <span>PEAK RSSI: <strong className="text-amber-400">{rfRssi} dBm</strong></span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand/20 text-brand font-bold">CC1101 ACTIVE</span>
                </div>

                {/* Animated Spectrum Analyzer Display */}
                <div className="p-2 rounded-lg border bg-black/60 flex flex-col justify-end h-28 relative overflow-hidden" style={{ borderColor: theme.border }}>
                  <div className="absolute inset-0 grid grid-rows-4 grid-cols-8 border-b opacity-10 pointer-events-none" style={{ borderColor: theme.fg }} />
                  <div className="flex items-end justify-between h-20 gap-0.5 px-1 relative z-10">
                    {spectrumBars.map((val, idx) => (
                      <div 
                        key={idx} 
                        className="flex-1 rounded-t transition-all duration-100"
                        style={{
                          height: `${val}%`,
                          backgroundColor: val > 70 ? '#f87171' : val > 45 ? '#fbbf24' : theme.fg
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] opacity-60 pt-1 border-t" style={{ borderColor: theme.border }}>
                    <span>433.05 MHz</span>
                    <span>433.92 MHz (PEAK)</span>
                    <span>434.79 MHz</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      playBuzzer(1800, 30);
                      setRfFreq(f => f === '433.92 MHz' ? '868.35 MHz' : f === '868.35 MHz' ? '315.00 MHz' : '433.92 MHz');
                    }}
                    className="flex-1 py-1.5 rounded-lg border text-[10px] uppercase font-bold hover:bg-white/10"
                    style={{ borderColor: theme.border }}
                  >
                    SWITCH FREQ ({rfFreq.split(' ')[0]})
                  </button>
                  <button 
                    onClick={() => {
                      playBuzzer(2200, 40);
                      onSendSerial('subghz rx 433920000\r\n');
                    }}
                    className="flex-1 py-1.5 rounded-lg border bg-brand/20 border-brand/40 text-brand text-[10px] uppercase font-bold"
                  >
                    RECORD RAW SIGNAL
                  </button>
                </div>
              </div>
            )}

            {/* APP 4: INFRARED (TV-B-GONE) */}
            {activeApp === 'ir' && (
              <div className="flex-1 flex flex-col gap-2.5">
                <div className="p-3 rounded-lg border bg-black/40 flex items-center justify-between" style={{ borderColor: theme.border }}>
                  <div className="flex flex-col">
                    <span className="text-[10px] opacity-70">TARGET IR DATABASE</span>
                    <span className="text-sm font-bold text-brand">{irBrand}</span>
                    <span className="text-[9px] opacity-60">CARRIER: 38kHz PWM | PROTOCOL: NEC / SONY</span>
                  </div>
                  <div className={`p-3 rounded-full border transition-all ${irBlasting ? 'bg-red-500 text-white shadow-[0_0_20px_#ef4444] animate-ping' : 'bg-white/5 opacity-50'}`}>
                    <Zap size={20} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border bg-black/50 text-[10px] flex flex-col gap-1.5" style={{ borderColor: theme.border }}>
                  <div className="flex justify-between">
                    <span>TV-B-GONE POWER CODES:</span>
                    <span className="font-bold text-amber-400">{irCodeIndex} / 120 EMITTED</span>
                  </div>
                  <div className="w-full h-2 rounded bg-black/80 border overflow-hidden p-0.5" style={{ borderColor: theme.border }}>
                    <div 
                      className="h-full rounded transition-all duration-100 bg-brand"
                      style={{ width: `${(irCodeIndex / 120) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] opacity-60">Emits universal shutdown frames across Sony, Samsung, LG, Sharp, Philips, TCL</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setIrBlasting(!irBlasting);
                      playBuzzer(irBlasting ? 600 : 1900, 40);
                      if (!irBlasting) {
                        const blastTimer = setInterval(() => {
                          setIrCodeIndex(idx => {
                            if (idx >= 120) {
                              clearInterval(blastTimer);
                              setIrBlasting(false);
                              return 120;
                            }
                            return idx + 6;
                          });
                        }, 100);
                      }
                      onSendSerial('tvbgone\r\n');
                    }}
                    className={`flex-1 py-2 rounded-lg border font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 ${
                      irBlasting ? 'bg-red-500/20 text-red-300 border-red-500 animate-pulse' : 'bg-brand/20 text-brand border-brand/50'
                    }`}
                  >
                    <Zap size={12} />
                    {irBlasting ? 'BLASTING POWER CODES...' : 'EXECUTE TV-B-GONE ALL'}
                  </button>
                  <button
                    onClick={() => {
                      playBuzzer(1200, 20);
                      setIrBrand(b => b === 'Sony TV' ? 'Samsung TV' : b === 'Samsung TV' ? 'LG WebOS' : 'Sony TV');
                    }}
                    className="px-3 py-2 rounded-lg border text-[10px] uppercase font-bold hover:bg-white/10"
                    style={{ borderColor: theme.border }}
                  >
                    NEXT BRAND
                  </button>
                </div>
              </div>
            )}

            {/* APP 5: BADUSB / DUCKY SCRIPT */}
            {activeApp === 'badusb' && (
              <div className="flex-1 flex flex-col gap-2">
                <div className="p-2.5 rounded-lg border bg-black/60 text-[10px] flex flex-col gap-1 font-mono" style={{ borderColor: theme.border }}>
                  <span className="opacity-70 text-[9px] border-b pb-0.5" style={{ borderColor: theme.border }}>
                    PAYLOAD: reverse_shell_ps1.ducky
                  </span>
                  <div className="flex flex-col gap-0.5 text-[9px] opacity-90 my-1">
                    <span className="text-amber-400">DELAY 500</span>
                    <span className="text-emerald-400">GUI r</span>
                    <span className="text-amber-400">DELAY 200</span>
                    <span className="text-blue-300">STRING powershell -NoP -NonI -W Hidden</span>
                    <span className="text-amber-400">ENTER</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t text-[8px] opacity-60" style={{ borderColor: theme.border }}>
                    <span>SPEED: 220 WPM</span>
                    <span>TARGET: WINDOWS 11 / 10</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setDuckyRunning(true);
                    playBuzzer(1700, 30);
                    setTimeout(() => {
                      setDuckyRunning(false);
                      playBuzzer(2200, 50);
                    }, 1500);
                    onSendSerial('ducky run payload.txt\r\n');
                  }}
                  className={`py-2 rounded-lg border font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 ${
                    duckyRunning ? 'bg-amber-500/20 text-amber-300 border-amber-500 animate-pulse' : 'bg-brand/20 text-brand border-brand/50'
                  }`}
                >
                  <Terminal size={12} />
                  {duckyRunning ? 'INJECTING KEYSTROKES...' : 'INJECT BADUSB PAYLOAD'}
                </button>
              </div>
            )}

            {/* APP 6: WIFI CSI 2D RADAR */}
            {activeApp === 'csi' && (
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between text-[10px] p-1 rounded border bg-black/40" style={{ borderColor: theme.border }}>
                  <span>CSI MATRIX MOTION SENSING</span>
                  <span className="text-emerald-400 font-bold animate-pulse">● MOTION DETECTED</span>
                </div>

                {/* 2D Heatmap Grid */}
                <div className="p-2 rounded-lg border bg-black/60 flex flex-col gap-1 items-center justify-center" style={{ borderColor: theme.border }}>
                  {csiGrid.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1">
                      {row.map((val, cIdx) => (
                        <div 
                          key={cIdx} 
                          className="w-5 h-3.5 rounded-sm transition-all duration-150"
                          style={{
                            backgroundColor: val > 70 ? '#f87171' : val > 45 ? '#fbbf24' : theme.fg,
                            opacity: val / 100
                          }}
                        />
                      ))}
                    </div>
                  ))}
                  <span className="text-[8px] opacity-60 mt-1">SPATIAL DISTURBANCE TRACKER (SLAM)</span>
                </div>
              </div>
            )}

            {/* APP 7: PACKET MONITOR */}
            {activeApp === 'pktmon' && (
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between text-[10px] p-1.5 rounded border bg-black/40" style={{ borderColor: theme.border }}>
                  <span>TRAFFIC HISTOGRAM</span>
                  <span className="text-brand font-bold">142 PKTS/SEC</span>
                </div>

                {/* Real-time bar histogram */}
                <div className="p-2 rounded-lg border bg-black/60 h-24 flex items-end justify-between gap-1" style={{ borderColor: theme.border }}>
                  {pktHistory.map((val, idx) => (
                    <div 
                      key={idx} 
                      className="flex-1 rounded-t transition-all duration-150"
                      style={{
                        height: `${val}%`,
                        backgroundColor: val > 75 ? '#ef4444' : theme.fg
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border bg-red-950/20 border-red-500/40 text-red-300 text-[10px]">
                  <span className="flex items-center gap-1">
                    <AlertCircle size={13} className="text-red-400 animate-pulse" />
                    DEAUTH DETECTOR:
                  </span>
                  <span className="font-bold">STANDBY (0 ALERTS)</span>
                </div>
              </div>
            )}

            {/* APP 8: HARDWARE DIAGNOSTICS */}
            {activeApp === 'system' && (
              <div className="flex-1 flex flex-col gap-2 text-[10px]">
                <div className="p-2.5 rounded-lg border bg-black/40 flex flex-col gap-1.5" style={{ borderColor: theme.border }}>
                  <div className="flex justify-between">
                    <span>CPU Core 0 (App CPU):</span>
                    <span className="font-bold text-brand">{cpuUsage0}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-black/80 overflow-hidden">
                    <div className="h-full bg-brand rounded transition-all duration-200" style={{ width: `${cpuUsage0}%` }} />
                  </div>

                  <div className="flex justify-between mt-1">
                    <span>CPU Core 1 (Radio CPU):</span>
                    <span className="font-bold text-brand">{cpuUsage1}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-black/80 overflow-hidden">
                    <div className="h-full bg-brand rounded transition-all duration-200" style={{ width: `${cpuUsage1}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg border bg-black/40 flex flex-col gap-0.5" style={{ borderColor: theme.border }}>
                    <span className="opacity-70 text-[9px]">INTERNAL HEAP</span>
                    <span className="font-bold text-emerald-400">248 KB / 320 KB</span>
                    <span className="text-[8px] opacity-60">PSRAM: 5.2 MB / 8 MB</span>
                  </div>
                  <div className="p-2 rounded-lg border bg-black/40 flex flex-col gap-0.5" style={{ borderColor: theme.border }}>
                    <span className="opacity-70 text-[9px]">CHIP TEMPERATURE</span>
                    <span className="font-bold text-amber-400">{tempC} °C</span>
                    <span className="text-[8px] opacity-60">HALL SENSOR: +12</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleReboot}
                    className="flex-1 py-1.5 rounded-lg border border-red-500/40 text-red-300 font-bold uppercase hover:bg-red-500/10 text-[10px]"
                  >
                    REBOOT ESP
                  </button>
                  <button 
                    onClick={() => {
                      playBuzzer(1500, 20);
                      onSendSerial('sysinfo\r\n');
                    }}
                    className="flex-1 py-1.5 rounded-lg border text-[10px] uppercase font-bold hover:bg-white/10"
                    style={{ borderColor: theme.border }}
                  >
                    DUMP TO SERIAL
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM VIRTUAL NAVIGATION HINTS BAR */}
      <div 
        className="relative z-20 w-full px-3 py-1 flex items-center justify-between border-t font-mono text-[9px] tracking-tight bg-black/50"
        style={{ borderColor: theme.border, color: theme.fg }}
      >
        <div className="flex items-center gap-2">
          <span>[▲/▼] NAV</span>
          <span>[OK] ENTER</span>
          <span>[ESC] BACK</span>
          <span>[M] ROOT</span>
        </div>
        <div className="flex items-center gap-1 opacity-70">
          <Clock size={10} />
          <span>UPTIME 04:12:38</span>
        </div>
      </div>
    </div>
  );
}
