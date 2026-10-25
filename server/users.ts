const users = [
  {
    id: 1,
    name: 'Aoi Tanaka',
    role: 'Product designer',
    color: '#c5ddcf',
    initials: 'AT',
    bio: '使う人の毎日が、少し心地よくなるデザインを。',
  },
  {
    id: 2,
    name: 'Ren Suzuki',
    role: 'Frontend engineer',
    color: '#d9d0ed',
    initials: 'RS',
    bio: '小さなインタラクションから、楽しい体験をつくる。',
  },
  {
    id: 3,
    name: 'Mei Sato',
    role: 'Creative developer',
    color: '#f0d2b6',
    initials: 'MS',
    bio: 'デザインとコードのあいだで、新しい表現を探す。',
  },
];

export async function handleUsersRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/users\/(\d+)$/);
  if (!match) return Response.json({ error: 'Not found' }, { status: 404 });
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return Response.json(
      { error: 'Method not allowed' },
      {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      },
    );
  }
  const user = users.find((user) => user.id === Number(match[1]));
  const rawDelay = Number(url.searchParams.get('delay'));
  const delay = Number.isFinite(rawDelay)
    ? Math.min(5000, Math.max(0, rawDelay))
    : 0;
  await new Promise((resolve) => setTimeout(resolve, delay));
  const response = Response.json(user ?? { error: 'User not found' }, {
    status: user ? 200 : 404,
    headers: { 'Cache-Control': 'no-store' },
  });
  return request.method === 'HEAD'
    ? new Response(null, { status: response.status, headers: response.headers })
    : response;
}
