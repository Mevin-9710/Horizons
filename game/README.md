# Horizons playable demo (static)

`index.html` is the whole game: home → mission select → base & workshops → launch → mission control → report.
`models/*.txt` are NASA 3D models (base64 GLB, see `Design System/models/CREDITS.md`).

The root `vercel.json` deploys this folder as a static site. Import the repo in Vercel and deploy, with no build step.
To test locally: `npx serve game`. Don't open the file directly, because the models are fetched over HTTP.
