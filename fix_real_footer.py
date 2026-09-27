import sys

with open('/app/applet/src/App.tsx', 'r') as f:
    content = f.read()

target = """      {/* Footer Powered By */}
      <footer className="w-full py-8 text-center bg-dark/20 backdrop-blur-md border-t border-white/5 relative z-20 mt-auto overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl pointer-events-none" />
        <span className="font-mono text-[10px] md:text-[12px] tracking-[0.3em] uppercase text-white/40 group-hover:text-brand/80 transition-colors duration-500">
          POWERED BY <span className="text-white/60 group-hover:text-white transition-colors duration-500 font-bold ml-1">WILLIAM KREESE</span>
        </span>
      </footer>"""

replacement = """      {/* Footer Powered By */}
      <footer className="w-full py-8 text-center bg-dark/20 backdrop-blur-md border-t border-white/5 relative z-20 mt-auto overflow-hidden group flex flex-col items-center justify-center gap-3">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl pointer-events-none" />
        <span className="font-mono text-[10px] md:text-[12px] tracking-[0.3em] uppercase text-white/40 group-hover:text-brand/80 transition-colors duration-500 relative z-10">
          POWERED BY <span className="text-white/60 group-hover:text-white transition-colors duration-500 font-bold ml-1">WILLIAM KREESE</span>
        </span>
        <Link to="/license" className="font-mono text-[9px] md:text-[10px] tracking-widest uppercase text-white/30 hover:text-brand transition-colors duration-300 relative z-10 border-b border-transparent hover:border-brand/50 pb-0.5">
          License & Copyright
        </Link>
      </footer>"""

if target in content:
    content = content.replace(target, replacement)
    with open('/app/applet/src/App.tsx', 'w') as f:
        f.write(content)
    print("Footer updated successfully")
else:
    print("Footer target not found")

