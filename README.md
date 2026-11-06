# Circuit

A static, video-only page Austin Way presents from: a **Minecraft** section with footage from the Circuit
server and a **Roblox** section with footage from the game that followed. There is no copy on the page;
the sections are navigated from the top bar while presenting.

## Run locally

No build step or dependencies:

```bash
python3 -m http.server 8000 --directory public
```

Then open http://localhost:8000. `vercel.json` deploys `public/` as a static site and redirects the old
Flask routes to `/`.

## Layout

```
public/
  index.html                  two sections: #minecraft and #roblox
  assets/css/site.css
  assets/js/site.js           renders each section from its JSON list; playing one video pauses the rest
  assets/fonts/               self-hosted IBM Plex Sans (OFL)
  media/
    clips-minecraft.json      Minecraft section
    clips/                    Minecraft clips and poster frames
    hero-reel.mp4/.jpg        silent montage, first Minecraft clip
    clips-roblox.json         Roblox section
    clips-roblox/             Roblox clips and poster frames
```

## Adding clips

Each section renders every entry in its JSON file in order. An entry needs a `title` (shown as a small
label under the video) and one source:

```json
{
  "clips": [
    { "title": "Lobby", "type": "file", "src": "/media/clips-roblox/lobby.mp4", "poster": "/media/clips-roblox/lobby.jpg", "feature": true },
    { "title": "Trailer", "type": "youtube", "id": "VIDEO_ID" },
    { "title": "Walkthrough", "type": "vimeo", "id": "123456789" }
  ]
}
```

- `type: "file"` takes a path under `public/` or an HTTPS URL. Optional: `poster`, `mime` (defaults to
  `video/mp4`) and `feature: true` (spans the full width).
- Non-HTTPS and `javascript:` URLs are ignored.

To add a Roblox clip, re-encode it to 720p, grab a poster frame, and add it to `clips-roblox.json`:

```bash
ffmpeg -i in.mp4 -vf scale=-2:720 -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -movflags +faststart public/media/clips-roblox/name.mp4
ffmpeg -ss 3 -i public/media/clips-roblox/name.mp4 -frames:v 1 -vf scale=960:-2 -q:v 5 public/media/clips-roblox/name.jpg
```

Keep each file small (the Minecraft clips are all under 7 MB). Put long recordings on a CDN or video
platform and reference them by URL.
