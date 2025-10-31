export async function riotFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...(init || {}),
    headers: {
      'X-Riot-Token': process.env.RIOT_API_KEY as string,
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Riot API error ${res.status}: ${text}`);
  }
  return res.json();
}
