# tn07.dev social preview design

## Purpose

Create a crisp 1200 by 630 pixel social preview for tn07.dev so LinkedIn and
other link unfurlers show the portfolio identity instead of enlarging the
favicon.

## Approved direction

Use an editorial identity card that mirrors the portfolio's light theme. The
canvas uses the site's warm paper background, dark ink, muted secondary ink,
and gold accent. DM Sans carries the name and role. JetBrains Mono carries the
small labels and URL.

The image contains only these exact strings:

- `TN07`
- `Tejas Nafde`
- `Software Engineer`
- `Bengaluru, India`
- `tn07.dev`

The composition keeps the name and role dominant at thumbnail size, uses a
large TN07 mark as the graphic anchor, and keeps all meaningful content inside
a generous safe area. It has no photograph, project collage, gradients,
shadows, icons, or decorative copy.

## Delivery

Render the artwork deterministically from HTML and CSS at exactly 1200 by 630
pixels, then export it as a PNG. Show the PNG for approval before copying it to
the public asset directory or changing Open Graph metadata.

After visual approval, add Open Graph and Twitter image metadata with absolute
URLs, dimensions, MIME type, and useful alt text. Build, inspect the generated
HTML, test the asset response, deploy, and verify the live metadata.
