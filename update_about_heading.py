import sys

with open('/app/applet/src/RepoDetails.tsx', 'r') as f:
    content = f.read()

target = """              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h4 className="text-xl font-bold text-white mb-4">{repoData.full_name}</h4>
                <p className="text-white/70 text-base mb-6 leading-relaxed">{repoData.description || "No description provided."}</p>"""

replacement = """              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                <h4 className="text-xl font-bold text-white mb-6">{repoData.full_name}</h4>
                <div className="mb-6">
                  <h5 className="text-lg font-bold text-white uppercase tracking-wider mb-2">About</h5>
                  <p className="text-white/70 text-base leading-relaxed">{repoData.description || "No description provided."}</p>
                </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open('/app/applet/src/RepoDetails.tsx', 'w') as f:
        f.write(content)
    print("About heading updated successfully")
else:
    print("Target not found")
