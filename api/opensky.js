export const config = { runtime: 'edge' };

// Fetch with timeout
async function fetchWithTimeout(url, options, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// Get Basic Auth header if credentials available
function getAuthHeader() {
  const username = process.env.OPENSKY_USERNAME;
  const password = process.env.OPENSKY_PASSWORD;
  if (!username || !password) return null;
  return 'Basic ' + btoa(`${username}:${password}`);
}

export default async function handler(req) {
  const url = new URL(req.url);

  // Build OpenSky API URL with bounding box params
  const params = new URLSearchParams();
  const lamin = url.searchParams.get('lamin');
  const lomin = url.searchParams.get('lomin');
  const lamax = url.searchParams.get('lamax');
  const lomax = url.searchParams.get('lomax');

  if (lamin) params.set('lamin', lamin);
  if (lomin) params.set('lomin', lomin);
  if (lamax) params.set('lamax', lamax);
  if (lomax) params.set('lomax', lomax);

  const openskyUrl = `https://opensky-network.org/api/states/all${params.toString() ? '?' + params.toString() : ''}`;

  try {
    // Use Basic Auth (sync) instead of OAuth (slow async token fetch)
    const authHeader = getAuthHeader();

    const response = await fetchWithTimeout(openskyUrl, {
      headers: {
        'Accept': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    }, 10000); // 10s timeout

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limited', time: Date.now(), states: null }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=10',
      },
    });
  } catch (error) {
    const isTimeout = error.name === 'AbortError';
    return new Response(JSON.stringify({
      error: isTimeout ? 'Request timeout' : 'Failed to fetch data',
      time: Date.now(),
      states: null
    }), {
      status: isTimeout ? 504 : 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
