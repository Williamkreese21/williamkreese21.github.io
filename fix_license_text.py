import sys

with open('/app/applet/src/License.tsx', 'r') as f:
    content = f.read()

target = """          <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={20} className="text-brand" />
              Disclaimer of Warranty
            </h3>
            <p className="text-sm font-mono text-white/60">
              THIS SOFTWARE AND WEBSITE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </section>"""

replacement = """          <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={20} className="text-brand" />
              Disclaimer & Legal Warning
            </h3>
            <div className="space-y-4 text-sm font-mono text-white/60">
              <p className="text-red-400 font-bold border-l-2 border-red-500 pl-3">
                Chúng tôi không chịu trách nhiệm cho bất kỳ hành vi nào của bạn. Những công cụ ở trang web này CHỈ DÀNH CHO MỤC ĐÍCH HỌC TẬP, NGHIÊN CỨU VÀ PENTEST (kiểm thử bảo mật hợp pháp).
              </p>
              <p className="text-red-400/80 font-bold border-l-2 border-red-500/50 pl-3">
                Những công cụ này nếu bạn sử dụng sai mục đích (như tấn công các hệ thống không được phép) có thể bị trừng trị bởi pháp luật. Bạn tự chịu hoàn toàn trách nhiệm cho những hành động của mình.
              </p>
              <p className="mt-6 border-t border-white/10 pt-4 opacity-70 text-xs">
                THIS SOFTWARE AND WEBSITE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
              </p>
            </div>
          </section>"""

if target in content:
    content = content.replace(target, replacement)
    with open('/app/applet/src/License.tsx', 'w') as f:
        f.write(content)
    print("License disclaimer updated successfully")
else:
    print("License target not found")
