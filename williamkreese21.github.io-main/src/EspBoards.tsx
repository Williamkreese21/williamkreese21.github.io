import React, { useState } from 'react';
import { X, ExternalLink, Download, Cpu, Info, Zap, Github, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EspBoards() {
  const [activeTab, setActiveTab] = useState<'info' | 'flasher' | 'firmware' | 'all'>('info');

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
        <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-white/10 pb-4">
          <TabButton 
            active={activeTab === 'info'} 
            onClick={() => setActiveTab('info')}
            icon={<Info size={16} />}
            label="ESP32 & ESP32-S3 Firmware"
          />
          <TabButton 
            active={activeTab === 'flasher'} 
            onClick={() => setActiveTab('flasher')}
            icon={<Zap size={16} />}
            label="ESP32-S3 Flasher"
          />
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
        </div>

        {/* Tab Content */}
        <div className="flex-1 w-full">
          {activeTab === 'info' && <TabInfo />}
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

function TabInfo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in duration-500">
      
      {/* ESP32 Square */}
      <div className="group relative overflow-hidden rounded-2xl bg-[#0a110e] border border-white/10 p-6 flex flex-col hover:border-brand/50 transition-colors duration-500 h-[350px]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1601132645856-11f84e1b8bbf?auto=format&fit=crop&q=80" 
            alt="ESP32" 
            className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a110e] via-[#0a110e]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">ESP32 <span className="text-brand">Classic</span></h3>
          <p className="text-white/70 text-sm mb-4 line-clamp-3">
            The original dual-core powerhouse with integrated Wi-Fi and dual-mode Bluetooth. Perfect for general purpose IoT applications requiring solid performance and connectivity.
          </p>
          
          <div className="mt-auto">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Github size={20} className="text-white/80" />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50 font-mono uppercase">Repository</span>
                <a href="https://github.com/espressif/arduino-esp32" target="_blank" rel="noreferrer" className="text-sm font-medium text-white hover:text-brand transition-colors flex items-center gap-1">
                  espressif/arduino-esp32 <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESP32-S3 Square */}
      <div className="group relative overflow-hidden rounded-2xl bg-[#0a110e] border border-white/10 p-6 flex flex-col hover:border-brand/50 transition-colors duration-500 h-[350px]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80" 
            alt="ESP32-S3" 
            className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a110e] via-[#0a110e]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">ESP32-<span className="text-brand">S3</span></h3>
          <p className="text-white/70 text-sm mb-4 line-clamp-3">
            Advanced MCU with vector instructions for AI acceleration, USB OTG, and massive IO capability. Designed for AIoT, voice recognition, and image processing.
          </p>
          
          <div className="mt-auto">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Github size={20} className="text-white/80" />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50 font-mono uppercase">Repository</span>
                <a href="https://github.com/espressif/esp-idf" target="_blank" rel="noreferrer" className="text-sm font-medium text-white hover:text-brand transition-colors flex items-center gap-1">
                  espressif/esp-idf <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function TabFlasher() {
  return (
    <div className="w-full animate-in fade-in duration-500 flex flex-col items-center justify-center p-8 bg-[#0a110e]/50 border border-white/10 rounded-2xl">
      <Zap size={48} className="text-brand mb-4 opacity-80" />
      <h3 className="text-xl font-bold text-white mb-2 uppercase text-center">Universal ESP Web Flasher</h3>
      <p className="text-white/60 text-center max-w-lg mb-8 text-sm">
        Connect any ESP board (ESP8266, ESP32, S-Series, or C-Series) via USB to flash firmware directly from your browser using the Web Serial API. No installation required.
      </p>
      
      <div className="flex flex-col gap-4 w-full max-w-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <select className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 focus:outline-none focus:border-brand/50 font-mono text-sm">
            <option value="auto">Auto-detect Chip</option>
            <option value="esp8266">ESP8266</option>
            <option value="esp32">ESP32</option>
            <option value="esp32s2">ESP32-S2</option>
            <option value="esp32s3">ESP32-S3</option>
            <option value="esp32c3">ESP32-C3</option>
            <option value="esp32c6">ESP32-C6</option>
          </select>
          <select className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 focus:outline-none focus:border-brand/50 font-mono text-sm">
            <option value="default">Select Firmware...</option>
            <option value="micropython">MicroPython (Latest)</option>
            <option value="circuitpython">CircuitPython (Latest)</option>
            <option value="tasmota">Tasmota</option>
            <option value="esphome">ESPHome Base</option>
            <option value="custom">Custom Binary (.bin)</option>
          </select>
        </div>
        <button className="w-full py-4 bg-brand text-dark font-bold tracking-widest uppercase rounded-xl hover:bg-brand/80 hover:shadow-[0_0_20px_rgba(94,210,156,0.4)] transition-all flex items-center justify-center gap-2">
          Connect & Flash <ExternalLink size={16} />
        </button>
      </div>
      
      <div className="mt-8 w-full max-w-lg p-4 bg-black/50 border border-white/5 rounded-xl font-mono text-[10px] text-brand/50 h-32 overflow-y-auto">
        <div className="opacity-50">// Universal Web Flasher Console Initialized</div>
        <div className="opacity-50">// Supports ESP8266, ESP32, S2, S3, C3, C6, etc.</div>
        <div className="opacity-50">Waiting for device connection...</div>
      </div>
    </div>
  );
}

function TabFirmware() {
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL');

  const firmwares = [
    { name: 'MicroPython v1.22.0', target: 'ESP32-S3', size: '1.5 MB', date: 'Oct 2023' },
    { name: 'MicroPython v1.22.0', target: 'ESP32', size: '1.4 MB', date: 'Oct 2023' },
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
        {filteredFirmwares.map((fw, i) => (
          <div key={i} className="flex flex-col items-center md:items-start justify-center md:justify-between p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors aspect-square md:aspect-[4/3] text-center md:text-left group">
            <div className="flex flex-col items-center md:items-start w-full">
              <h4 className="text-white font-bold text-sm md:text-base leading-tight mb-2 md:mb-1">{fw.name}</h4>
              <div className="flex flex-col md:flex-row md:flex-wrap items-center md:items-start gap-1 md:gap-2 text-[10px] md:text-[11px] font-mono text-white/50 mt-1 uppercase w-full">
                <span className="text-brand bg-brand/10 px-2 py-0.5 rounded-sm">{fw.target}</span>
                <span className="bg-black/30 px-2 py-0.5 rounded-sm">{fw.size}</span>
                <span className="bg-black/30 px-2 py-0.5 rounded-sm hidden md:inline">{fw.date}</span>
              </div>
            </div>
            <button className="flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2.5 md:py-2 bg-white/10 text-white rounded-lg group-hover:bg-brand group-hover:text-dark font-mono text-[10px] md:text-[11px] uppercase font-bold transition-all w-full mt-4">
              <Download size={14} /> <span className="hidden md:inline">Download</span><span className="md:hidden">Get</span>
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
