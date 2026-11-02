path = r'c:\Users\hp\Desktop\Mn\Frontend\MNmusic\src\App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
for idx, line in enumerate(lines, 1):
    if 'shazam voice search modal' in line.lower():
        print(f"Line {idx}: {line.strip()}")
        for i in range(idx, min(idx + 150, len(lines))):
            print(f"Line {i+1}: {lines[i].strip()}")
        break
