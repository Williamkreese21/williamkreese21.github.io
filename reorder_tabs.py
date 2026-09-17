with open('/app/applet/src/EspBoards.tsx', 'r') as f:
    content = f.read()

target = """        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-white/10 pb-4">
          <TabButton 
            active={activeTab === 'flasher'} 
            onClick={() => setActiveTab('flasher')}
            icon={<Zap size={16} />}
            label="ESP Web Flasher"
          />
          <TabButton 
            active={activeTab === 'firmware'} 
            onClick={() => setActiveTab('firmware')}
            icon={<Download size={16} />}
            label="Firmware Downloads"
          />
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
            icon={<Cpu size={16} />}
            label="All ESP Boards"
          />
        </div>"""

replacement = """        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-white/10 pb-4">
          <TabButton 
            active={activeTab === 'firmware'} 
            onClick={() => setActiveTab('firmware')}
            icon={<Download size={16} />}
            label="Firmware Downloads"
          />
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
            icon={<Cpu size={16} />}
            label="All ESP Boards"
          />
          <TabButton 
            active={activeTab === 'flasher'} 
            onClick={() => setActiveTab('flasher')}
            icon={<Zap size={16} />}
            label="ESP Web Flasher"
          />
        </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open('/app/applet/src/EspBoards.tsx', 'w') as f:
        f.write(content)
    print("Reordered.")
else:
    print("Not found.")
