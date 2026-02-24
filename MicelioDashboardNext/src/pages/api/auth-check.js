export const config = {
  runtime: 'experimental-edge',
};

export default async function handler(req) {
  try {
    // ✅ ✅ ✅ ADD THESE TWO LOGS RIGHT HERE
    console.log("🔹 EDGE COOKIE HEADER:", req.headers.get("cookie"));
    console.log("🔹 EDGE AUTH HEADER:", req.headers.get("authorization"));

    let token = null;

    // ✅ 1. Read from Authorization header (if frontend sends it)
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // ✅ 2. Read from COOKIE (Edge-safe, fully reliable)
    if (!token) {
      const cookieHeader = req.headers.get('cookie');

      if (cookieHeader) {
        const match = cookieHeader.match(/miceliotoken=([^;]+)/);
        if (match) token = match[1];
      }
    }

    // ✅ 3. HARD STOP if still missing
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing token in Edge' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log("✅ TOKEN SENT TO BACKEND:", token.slice(0, 25), "...");

    // ✅ 4. Send token to backend EXACTLY as your backend expects
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // ✅ REQUIRED
        },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: 'Backend rejected token', backend: err }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
