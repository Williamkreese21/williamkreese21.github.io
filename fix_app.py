import sys

with open('/app/applet/src/App.tsx', 'r') as f:
    content = f.read()

target = """    {/* Global Footer */}
    <footer className="relative z-20 py-8 text-center text-white/30 font-mono text-[10px] uppercase tracking-[0.2em] w-full mix-blend-difference pointer-events-none">
      <p>© {new Date().getFullYear()} William Kreese. All rights reserved.</p>
    </footer>"""

if target in content:
    print("Found footer in App.tsx")
else:
    print("Footer not found in App.tsx")

