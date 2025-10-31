export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { REGIONAL_FROM_PLATFORM, normalizePlatform, type Platform } from '@/lib/regions';
import { riotFetch } from '@/lib/fetcher';

type Body = {
  platform: Platform | string;
  playerA: string; // Riot ID "Name#TAG" or classic Summoner Name
  playerB: string; // same format
};

type Account = { puuid: string };
type Summoner = { puuid: string };

async function getPuuid(id: string, platform: Platform, regional: string): Promise<string> {
  if (id.includes('#')) {
    const [gameName, tagLine] = id.split('#');
    const acc: Account = await riotFetch(`https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
    return acc.puuid;
  } else {
    const sum: Summoner = await riotFetch(`https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(id)}`);
    return sum.puuid;
  }
}

export async function POST(req: Request) {
  try {
    const { platform: rawPlatform, playerA, playerB } = (await req.json()) as Body;
    const platform = normalizePlatform(String(rawPlatform));
    const regional = REGIONAL_FROM_PLATFORM[platform];

    const [puuidA, puuidB] = await Promise.all([
      getPuuid(playerA, platform, regional),
      getPuuid(playerB, platform, regional),
    ]);

    // Search recent matches of A in pages of 50 until we find a match containing B
    let start = 0;
    const page = 50;

    for (let tries = 0; tries < 4; tries++) {
      const ids: string[] = await riotFetch(`https://${regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuidA}/ids?start=${start}&count=${page}`);
      if (!ids.length) break;
      for (const id of ids) {
        const match = await riotFetch(`https://${regional}.api.riotgames.com/lol/match/v5/matches/${id}`);
        const participants: string[] = match?.metadata?.participants || [];
        if (participants.includes(puuidA) && participants.includes(puuidB)) {
          const info = match.info;
          return NextResponse.json({ ok: true, matchId: id, info });
        }
      }
      start += page;
    }

    return NextResponse.json({ ok: false, error: 'No recent shared match found.' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
