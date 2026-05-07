let _token: string | null = null;
let _expiresAt: number | null = null; // Unix timestamp in seconds

export const tokenStore = {
  set(token: string, expiresAt: number) {
    _token = token;
    _expiresAt = expiresAt;
  },

  // Returns the token if it's still valid (with a 30-second buffer before expiry)
  get(): string | null {
    if (!_token || !_expiresAt) return null;
    if (Date.now() / 1000 >= _expiresAt - 30) return null;
    return _token;
  },

  clear() {
    _token = null;
    _expiresAt = null;
  },
};
