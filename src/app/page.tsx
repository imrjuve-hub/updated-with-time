
'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { Platform } from '@/lib/regions';

// ---------- Helpers ----------
async function postJSON<T>(url: string, data: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function useDDragon() {
  const [version, setVersion] = useState<string>('');
  const [champKeyMap, setChampKeyMap] = useState<Record<string, string>>({}); // key -> champion name
  const [spellKeyMap, setSpellKeyMap] = useState<Record<string, string>>({}); // numeric key -> spell id

  useEffect(() => {
    (async () => {
      try {
        const versions: string[] = await (await fetch('https://ddragon.leagueoflegends.com/api/versions.json')).json();
        const v = versions[0];
        setVersion(v);

        const champ = await (await fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/en_US/champion.json`)).json();
        const cMap: Record<string, string> = {};
        Object.values<any>(champ.data).forEach((c) => { cMap[c.key] = c.id; });
        setChampKeyMap(cMap);

        const sums = await (await fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/en_US/summoner.json`)).json();
        const sMap: Record<string, string> = {};
        Object.values<any>(sums.data).forEach((s: any) => { sMap[s.key] = s.id; });
        setSpellKeyMap(sMap);
      } catch {}
    })();
  }, []);

  return { version, champKeyMap, spellKeyMap };
}

interface Participant {
  puuid: string;
  summonerName?: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  teamId: number;
  championId: number;
  kills: number; deaths: number; assists: number;
  totalMinionsKilled: number; neutralMinionsKilled: number;
  goldEarned: number; totalDamageDealtToChampions: number; visionScore: number;
  summoner1Id: number; summoner2Id: number;
  item0: number; item1: number; item2: number; item3: number; item4: number; item5: number; item6: number;
  win: boolean;
  teamPosition?: string;
}

interface MatchInfo {
  participants: Participant[];
  gameCreation: number;
  gameDuration: number;
  queueId: number;
  gameStartTimestamp?: number;
  gameEndTimestamp?: number;
}

const PLATFORMS: Platform[] = ['NA1','EUW1','EUN1','KR','JP1','BR1','LA1','LA2','OC1','TR1','RU','PH2','SG2','TH2','TW2','VN2'];

// Display helpers (top-level, not nested inside another function)
function displayName(p: Participant) {
  if (p.riotIdGameName && p.riotIdTagline) return `${p.riotIdGameName}#${p.riotIdTagline}`;
  if (p.summonerName) return p.summonerName;
  if (p.riotIdGameName) return p.riotIdGameName;
  return (p.puuid || '').slice(0, 12) || 'Unknown';
}

function normalizeName(s?: string) {
  return (s || '').trim().toLowerCase();
}

function baseName(riotId?: string) {
  if (!riotId) return '';
  const i = riotId.indexOf('#');
  return i >= 0 ? riotId.slice(0, i) : riotId;
}

function formatDT(ms?: number) {
  if (!ms) return 'Unknown';
  try { return new Date(ms).toLocaleString(); } catch { return String(ms); }
}

