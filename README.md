# DM FIRST

Requires Node.js 20+.

```sh
npm start       # Local preview: http://127.0.0.1:4173
npm run check   # Syntax checks
npm test        # Tests
npm run build   # Public files in dist/
```

Cloudflare Workers settings:

- Build: `npm run check && npm test && npm run build`
- Deploy: `npx wrangler deploy`
- Assets: `dist/` (configured in `wrangler.jsonc`)

Site settings: `js/config.js`.
