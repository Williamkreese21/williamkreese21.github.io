import sys

with open('/app/applet/src/EspBoards.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "useState<'info'" in line:
        line = line.replace("'info' | ", "")
        line = line.replace("('info')", "('flasher')")
        new_lines.append(line)
    elif "<TabButton" in line and "active={activeTab === 'info'}" in lines[i+1]:
        skip = True
    elif skip and "/>" in line:
        skip = False
    elif skip:
        continue
    elif "{activeTab === 'info' && <TabInfo />}" in line:
        continue
    elif "function TabInfo()" in line:
        skip = True
    elif skip and "function TabFlasher()" in line:
        skip = False
        new_lines.append(line)
    elif skip:
        continue
    else:
        new_lines.append(line)

with open('/app/applet/src/EspBoards.tsx', 'w') as f:
    f.writelines(new_lines)
print("Updated successfully")
