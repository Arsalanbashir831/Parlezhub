/**
 * The chat server's WebSocket base ("ws://host/ws/chat/") from its HTTP address
 * ("http://host"). Null when no usable address is given, so a caller never
 * dials "undefined/ws/chat/…", which the browser resolves against the Next app
 * itself and fails with an empty error.
 */
export function chatSocketBase(httpUrl: string | null | undefined): string | null {
  const raw = httpUrl?.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol === 'http:') url.protocol = 'ws:';
  else if (url.protocol === 'https:') url.protocol = 'wss:';
  else if (url.protocol !== 'ws:' && url.protocol !== 'wss:') return null;

  const path = url.pathname.replace(/\/+$/, '');
  return `${url.protocol}//${url.host}${path}/ws/chat/`;
}
