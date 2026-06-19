# Landing explainer video

Place a file named **`aura-grid-demo.mp4`** in this folder to replace the built-in
animated fallback on the landing page hero.

- The `HeroExplainerVideo` component first probes for `/videos/aura-grid-demo.mp4`.
- If the file is present, it renders a real `<video>` player (with controls, muted,
  `playsInline`, and a `poster.png` if you add one).
- If the file is **absent**, it renders an accessible animated, video-like product
  demo built with React + Motion + SVG (no asset required).

## Recommended format

- Container/codec: **MP4 (H.264)**
- Resolution: **1920×1080**
- File size: **under 25 MB**
- Optional: add `poster.png` here for the video poster frame.
