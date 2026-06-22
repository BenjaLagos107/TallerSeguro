import os

# 1. Revert logo color in index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<div class="logo" id="nav-logo" style="color: #ffffff;">', '<div class="logo" id="nav-logo" style="color: #10b981;">')

# Bump css cache
html = html.replace('<script type="module" src="./main.js?v=12"></script>', '<script type="module" src="./main.js?v=13"></script>')
html = html.replace('<link rel="stylesheet" href="./style.css?v=3">', '<link rel="stylesheet" href="./style.css?v=4">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Add calendar icon color fix to style.css
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

calendar_fix = """
/* Make calendar icon white on dark background */
input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
}
"""
if '::-webkit-calendar-picker-indicator' not in css:
    with open('style.css', 'w', encoding='utf-8') as f:
        f.write(css + calendar_fix)

print("done fixing calendar icon color")