// ---------- Page ----------
export default function Page() {
  const { version, champKeyMap, spellKeyMap } = useDDragon();
  const [platform, setPlatform] = useState<Platform>('EUW1');
  const [playerA, setPlayerA] = useState('');
  const [playerB, setPlayerB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<MatchInfo | null>(null);
  const [matchId, setMatchId] = useState<string>('');

  async function findMatch() {
    setLoading(true); setError(null); setInfo(null);
    try {
      const res = await postJSON<{ ok: boolean; info: MatchInfo; matchId: string }>(`/api/find-match`, { platform, playerA, playerB });
      setInfo(res.info);
      setMatchId(res.matchId);
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally { setLoading(false); }
  }

  const teams = useMemo(() => {
    if (!info) return null;
    const blue = info.participants.filter(p => p.teamId === 100);
    const red  = info.participants.filter(p => p.teamId === 200);
    return { blue, red };
  }, [info]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="hero">LoL Duo Match Finder</h1>
        <p className="hint">Enter two Riot IDs like <b>GameName#TAG</b>. Classic Summoner Names also work.</p>
      </header>

      <section className="card p-6 space-y-4">
        <div className="gridish">
          <div>
            <label className="hint">Platform</label>
            <select className="select mt-1" value={platform} onChange={e => setPlatform(e.target.value as Platform)}>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="hint">Player A</label>
            <input className="input mt-1" placeholder="GameName#TAG or Summoner Name" value={playerA} onChange={e => setPlayerA(e.target.value)} />
          </div>
          <div>
            <label className="hint">Player B</label>
            <input className="input mt-1" placeholder="GameName#TAG or Summoner Name" value={playerB} onChange={e => setPlayerB(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn" onClick={findMatch} disabled={loading || !playerA || !playerB}>Find latest shared match</button>
          {loading && <span className="hint">Working...</span>}
          {error && <span className="hint text-red-400">{error}</span>}
        </div>
      </section>

      {info && teams && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Match {matchId}</h2>
            <p className="hint">Duration {Math.round(info.gameDuration/60)} min</p>
          </div>
          <div className="hint">
            <span>Start: {formatDT(info.gameStartTimestamp || info.gameCreation)}</span>
            {"  |  "}
            <span>End: {formatDT(info.gameEndTimestamp || (info.gameCreation + info.gameDuration * 1000))}</span>
          </div>
          <TeamTable teamName="Blue team" participants={teams.blue} version={version} champKeyMap={champKeyMap} spellKeyMap={spellKeyMap} playerA={playerA} playerB={playerB} />
          <TeamTable teamName="Red team" participants={teams.red}  version={version} champKeyMap={champKeyMap} spellKeyMap={spellKeyMap} playerA={playerA} playerB={playerB} />
        </section>
      )}
    </main>
  );
}

// ---------- Subcomponents ----------
function TeamTable({ teamName, participants, version, champKeyMap, spellKeyMap, playerA, playerB }:{
  teamName: string;
  participants: Participant[];
  version: string;
  champKeyMap: Record<string,string>;
  spellKeyMap: Record<string,string>;
  playerA: string; playerB: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{teamName}</h3>
        <span className="badge">{participants[0]?.win ? 'Win' : 'Loss'}</span>
      </div>
      <table className="table">
        <thead>
          <tr className="border-b border-neutral-800">
            <th className="th">Player</th>
            <th className="th">Champion</th>
            <th className="th">Spells</th>
            <th className="th">KDA</th>
            <th className="th">CS</th>
            <th className="th">Gold</th>
            <th className="th">Damage</th>
            <th className="th">Vision</th>
            <th className="th">Items</th>
          </tr>
        </thead>
        <tbody>
          {participants.map(p => (
            <tr key={p.puuid} className="border-b border-neutral-900">
              <td className="td pr-2">
                <span className={`px-2 py-1 rounded-lg ${highlight(p, playerA, playerB) ? 'bg-blue-600/20 text-blue-200' : 'bg-neutral-800/60 text-neutral-200'}`}>{displayName(p)}</span>
              </td>
              <td className="td">
                <ChampionCell championId={p.championId} version={version} champKeyMap={champKeyMap} />
              </td>
              <td className="td">
                <SpellCell s1={p.summoner1Id} s2={p.summoner2Id} version={version} spellKeyMap={spellKeyMap} />
              </td>
              <td className="td">{p.kills}/{p.deaths}/{p.assists}</td>
              <td className="td">{p.totalMinionsKilled + p.neutralMinionsKilled}</td>
              <td className="td">{p.goldEarned.toLocaleString()}</td>
              <td className="td">{p.totalDamageDealtToChampions.toLocaleString()}</td>
              <td className="td">{p.visionScore}</td>
              <td className="td">
                <div className="flex gap-1">
                  {[p.item0,p.item1,p.item2,p.item3,p.item4,p.item5,p.item6].filter(Boolean).map((id: number) => (
                    <Image key={id} alt="item" src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`} width={24} height={24} className="rounded" />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChampionCell({ championId, version, champKeyMap }:{ championId: number; version: string; champKeyMap: Record<string,string>; }) {
  const name = champKeyMap[String(championId)];
  if (!name || !version) return <span className="hint">{championId}</span>;
  return (
    <div className="flex items-center gap-2">
      <Image alt={name} src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${name}.png`} width={28} height={28} className="rounded" />
      <span>{name}</span>
    </div>
  );
}

function SpellCell({ s1, s2, version, spellKeyMap }:{ s1: number; s2: number; version: string; spellKeyMap: Record<string,string>; }) {
  const a = spellKeyMap[String(s1)];
  const b = spellKeyMap[String(s2)];
  if (!a || !b || !version) return <span className="hint">{s1}, {s2}</span>;
  return (
    <div className="flex items-center gap-1">
      <Image alt={a} src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${a}.png`} width={24} height={24} />
      <Image alt={b} src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${b}.png`} width={24} height={24} />
    </div>
  );
}

function highlight(p: Participant, a: string, b: string) {
  const disp = normalizeName(displayName(p));
  const sum = normalizeName(p?.summonerName);
  const aFull = normalizeName(a);
  const bFull = normalizeName(b);
  const aBase = normalizeName(baseName(a));
  const bBase = normalizeName(baseName(b));
  return disp === aFull || disp === bFull || sum === aBase || sum === bBase;
}
