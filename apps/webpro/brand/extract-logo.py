from PIL import Image, ImageDraw, ImageFilter
import numpy as np, sys, os
src = sys.argv[1]; out = sys.argv[2]
os.makedirs(out, exist_ok=True)
im = Image.open(src).convert('RGB')
A = np.asarray(im).astype(np.float64)
BG = np.array([0.5, 4.0, 8.0])

def matte(box, pad=6):
    x0,y0,x1,y1 = box
    reg = A[y0-pad:y1+pad+1, x0-pad:x1+pad+1]
    c = np.clip(reg - BG, 0, None)
    m = c.max(axis=2)
    alpha = np.clip(m / 247.0, 0, 1)
    # remove background noise smoothly
    alpha = np.clip((alpha - 0.035) / (1 - 0.035), 0, 1)
    with np.errstate(invalid='ignore', divide='ignore'):
        rgb = np.where(alpha[...,None] > 0, c / np.maximum(m/247.0, 1e-6)[...,None], 0)
    rgb = np.clip(rgb, 0, 255)
    rgba = np.dstack([rgb, alpha*255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')

def trim(img, th=8):
    a = np.asarray(img)[...,3]
    ys, xs = np.where(a > th)
    return img.crop((xs.min(), ys.min(), xs.max()+1, ys.max()+1))

symbol = trim(matte((332,179,640,345)))
text = trim(matte((200,351,765,417)))
sym_m = matte((332,179,640,345)); txt_m = matte((200,351,765,417))
stacked = Image.new('RGBA', (765-200+13, 417-179+13), (0,0,0,0))
stacked.alpha_composite(sym_m, (332-200, 0)); stacked.alpha_composite(txt_m, (0, 351-179))
stacked = trim(stacked)
symbol.save(f'{out}/symbol.png'); text.save(f'{out}/wordmark.png'); stacked.save(f'{out}/logo-stacked.png')
print('symbol', symbol.size, 'text', text.size, 'stacked', stacked.size)

# Horizontal lockup following the official horizontal variant proportions
tw, th_ = text.size
sw = round(tw / (289/109)); s = sw / symbol.size[0]
sym = symbol.resize((sw, round(symbol.size[1]*s)), Image.LANCZOS)
gap = round(tw * 8/289)
H = max(sym.size[1], th_)
canvas = Image.new('RGBA', (sym.size[0] + gap + tw, sym.size[1]), (0,0,0,0))
canvas.alpha_composite(sym, (0,0))
ty = round(sym.size[1]/2 + tw*2.5/289 - th_/2)
canvas.alpha_composite(text, (sym.size[0]+gap, ty))
canvas = trim(canvas)
canvas.save(f'{out}/logo-horizontal.png')
print('horizontal', canvas.size)

# Icons: symbol on deep surface, following the official favicon variant
def icon(size, rounded=True, scale=0.74, border=True):
    S = size*4
    base = Image.new('RGBA', (S,S), (0,0,0,0))
    d = ImageDraw.Draw(base)
    r = round(S*0.22) if rounded else 0
    # vertical gradient #0E1420 -> #06080C
    grad = Image.new('RGBA', (S,S))
    gd = ImageDraw.Draw(grad)
    for y in range(S):
        t = y/(S-1)
        col = tuple(round(a*(1-t)+b*t) for a,b in zip((16,23,34),(5,6,8))) + (255,)
        gd.line([(0,y),(S,y)], fill=col)
    mask = Image.new('L', (S,S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0,0,S-1,S-1], radius=r, fill=255)
    base.paste(grad, (0,0), mask)
    if border and rounded:
        lw = max(4, round(S*0.012))
        ImageDraw.Draw(base).rounded_rectangle([lw//2,lw//2,S-1-lw//2,S-1-lw//2], radius=r, outline=(8,123,255,170), width=lw)
    w = round(S*scale); sym2 = symbol.resize((w, round(symbol.size[1]*w/symbol.size[0])), Image.LANCZOS)
    base.alpha_composite(sym2, ((S-w)//2, (S-sym2.size[1])//2 + round(S*0.01)))
    return base.resize((size,size), Image.LANCZOS)

icon(512).save(f'{out}/icon-512.png')
icon(192).save(f'{out}/icon-192.png')
icon(64, scale=0.8, border=False).save(f'{out}/icon-64.png')
icon(180, rounded=False, scale=0.7, border=False).save(f'{out}/apple-icon.png')
icon(48, scale=0.82, border=False).save(f'{out}/favicon-48.png')
icon(32, scale=0.84, border=False).save(f'{out}/favicon-32.png')
icon(16, scale=0.9, border=False).save(f'{out}/favicon-16.png')
# favicon.ico multi-size
icon(48, scale=0.82, border=False).save(f'{out}/favicon.ico', sizes=[(16,16),(32,32),(48,48)])

# Preview sheet on site background
prev = Image.new('RGBA', (1300, 620), (5,6,8,255))
prev.alpha_composite(stacked, (40,40))
prev.alpha_composite(canvas.resize((canvas.size[0]//2, canvas.size[1]//2), Image.LANCZOS), (40, 330))
prev.alpha_composite(canvas.resize((round(canvas.size[0]*0.28), round(canvas.size[1]*0.28)), Image.LANCZOS), (40, 450))
prev.alpha_composite(icon(192), (700,40)); prev.alpha_composite(icon(64,scale=0.8,border=False), (920,40)); prev.alpha_composite(icon(32,scale=0.84,border=False), (1000,40)); prev.alpha_composite(icon(16,scale=0.9,border=False), (1050,40))
light = Image.new('RGBA', (560, 160), (11,14,20,255)); light.alpha_composite(canvas.resize((canvas.size[0]//2, canvas.size[1]//2), Image.LANCZOS), (20,40))
prev.alpha_composite(light, (700, 300))
prev.convert('RGB').save(f'{out}/_preview.png')
