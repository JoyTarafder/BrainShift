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

    if (internalRes.ok) {
      const data = await internalRes.json();
      if (data && (data.success !== false || data.status === 'ok')) {
        return data;
      }
    }
  } catch (internalErr) {
    // Proceed to Express backend check
  }

  // 2. Try Express backend server if internal route wasn't matched
  try {
    const targetUrl = `${API_URL}${cleanEndpoint}`;
    const response = await fetch(targetUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (response.ok) {
      return await response.json();
    }

    const data = await response.json().catch(() => null);
    if (data && data.message !== 'API Endpoint Not Found' && response.status !== 404) {
      return data;
    }
  } catch (error) {
    console.warn(`Express API connection warning (${cleanEndpoint}):`, error);
  }

  // 3. Fallback: Re-attempt internal Next.js API route parsing error response
  try {
    const fallbackResponse = await fetch(`/api${cleanEndpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    return await fallbackResponse.json();
  } catch (fallbackError) {
    console.error('Fallback API also failed:', fallbackError);
    throw new Error('Unable to connect to server. Please check your network connection.');
  }
}
