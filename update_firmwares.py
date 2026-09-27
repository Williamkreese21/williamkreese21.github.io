import sys

with open('/app/applet/src/EspBoards.tsx', 'r') as f:
    content = f.read()

target_firmwares = """  const firmwares = [
    { name: 'MicroPython v1.22.0', target: 'ESP32-S3', size: '1.5 MB', date: 'Oct 2023' },
    { name: 'MicroPython v1.22.0', target: 'ESP32', size: '1.4 MB', date: 'Oct 2023' },
    { name: 'CircuitPython 8.2.7', target: 'ESP32-S3', size: '1.8 MB', date: 'Nov 2023' },
    { name: 'WLED v0.14.0', target: 'ESP32', size: '1.1 MB', date: 'Sep 2023' },
    { name: 'Tasmota32 v13.2.0', target: 'ESP32', size: '1.6 MB', date: 'Oct 2023' },
    { name: 'ESPHome v2023.11', target: 'ESP32-C3', size: '1.2 MB', date: 'Nov 2023' },
    { name: 'NodeMCU Lua 3.0', target: 'ESP8266', size: '800 KB', date: 'Aug 2023' },
    { name: 'AT Firmware v3.1', target: 'ESP32-C6', size: '1.7 MB', date: 'Dec 2023' },
    { name: 'Arduino Core 2.0', target: 'ESP32-S2', size: '2.0 MB', date: 'Jul 2023' },
  ];"""

replacement_firmwares = """  const firmwares = [
    { name: 'ESP32 Tools Pro v2.0', target: 'ESP32', size: '2.1 MB', date: 'May 2026', url: 'https://github.com/pepeangell5/ESP32-TOOLS-PRO-480x320-V2.0/releases/download/v2.0/firmware-merged.bin' },
    { name: 'MicroPython v1.22.0', target: 'ESP32-S3', size: '1.5 MB', date: 'Oct 2023' },
    { name: 'CircuitPython 8.2.7', target: 'ESP32-S3', size: '1.8 MB', date: 'Nov 2023' },
    { name: 'WLED v0.14.0', target: 'ESP32', size: '1.1 MB', date: 'Sep 2023' },
    { name: 'Tasmota32 v13.2.0', target: 'ESP32', size: '1.6 MB', date: 'Oct 2023' },
    { name: 'ESPHome v2023.11', target: 'ESP32-C3', size: '1.2 MB', date: 'Nov 2023' },
    { name: 'NodeMCU Lua 3.0', target: 'ESP8266', size: '800 KB', date: 'Aug 2023' },
    { name: 'AT Firmware v3.1', target: 'ESP32-C6', size: '1.7 MB', date: 'Dec 2023' },
    { name: 'Arduino Core 2.0', target: 'ESP32-S2', size: '2.0 MB', date: 'Jul 2023' },
  ];"""

target_handle = """  const handleDownload = (index: number) => {
    setWarningId(index);
    setTimeout(() => {
      setWarningId(null);
    }, 2000);
  };"""

replacement_handle = """  const handleDownload = (index: number, url?: string) => {
    if (url) {
      window.location.href = url;
    } else {
      setWarningId(index);
      setTimeout(() => {
        setWarningId(null);
      }, 2000);
    }
  };"""

target_button = """            <button 
              onClick={() => handleDownload(i)}"""

replacement_button = """            <button 
              onClick={() => handleDownload(i, (fw as any).url)}"""

if target_firmwares in content:
    content = content.replace(target_firmwares, replacement_firmwares)
    content = content.replace(target_handle, replacement_handle)
    content = content.replace(target_button, replacement_button)
    with open('/app/applet/src/EspBoards.tsx', 'w') as f:
        f.write(content)
    print("Updated successfully")
else:
    print("Not found.")
