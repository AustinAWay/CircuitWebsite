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
  assets/js/site.js          section highlighting and the clip gallery
  assets/fonts/              self-hosted Source Serif 4 and IBM Plex (OFL)
  media/
    circuit-explainer.mp4    AI-generated explainer, re-encoded for the web
    circuit-explainer.en.vtt captions
    explainer-poster.jpg
    clips.json               server footage shown in the Media section
```

## Adding server footage

The "From the server" gallery in the Media section stays hidden until `public/media/clips.json` has
entries. Each clip needs a `title` and one source:

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
  and `mime` (defaults to `video/mp4`).
- `type: "youtube"` and `type: "vimeo"` take the video ID. YouTube embeds use `youtube-nocookie.com`.

Keep large files off git where possible. Host them on a CDN or video platform and reference the URL.
