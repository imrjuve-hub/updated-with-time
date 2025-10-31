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

## Troubleshooting
- **404 on routes**: ensure your repo root contains `package.json` and the `src` folder. In Vercel, set Root Directory to that folder if needed.
- **Node version error**: this project declares `"engines": { "node": ">=18.18.0" }`. In Vercel, Project Settings -> Node.js Version should be 18 or 20.
- **Key not picked up**: visit `/api/health` on your deployed site. It should return `riotKeyPresent: true` if the key is configured.
