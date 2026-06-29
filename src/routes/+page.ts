// The home page is a static shell: it renders the prompt and talks to the
// /api/ask endpoint from the client, so it can be prerendered like the rest of
// the archive. Only /api/ask needs the Worker at runtime.
export const prerender = true;
