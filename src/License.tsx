import React from 'react';
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
              Disclaimer & Legal Warning
            </h3>
            <div className="space-y-4 text-sm font-mono text-white/60">
              <p className="text-red-400 font-bold border-l-2 border-red-500 pl-3">
                We are not responsible for any of your actions. The tools provided on this website are STRICTLY FOR EDUCATIONAL, RESEARCH, AND PENTESTING PURPOSES ONLY (legal security testing).
              </p>
              <p className="text-red-400/80 font-bold border-l-2 border-red-500/50 pl-3">
                If you misuse these tools (such as attacking unauthorized systems), you may face severe legal consequences. You assume full responsibility for your actions.
              </p>
              <p className="mt-6 border-t border-white/10 pt-4 opacity-70 text-xs">
                THIS SOFTWARE AND WEBSITE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
