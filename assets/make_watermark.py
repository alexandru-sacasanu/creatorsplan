"""Render the creatorsplan watermark lockup (Short Frame mark + wordmark) to a PNG.

Pre-rendered at 4x so it downscales cleanly onto any clip size, with a soft
dark shadow so it stays legible over bright footage.

The wordmark is Hanken Grotesk Bold, the brand face. It is not vendored here;
pass any copy of it (the @fontsource/hanken-grotesk npm package ships
``files/hanken-grotesk-latin-700-normal.woff``, which Pillow reads):

    python make_watermark.py path/to/hanken-grotesk-latin-700-normal.woff
"""
import sys

from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = 4                      # supersampling
H = 64 * S                 # lockup height
PAD = 6 * S

VOLT = (255, 207, 26, 255)  # --cp-volt
INK = (20, 18, 15, 255)     # --cp-ink
WHITE = (255, 255, 255, 255)

font_path = sys.argv[1] if len(sys.argv) > 1 else "hanken-grotesk-latin-700-normal.woff"
font = ImageFont.truetype(font_path, int(40 * S))
text = "creatorsplan"      # always lowercase (design handoff > Voice)

tmp = Image.new("RGBA", (10, 10))
tb = ImageDraw.Draw(tmp).textbbox((0, 0), text, font=font)
tw, th = tb[2] - tb[0], tb[3] - tb[1]

# The Short Frame: a 9:16-ish rounded rectangle with a bolt inside, drawn from
# the same 28x46 geometry as dashboard/src/components/ShortFrameLogo.jsx.
mark_h = int(48 * S)
k = mark_h / 46
mark_w = int(28 * k)
gap = int(12 * S)
W = PAD + mark_w + gap + tw + PAD

img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

mx, my = PAD, (H - mark_h) // 2
d.rounded_rectangle([mx + 1 * k, my + 1 * k, mx + 27 * k, my + 45 * k],
                    radius=7 * k, fill=VOLT)
bolt = [(16.5, 8), (7.5, 24.5), (13.5, 24.5), (11.5, 38), (20.5, 21), (14.5, 21)]
d.polygon([(mx + x * k, my + y * k) for x, y in bolt], fill=INK)

d.text((mx + mark_w + gap - tb[0], (H - th) // 2 - tb[1]), text, font=font, fill=WHITE)

# Soft shadow behind everything for contrast on light footage.
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
shadow.paste((0, 0, 0, 170), (0, 0), img.split()[3])
shadow = shadow.filter(ImageFilter.GaussianBlur(int(2.5 * S)))
out = Image.alpha_composite(shadow, img)

out.save("watermark.png")
print("watermark.png", out.size)
