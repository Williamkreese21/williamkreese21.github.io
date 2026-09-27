import sys

with open('/app/applet/src/RepoDetails.tsx', 'r') as f:
    content = f.read()

target = """                  <div className="mt-8 border-t border-white/10 pt-8">
                    <h5 className="text-base font-mono text-white/50 uppercase mb-6 tracking-wider flex items-center gap-2">
                      <Info size={16} /> README.md
                    </h5>
                    <div className="bg-[#0d1117] p-6 rounded-xl overflow-x-auto shadow-inner border border-white/5">
                      <pre className="text-sm text-[#c9d1d9] font-mono whitespace-pre-wrap leading-relaxed">{readme}</pre>
                    </div>
                  </div>"""

replacement = """                  <div className="mt-8 border-t border-white/10 pt-8">
                    <h5 className="text-base font-mono text-white/50 uppercase mb-6 tracking-wider flex items-center gap-2">
                      <Info size={16} /> README.md
                    </h5>
                    <div className="w-full overflow-x-auto">
                      <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap leading-relaxed bg-transparent p-0 m-0 border-none">{readme}</pre>
                    </div>
                  </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open('/app/applet/src/RepoDetails.tsx', 'w') as f:
        f.write(content)
    print("README background removed successfully")
else:
    print("Target not found")
