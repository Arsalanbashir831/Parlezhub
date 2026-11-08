/**
 * The origin the user's browser actually used, for building absolute URLs
 * (auth redirects, email links).
 *
 * In production the app runs as a standalone server bound to HOSTNAME=0.0.0.0
 * behind a TLS proxy, so `request.url` carries the container's bind address
 * (http://0.0.0.0:3000) — unreachable from any browser. The proxy's
 * `x-forwarded-host` is the public host, served over https. Local development
 * has no proxy, so the request's own origin is right there.
 */
export function publicOrigin(request: Request): string {
  if (process.env.NODE_ENV !== 'development') {
    const forwardedHost = request.headers.get('x-forwarded-host');
    if (forwardedHost) return `https://${forwardedHost.split(',')[0].trim()}`;
  }
  return new URL(request.url).origin;
}
