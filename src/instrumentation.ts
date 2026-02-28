/**
 * Next.js Instrumentation Hook
 * Runs once at server startup BEFORE any routes are handled.
 *
 * Purpose: Override Node.js DNS servers early so that every subsequent
 * DNS query (including the MongoDB Atlas SRV lookup) uses Google/Cloudflare
 * instead of the OS stub resolver, which refuses SRV queries on some Windows
 * configurations (ECONNREFUSED on querySrv).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("dns");
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  }
}
