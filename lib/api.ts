const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // 1. Try Next.js internal API route first for maximum reliability in App Router
  try {
    const internalRes = await fetch(`/api${cleanEndpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (internalRes.status !== 404) {
      const data = await internalRes.json().catch(() => null);
      if (data) {
        return data;
      }
    }
  } catch (internalErr) {
    // Proceed to Express backend check if network error
  }

  // 2. Try Express backend server if internal route wasn't matched (404)
  try {
    const targetUrl = `${API_URL}${cleanEndpoint}`;
    const response = await fetch(targetUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => null);
    if (data) return data;
  } catch (error) {
    console.warn(`Express API connection warning (${cleanEndpoint}):`, error);
  }

  throw new Error('Unable to connect to server. Please check your network connection.');
}
