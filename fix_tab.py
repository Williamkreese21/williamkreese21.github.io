with open('/app/applet/src/EspBoards.tsx', 'r') as f:
    content = f.read()

target = """            label="ESP32 & ESP32-S3 Firmware"
          />
"""

if target in content:
    content = content.replace(target, "")
    with open('/app/applet/src/EspBoards.tsx', 'w') as f:
        f.write(content)
    print("Fixed.")
else:
    print("Not found.")
