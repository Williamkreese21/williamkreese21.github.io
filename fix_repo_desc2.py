import sys

with open('/app/applet/src/RepoDetails.tsx', 'r') as f:
    content = f.read()

target = """                  <p className="text-white/70 text-base leading-relaxed">
                    {repoData.description === 'Herramienta para auditoría de redes 2.4Ghz ' 
                      ? '2.4GHz network auditing tool' 
                      : repoData.description === 'Herramienta para auditoría de redes 2.4Ghz'
                      ? '2.4GHz network auditing tool'
                      : repoData.description || "No description provided."}
                  </p>"""

replacement = """                  <p className="text-white/70 text-base leading-relaxed">
                    {repoData.description === 'Herramienta para auditoría de redes 2.4Ghz ' 
                      ? '2.4GHz network auditing tool' 
                      : repoData.description === 'Herramienta para auditoría de redes 2.4Ghz'
                      ? '2.4GHz network auditing tool'
                      : (repoData.description || '').includes('expande la V1.0 con soporte para módulos IR M5Stack y CC1101')
                      ? 'ESP32-TOOLS-PRO-480x320-V2.0 expands V1.0 with support for M5Stack IR modules and CC1101. It adds IR capture/replay, saved controls, sub-GHz RF analysis, WiFi/BLE Radar, iPhone Remote, and advanced diagnostics for WiFi, BLE, IR, and RF testing on an ESP32 with a 480x320 TFT display.'
                      : repoData.description || "No description provided."}
                  </p>"""

if target in content:
    content = content.replace(target, replacement)
    with open('/app/applet/src/RepoDetails.tsx', 'w') as f:
        f.write(content)
    print("Second description intercepted successfully")
else:
    print("Target not found")
