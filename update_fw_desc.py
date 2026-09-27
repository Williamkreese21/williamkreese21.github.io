import sys

with open('/app/applet/src/EspBoards.tsx', 'r') as f:
    content = f.read()

target_fw = """  const firmwares = [
    { name: 'ESP32 Tools Pro v2.0', target: 'ESP32', size: '2.1 MB', date: 'May 2026', url: 'https://github.com/pepeangell5/ESP32-TOOLS-PRO-480x320-V2.0/releases/download/v2.0/firmware-merged.bin' },"""

replacement_fw = """  const firmwares = [
    { 
      name: 'ESP32 Tools Pro v2.0', 
      target: 'ESP32', 
      size: '2.1 MB', 
      date: 'May 2026', 
      url: 'https://github.com/pepeangell5/ESP32-TOOLS-PRO-480x320-V2.0/releases/download/v2.0/firmware-merged.bin',
      description: 'ESP32-TOOLS-PRO-480x320-V2.0 expande la V1.0 con soporte para módulos IR M5Stack y CC1101. Añade captura/replay IR, controles guardados, análisis RF sub-GHz, WiFi/BLE Radar, iPhone Remote y diagnósticos avanzados para pruebas WiFi, BLE, IR y RF en un ESP32 con TFT 480x320.'
    },"""

target_card = """        {filteredFirmwares.map((fw, i) => (
          <div key={i} className="flex flex-col items-center md:items-start justify-center md:justify-between p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors aspect-square md:aspect-[4/3] text-center md:text-left group">
            <div className="flex flex-col items-center md:items-start w-full">
              <h4 className="text-white font-bold text-sm md:text-base leading-tight mb-2 md:mb-1">{fw.name}</h4>
              <div className="flex flex-col md:flex-row md:flex-wrap items-center md:items-start gap-1 md:gap-2 text-[10px] md:text-[11px] font-mono text-white/50 mt-1 uppercase w-full">
                <span className="text-brand bg-brand/10 px-2 py-0.5 rounded-sm">{fw.target}</span>
                <span className="bg-black/30 px-2 py-0.5 rounded-sm">{fw.size}</span>
                <span className="bg-black/30 px-2 py-0.5 rounded-sm hidden md:inline">{fw.date}</span>
              </div>
            </div>"""

replacement_card = """        {filteredFirmwares.map((fw: any, i) => (
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
                  <span className="text-white font-bold text-xs block mb-1">About</span>
                  <p className="text-white/70 text-[11px] leading-relaxed line-clamp-6">{fw.description}</p>
                </div>
              )}
            </div>"""

if target_fw in content:
    content = content.replace(target_fw, replacement_fw)
    content = content.replace(target_card, replacement_card)
    
    with open('/app/applet/src/EspBoards.tsx', 'w') as f:
        f.write(content)
    print("Updated successfully")
else:
    print("Target not found.")
