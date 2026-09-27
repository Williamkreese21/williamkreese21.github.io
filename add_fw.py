import sys

with open('/app/applet/src/EspBoards.tsx', 'r') as f:
    content = f.read()

target_fw = """  const firmwares = [
    { 
      name: 'ESP32 Tools Pro v2.0', """

replacement_fw = """  const firmwares = [
    { 
      name: 'CYBERDECK MINI ESP32', 
      target: 'ESP32-S3', 
      size: '1.9 MB', 
      date: 'Sep 2026', 
      url: 'https://raw.githubusercontent.com/pepeangell5/CYBERDECK-MINI-ESP32/main/archivos%20bin/CYBERDECK-MINI-ESP32-firmware-merged.bin',
      description: 'Firmware for a portable cyberdeck based on ESP32-S3, ST7789 240x320 TFT display, dual nRF24L01 radio, NEO-6M GPS, microSD, encoder, and physical buttons. Built for learning, defensive monitoring, hardware diagnostics, and cybersecurity demonstrations.'
    },
    { 
      name: 'ESP32 Tools Pro v2.0', """

if target_fw in content:
    content = content.replace(target_fw, replacement_fw)
    
    with open('/app/applet/src/EspBoards.tsx', 'w') as f:
        f.write(content)
    print("Added successfully")
else:
    print("Target not found.")
