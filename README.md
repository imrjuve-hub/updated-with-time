# LoL Duo Match Finder

Find the latest League match where two players were on the same team and render a visual scoreboard. Built with Next.js 14 and Tailwind.

## Local Dev
1. Install Node 18 or later.
2. Run `npm i` or `pnpm i`.
3. Copy `.env.local.example` to `.env.local` and paste your `RIOT_API_KEY` from developer.riotgames.com.
4. `npm run dev` or `pnpm dev` then open http://localhost:3000

## Deploy on Vercel
1. Create a free Vercel account at https://vercel.com
2. Create a new project and import this repository.
3. In Project Settings -> Environment Variables add `RIOT_API_KEY` with your key.
4. Deploy. The app will be live on your Vercel domain.
