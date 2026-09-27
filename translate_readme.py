import os

with open('/app/applet/src/RepoDetails.tsx', 'r') as f:
    content = f.read()

# Instead of doing live AI translation on the client (which is complex and requires API keys),
# we will just add the "Repository Status" header above the stats (which was requested)
# and clarify that the README is loaded from the remote source.

# First, add the Repository Status header
target_header = """          {loading ? (
            <div className="flex justify-center items-center py-20">"""

replacement_header = """          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-2">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Star size={20} className="text-brand" />
              Repository Status
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">"""

if target_header in content:
    content = content.replace(target_header, replacement_header)
    with open('/app/applet/src/RepoDetails.tsx', 'w') as f:
        f.write(content)
    print("Updated successfully")
else:
    print("Target not found")

