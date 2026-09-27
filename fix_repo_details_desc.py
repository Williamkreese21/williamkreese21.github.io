import sys

with open('/app/applet/src/RepoDetails.tsx', 'r') as f:
    content = f.read()

target = """                <div className="mb-6">
                  <h5 className="text-lg font-bold text-white uppercase tracking-wider mb-2">About</h5>
                  <p className="text-white/70 text-base leading-relaxed">{repoData.description || "No description provided."}</p>
                </div>"""

# Here we implement a simple local dictionary mapping for known Spanish strings to American English.
# Since we fetch the repo details from GitHub live, we intercept the rendering
replacement = """                <div className="mb-6">
                  <h5 className="text-lg font-bold text-white uppercase tracking-wider mb-2">About</h5>
                  <p className="text-white/70 text-base leading-relaxed">
                    {repoData.description === 'Herramienta para auditoría de redes 2.4Ghz ' 
                      ? '2.4GHz network auditing tool' 
                      : repoData.description === 'Herramienta para auditoría de redes 2.4Ghz'
                      ? '2.4GHz network auditing tool'
                      : repoData.description || "No description provided."}
                  </p>
                </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open('/app/applet/src/RepoDetails.tsx', 'w') as f:
        f.write(content)
    print("Description interceptor added successfully")
else:
    print("Target not found")
