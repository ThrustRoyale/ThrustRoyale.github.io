"""Builds the www/ folder from the repo files, even if they were uploaded flat (no folders)."""
import os, shutil
SKIP = {'node_modules', 'android', 'www', '.git', '.github'}
found = {}
for d, ds, fs in os.walk('.'):
    ds[:] = [x for x in ds if x not in SKIP]
    for f in fs:
        found.setdefault(f, os.path.join(d, f))
if 'Royale.html' not in found:
    raise SystemExit('Royale.html not found in the repo')
shutil.rmtree('www', ignore_errors=True)
os.makedirs('www/icons'); os.makedirs('www/fonts')
shutil.copy(found['Royale.html'], 'www/Royale.html')
shutil.copy(found['Royale.html'], 'www/index.html')
for f in ('sw.js', 'manifest.webmanifest'):
    if f in found: shutil.copy(found[f], 'www/' + f)
for f in ('icon-192.png', 'icon-512.png', 'maskable-512.png', 'apple-touch-icon.png', 'favicon-32.png'):
    if f in found: shutil.copy(found[f], 'www/icons/' + f)
    else: print('missing icon (ok):', f)
for f in ('chakra-petch-500.woff2', 'chakra-petch-700.woff2'):
    if f in found: shutil.copy(found[f], 'www/fonts/' + f)
    else: print('missing font (ok):', f)
print('www ready:', sorted(os.listdir('www')))
