This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## GitHub Pages

This project is configured for static export and GitHub Pages deployment.

- Static output is generated into `out/` during `npm run build`.
- The GitHub Actions workflow at `.github/workflows/deploy-pages.yml` deploys the site automatically from the `main` branch.
- A ready-to-publish `docs/` folder is also included as a fallback for GitHub Pages branch-based publishing.
- The current configuration assumes the repository name is `Register-Website`, so the published site path is `/Register-Website/` on GitHub Pages.

If you rename the repository, update `repoName` in `next.config.ts`.

If GitHub Pages is showing the repository README instead of the website, the Pages source is pointing at the repository root instead of the built site.

- Preferred: set `Settings > Pages > Source` to `GitHub Actions`.
- Fallback: set `Settings > Pages > Source` to `Deploy from a branch`, branch `main`, folder `/docs`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
