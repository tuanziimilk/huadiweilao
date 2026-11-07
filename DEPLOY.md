# Cloudflare Pages

- Connect the GitHub repository and select the `main` production branch.
- Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
- Root directory: repository root. Node.js: 22 (set `NODE_VERSION=22` if needed).
- No secrets or backend are required.
- The build publishes both `/` and `/huadiweilao/` and redirects `/huadiweilao` to the trailing-slash URL.

After the first successful deployment, add `game.zoepeng.space` in Pages Custom domains. Then add an Alibaba Cloud DNS CNAME record named `game`, targeting the production `*.pages.dev` hostname shown by Pages. Do not include a protocol or path. Check existing records before replacing anything.

Verify images, audio, game controls, appreciation code, and the QR code on the score-sharing image at `https://game.zoepeng.space/huadiweilao/`.
