const TOKEN_KEY = "apt_auth_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function encodeMockToken(userId: string) {
  return `mock.${btoa(userId)}`;
}

export function decodeMockToken(token: string | null): string | null {
  if (!token?.startsWith("mock.")) return null;
  try {
    return atob(token.slice(5));
  } catch {
    return null;
  }
}
