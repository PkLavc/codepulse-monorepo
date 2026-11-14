// Cloudflare deployment retired. The supported backend is the local Node.js server.
// This compatibility stub never executes code, calls an AI service or accepts keys.
export default {
  async fetch() {
    return Response.json(
      { error: 'CodePulse hosted API is disabled. Run the local Node.js backend.' },
      { status: 410, headers: { 'Cache-Control': 'no-store' } }
    );
  }
};
