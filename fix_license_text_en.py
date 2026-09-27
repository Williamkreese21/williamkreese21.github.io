import sys

with open('/app/applet/src/License.tsx', 'r') as f:
    content = f.read()

target = """            <div className="space-y-4 text-sm font-mono text-white/60">
              <p className="text-red-400 font-bold border-l-2 border-red-500 pl-3">
                Chúng tôi không chịu trách nhiệm cho bất kỳ hành vi nào của bạn. Những công cụ ở trang web này CHỈ DÀNH CHO MỤC ĐÍCH HỌC TẬP, NGHIÊN CỨU VÀ PENTEST (kiểm thử bảo mật hợp pháp).
              </p>
              <p className="text-red-400/80 font-bold border-l-2 border-red-500/50 pl-3">
                Những công cụ này nếu bạn sử dụng sai mục đích (như tấn công các hệ thống không được phép) có thể bị trừng trị bởi pháp luật. Bạn tự chịu hoàn toàn trách nhiệm cho những hành động của mình.
              </p>
              <p className="mt-6 border-t border-white/10 pt-4 opacity-70 text-xs">"""

replacement = """            <div className="space-y-4 text-sm font-mono text-white/60">
              <p className="text-red-400 font-bold border-l-2 border-red-500 pl-3">
                We are not responsible for any of your actions. The tools provided on this website are STRICTLY FOR EDUCATIONAL, RESEARCH, AND PENTESTING PURPOSES ONLY (legal security testing).
              </p>
              <p className="text-red-400/80 font-bold border-l-2 border-red-500/50 pl-3">
                If you misuse these tools (such as attacking unauthorized systems), you may face severe legal consequences. You assume full responsibility for your actions.
              </p>
              <p className="mt-6 border-t border-white/10 pt-4 opacity-70 text-xs">"""

if target in content:
    content = content.replace(target, replacement)
    with open('/app/applet/src/License.tsx', 'w') as f:
        f.write(content)
    print("License disclaimer translated successfully")
else:
    print("License target not found")
