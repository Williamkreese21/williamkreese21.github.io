import sys

with open('/app/applet/src/EspBoards.tsx', 'r') as f:
    content = f.read()

target_state = "const [activeTab, setActiveTab] = useState<'firmware' | 'all' | 'flasher'>('firmware');"
replacement_state = "const [activeTab, setActiveTab] = useState<'firmware' | 'all' | 'flasher' | 'about'>('firmware');"

target_imports = "import { X, ExternalLink, Download, Cpu, Info, Zap, Github, ArrowRight } from 'lucide-react';"
replacement_imports = "import { X, ExternalLink, Download, Cpu, Info, Zap, Github, ArrowRight, BookOpen, Star, GitFork, Clock } from 'lucide-react';\nimport { useEffect } from 'react';"

target_tab_nav = """          <TabButton 
            active={activeTab === 'flasher'} 
            onClick={() => setActiveTab('flasher')}
            icon={<Zap size={16} />}
            label="ESP Web Flasher"
          />
        </div>"""

replacement_tab_nav = """          <TabButton 
            active={activeTab === 'flasher'} 
            onClick={() => setActiveTab('flasher')}
            icon={<Zap size={16} />}
            label="ESP Web Flasher"
          />
          <TabButton 
            active={activeTab === 'about'} 
            onClick={() => setActiveTab('about')}
            icon={<Github size={16} />}
            label="About Repo"
          />
        </div>"""

target_tab_content = """        {/* Tab Content */}
        <div className="flex-1 w-full">
          {activeTab === 'flasher' && <TabFlasher />}
          {activeTab === 'firmware' && <TabFirmware />}
          {activeTab === 'all' && <TabAllBoards />}
        </div>"""

replacement_tab_content = """        {/* Tab Content */}
        <div className="flex-1 w-full">
          {activeTab === 'flasher' && <TabFlasher />}
          {activeTab === 'firmware' && <TabFirmware />}
          {activeTab === 'all' && <TabAllBoards />}
          {activeTab === 'about' && <TabAboutRepo />}
        </div>"""

if target_state in content:
    content = content.replace(target_state, replacement_state)
    content = content.replace(target_imports, replacement_imports)
    content = content.replace(target_tab_nav, replacement_tab_nav)
    content = content.replace(target_tab_content, replacement_tab_content)
    
    with open('/app/applet/src/EspBoards.tsx', 'w') as f:
        f.write(content)
    print("Tabs updated.")
else:
    print("Target state not found.")
