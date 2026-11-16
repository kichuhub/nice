# Potluck Bazaar

A Next.js App Router storefront concept for Potluck Bazaar. The supplied brief referenced original HTML but did not include its source, so product names, category labels, and promotional copy in this build are representative content based on the brief.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

## Deploy to Vercel

Import this project directory into Vercel, keep the detected Next.js framework preset, and deploy. Vercel runs the production build automatically. No environment variables are required for the demo storefront.

## Demo behavior

- Bag contents and light/dark preference are saved in browser localStorage.
- Sign-in validates the entered email/mobile and password fields, then shows a clearly labeled demo success message. It does not create a real account or send credentials anywhere.
- Product catalog and category content live in `data/store.js`.
- Main storefront and interactions are in `app/page.js`; global tokens are in `app/globals.css` and responsive component styles are in `app/page.module.css`.

Bricolage Grotesque and Figtree are self-hosted at build time with `next/font`, so visitors do not need to request font stylesheets from Google. Production CSS is inlined to remove render-blocking stylesheet requests. GSAP is loaded on demand after the initial page render.
