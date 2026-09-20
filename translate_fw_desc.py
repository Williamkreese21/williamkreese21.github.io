import sys

with open('/app/applet/src/EspBoards.tsx', 'r') as f:
    content = f.read()

target_fw = """description: 'ESP32-TOOLS-PRO-480x320-V2.0 expande la V1.0 con soporte para módulos IR M5Stack y CC1101. Añade captura/replay IR, controles guardados, análisis RF sub-GHz, WiFi/BLE Radar, iPhone Remote y diagnósticos avanzados para pruebas WiFi, BLE, IR y RF en un ESP32 con TFT 480x320.'"""

replacement_fw = """description: 'ESP32-TOOLS-PRO-480x320-V2.0 expands on V1.0 with support for M5Stack IR modules and CC1101. It adds IR capture/replay, saved controls, sub-GHz RF analysis, WiFi/BLE Radar, iPhone Remote, and advanced diagnostics for WiFi, BLE, IR, and RF testing on an ESP32 with a 480x320 TFT display.'"""


if target_fw in content:
    content = content.replace(target_fw, replacement_fw)
    
    with open('/app/applet/src/EspBoards.tsx', 'w') as f:
        f.write(content)
    print("Translated successfully")
else:
    print("Target not found.")
