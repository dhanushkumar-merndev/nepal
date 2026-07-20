## Ott Subscription Nepal

Next.js storefront for OTT and digital service plans with multilingual routing, WhatsApp checkout, and admin tooling.

## Development

Run the app locally:

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm lint
pnpm build
```

## Environment

SEO metadata, sitemap entries, Open Graph URLs, and robots metadata always use the canonical production origin:

```text
https://www.ottsubscriptionnepal.shop
```

`NEXT_PUBLIC_SITE_URL` is still used for authentication callback redirects. Set it to the URL of the environment you are running; for production:

```bash
NEXT_PUBLIC_SITE_URL=https://www.ottsubscriptionnepal.shop
```

Use `http://localhost:3000` during local development, and do not leave it as `localhost` in production.
