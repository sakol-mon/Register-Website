This is a [Next.js](https://nextjs.org) application for LIBRARY AI LAB, prepared for deployment on a production server with Docker or Docker Compose.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Local Docker Workflow

If you want both the web app and Supabase to run on Docker on the same machine:

1. Start the local Supabase stack:

```bash
npm run supabase:start
```

2. Inspect the local endpoints and keys:

```bash
npm run supabase:status
```

3. Copy `.env.local.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the local anon key reported by `supabase status`

4. Start the web app in Docker:

```bash
npm run docker:dev
```

The browser will access the web app on `http://localhost:3000` and Supabase on `http://localhost:54321`.

## Environment Variables

The browser-side Supabase client requires these public environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

For local Docker deployment, copy `.env.production.example` to `.env.production` and fill in real values.

`NEXT_PUBLIC_SUPABASE_URL` must be a URL that the end user's browser can reach. Do not use `http://127.0.0.1:54321` or `http://localhost:54321` in production unless the browser is running on the same machine as the Supabase API.

If you self-host Supabase on the same server, publish it behind a real hostname or public IP, for example `https://supabase.example.com`, then use that URL in `NEXT_PUBLIC_SUPABASE_URL`.

## Production Deployment

Build and validate the application locally:

```bash
npm run build
```

Run the app directly with Docker Compose:

```bash
docker compose --env-file .env.production up --build -d
```

Run the app behind Nginx reverse proxy:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

Detailed deployment steps are in `DOCKER_DEPLOYMENT.md`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
