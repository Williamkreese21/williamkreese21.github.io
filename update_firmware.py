import sys

with open('/app/applet/src/EspBoards.tsx', 'r') as f:
    content = f.read()

target = """function TabFirmware() {
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL');"""

replacement = """function TabFirmware() {
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL');
  const [warningId, setWarningId] = useState<number | null>(null);

  const handleDownload = (index: number) => {
    setWarningId(index);
    setTimeout(() => {
      setWarningId(null);
    }, 2000);
  };"""

if target in content:
    content = content.replace(target, replacement)
    
    target_btn = """<button className="flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2.5 md:py-2 bg-white/10 text-white rounded-lg group-hover:bg-brand group-hover:text-dark font-mono text-[10px] md:text-[11px] uppercase font-bold transition-all w-full mt-4">
              <Download size={14} /> <span className="hidden md:inline">Download</span><span className="md:hidden">Get</span>
            </button>"""
    
    replacement_btn = """<button 
              onClick={() => handleDownload(i)}
              className={`flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-lg font-mono text-[10px] md:text-[11px] uppercase font-bold transition-all w-full mt-4 ${
                warningId === i 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                  : 'bg-white/10 text-white group-hover:bg-brand group-hover:text-dark'
              }`}
            >
              {warningId === i ? (
                <span>Not available now</span>
              ) : (
                <>
                  <Download size={14} /> <span className="hidden md:inline">Download</span><span className="md:hidden">Get</span>
                </>
              )}
            </button>"""
    
    content = content.replace(target_btn, replacement_btn)

    with open('/app/applet/src/EspBoards.tsx', 'w') as f:
        f.write(content)
    print("Updated successfully")
else:
    print("Not found.")
