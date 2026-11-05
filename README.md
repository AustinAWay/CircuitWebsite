# Circuit case study

A static, single-page case study of Circuit, the Minecraft server Austin Way founded to test social-cue
matchmaking. The server is shut down; this site is the archive.

## Run locally

No build step or dependencies. Serve the `public/` directory with any static server:

```bash
python3 -m http.server 8000 --directory public
```

Then open http://localhost:8000.

## Deploy

`vercel.json` deploys `public/` as a static site (no serverless functions). It also redirects the old Flask
routes (`/circuit/*`, `/signup`, `/game/*`, and so on) to the homepage and sets security headers.

## Layout

```
public/
  index.html                 the case study
  404.html
  assets/css/site.css        all styles
  assets/js/site.js          section highlighting, hero reel controls, clip gallery
  assets/fonts/              self-hosted Source Serif 4 and IBM Plex (OFL)
  media/
    hero-reel.mp4/.jpg       muted 17 s montage of server footage for the hero
    clips/                   server clips (720p H.264) with poster frames
    clips.json               gallery entries for the Footage section
    circuit-explainer.mp4    AI-generated explainer (secondary, labelled), re-encoded for the web
    circuit-explainer.en.vtt captions
    explainer-poster.jpg
```

## Adding server footage

The "From the server" gallery in the Footage section renders every entry in `public/media/clips.json`
(it stays hidden if the list is empty). Each clip needs a `title` and one source:

```json
{
  "clips": [
    {
      "title": "Opening night lobby",
      "caption": "Optional one-line context.",
      "type": "file",
      "src": "https://example-cdn.com/circuit/lobby.mp4",
      "poster": "https://example-cdn.com/circuit/lobby.jpg"
    },
    { "title": "Team finale", "type": "youtube", "id": "VIDEO_ID" },
    { "title": "Build timelapse", "type": "vimeo", "id": "123456789" }
  ]
}
```

- `type: "file"` takes an HTTPS URL or a path under `public/`. Optional: `poster`, `captions` (a `.vtt` URL),
  `mime` (defaults to `video/mp4`), `duration` (display text such as `"0:20"`) and `feature: true` (full width).
- `type: "youtube"` and `type: "vimeo"` take the video ID. YouTube embeds use `youtube-nocookie.com`.

Keep in-repo clips small. The committed clips were re-encoded with:

```bash
ffmpeg -i in.mp4 -vf scale=1280:-2 -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -movflags +faststart public/media/clips/name.mp4
```

Long recordings (the trailer, full demo) belong on a CDN or video platform; reference them by URL.
