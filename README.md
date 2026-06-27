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

The app uses `NEXT_PUBLIC_SITE_URL` for canonical URLs, sitemap entries, Open Graph URLs, and robots metadata.

Set it to your public origin in every deployed environment:

```bash
NEXT_PUBLIC_SITE_URL=https://www.ottsubscriptionnepal.com
```

Do not leave it as `localhost` in production. CI and Vercel production builds are guarded against that.
