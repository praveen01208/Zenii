export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : `${window.location.origin}/api`;

export type ApiError = { error?: string };

export async function apiFetch<T>(
  path: string,
  options: RequestInit & {
    timeoutMs?: number;
    noReloadOnSuspend?: boolean;
    isFormData?: boolean;
    retries?: number;
    retryDelayMs?: number;
  } = {}
): Promise<T> {
  const {
    headers,
    timeoutMs = 35000,
    noReloadOnSuspend = false,
    isFormData = false,
    retries = 0,
    retryDelayMs = 800,
    ...rest
  } = options;

  let attempt = 0;
  while (true) {
    const controller = new AbortController();
    const t = window.setTimeout(
      () => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)),
      timeoutMs
    );

    const reqHeaders: HeadersInit = { ...headers };
    if (!isFormData) {
      (reqHeaders as any)['Content-Type'] = 'application/json';
    }

    // Attach Clerk authorization token if active in browser
    try {
      const clerk = (window as any).Clerk;
      if (clerk?.session) {
        const token = await clerk.session.getToken();
        if (token && !(reqHeaders as any)['Authorization']) {
          (reqHeaders as any)['Authorization'] = `Bearer ${token}`;
        }
        if (clerk.user) {
          if (clerk.user.primaryEmailAddress?.emailAddress) {
            (reqHeaders as any)['x-clerk-user-email'] = clerk.user.primaryEmailAddress.emailAddress;
          }
          if (clerk.user.fullName || clerk.user.firstName) {
            (reqHeaders as any)['x-clerk-user-name'] = clerk.user.fullName || clerk.user.firstName;
          }
        }
      }
    } catch {}

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...rest,
        credentials: 'include',
        signal: controller.signal,
        headers: reqHeaders,
      });

      window.clearTimeout(t);
      const text = await res.text();
      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        if (!res.ok) {
          throw new Error(`Server error (${res.status}) — unexpected non-JSON response`);
        }
      }

      if (!res.ok) {
        if (
          res.status === 403 &&
          json?.error?.includes('suspended') &&
          !noReloadOnSuspend
        ) {
          try {
            localStorage.removeItem('zm_authed');
            localStorage.removeItem('zm_admin');
            localStorage.removeItem('zm_therapist');
          } catch {}
          window.location.reload();
        }
        throw new Error((json && json.error) || `Request failed (${res.status})`);
      }

      return json as T;
    } catch (err: any) {
      window.clearTimeout(t);
      const isNetworkOrTimeout =
        err.name === 'AbortError' ||
        err.message?.includes('timed out') ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError');

      if (isNetworkOrTimeout && attempt < retries) {
        attempt++;
        await new Promise(r => setTimeout(r, retryDelayMs * Math.pow(2, attempt - 1)));
        continue;
      }
      throw err;
    }
  }
}
