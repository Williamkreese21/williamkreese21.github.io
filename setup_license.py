import os

license_content = """import React from 'react';
import { Shield, Copyright, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function License() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="relative z-20 flex flex-col items-center justify-start min-h-screen px-6 pt-32 pb-24 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="liquid-glass-card relative w-full p-8 md:p-12 text-left flex flex-col">
        
        <Link 
          to="/" 
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/20 text-white/70 hover:text-brand hover:border-brand/50 hover:bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:scale-[1.03] transition-all duration-300 z-20"
        >
          <ArrowLeft size={16} />
          <span className="font-mono text-[10px] md:text-[11px] tracking-widest uppercase font-bold">Back to Home</span>
        </Link>

        <div className="flex flex-col items-center mb-12 mt-12 md:mt-8">
          <Shield size={48} className="text-brand mb-6" />
          <h2 className="text-3xl md:text-5xl font-inter font-extrabold tracking-tight uppercase text-white text-center">
            License & <span className="text-brand">Copyright</span>
          </h2>
          <div className="flex items-center gap-2 mt-4 text-white/50 font-mono text-sm">
            <Copyright size={14} />
            <span>{currentYear} William Kreese. All rights reserved.</span>
          </div>
        </div>

        <div className="space-y-8 text-white/80 leading-relaxed font-sans">
          
          <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={20} className="text-brand" />
              Terms of Use
            </h3>
            <p className="mb-4">
              The content, design, graphics, and interactive elements of this website are the exclusive property of William Kreese and are protected by international copyright and intellectual property laws.
            </p>
            <p className="mb-4">
              You are strictly prohibited from:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/70 font-mono text-sm marker:text-brand">
              <li>Copying, modifying, or duplicating the UI/UX design.</li>
              <li>Redistributing or selling any assets found within this platform.</li>
              <li>Using the branding, name "William Kreese", or logos without explicit written permission.</li>
              <li>Claiming ownership of the source code structure provided herein.</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={20} className="text-brand" />
              Third-Party Firmware & Code
            </h3>
            <p className="mb-4">
              This platform acts as a hub and flasher interface for various open-source firmware projects (such as ESP32 Tools Pro, MicroPython, WLED, etc.). 
            </p>
            <p>
              These firmware binaries, their respective source codes, and associated trademarks are the property of their original authors and maintainers. They are distributed under their own respective licenses (e.g., MIT, GPL). William Kreese does not claim ownership over these third-party tools.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={20} className="text-brand" />
              Disclaimer of Warranty
            </h3>
            <p className="text-sm font-mono text-white/60">
              THIS SOFTWARE AND WEBSITE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
"""
with open('/app/applet/src/License.tsx', 'w') as f:
    f.write(license_content)


# 2. Add Route to App.tsx
with open('/app/applet/src/App.tsx', 'r') as f:
    app_content = f.read()

import_target = "import RepoDetails from './RepoDetails';"
import_replacement = "import RepoDetails from './RepoDetails';\nimport License from './License';"

route_target = '<Route path="/repo/:owner/:repo" element={<RepoDetails />} />'
route_replacement = '<Route path="/repo/:owner/:repo" element={<RepoDetails />} />\n            <Route path="/license" element={<License />} />'

app_content = app_content.replace(import_target, import_replacement).replace(route_target, route_replacement)
with open('/app/applet/src/App.tsx', 'w') as f:
    f.write(app_content)

# 3. Add Footer Link in App.tsx
footer_target = """        {/* Global Footer */}
        <footer className="relative z-20 py-8 text-center text-white/30 font-mono text-[10px] uppercase tracking-[0.2em] w-full mix-blend-difference pointer-events-none">
          <p>© {new Date().getFullYear()} William Kreese. All rights reserved.</p>
        </footer>"""

footer_replacement = """        {/* Global Footer */}
        <footer className="relative z-20 py-8 flex flex-col items-center justify-center gap-2 text-center text-white/40 font-mono text-[10px] uppercase tracking-[0.2em] w-full mix-blend-difference">
          <p>© {new Date().getFullYear()} William Kreese. All rights reserved.</p>
          <Link to="/license" className="hover:text-brand transition-colors pointer-events-auto border-b border-transparent hover:border-brand pb-0.5">
            License & Copyright
          </Link>
        </footer>"""

# If the footer was marked as pointer-events-none, we need to make sure the link is clickable.
# We replaced pointer-events-none with pointer-events-auto on the link itself, and removed it from the footer container.
if footer_target in app_content:
    app_content = app_content.replace(footer_target, footer_replacement)
    with open('/app/applet/src/App.tsx', 'w') as f:
        f.write(app_content)
    print("Setup License completed")
else:
    print("Footer target not found")
