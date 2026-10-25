export async function apiRequest(path, { signal, headers, envelope = false, ...options } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-LabFlow-Request': '1', ...headers },
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Could not connect. Check your connection and try again.', { cause: error });
  }
  if (response.status === 204) return undefined;
  if (response.status >= 500) throw new Error('Service temporarily unavailable. Please try again.');
  let payload;
  try { payload = await response.json(); }
  catch { throw new Error('Unexpected response. Please try again.'); }
  if (!response.ok) {
    const messages = { 400: 'Check the form values and try again.', 401: 'Please check your sign-in details or sign in again.', 403: 'This action is not allowed.', 404: 'This item could not be found.', 409: 'This record already exists or has changed. Refresh and try again.', 429: 'Too many attempts. Please try again later.' };
    const error = new Error(messages[response.status] || 'The request could not be completed. Please try again.');
    error.status = response.status;
    error.code = payload?.error?.code;
    throw error;
  }
  if (!payload || typeof payload !== 'object' || !Object.hasOwn(payload, 'data')) {
    throw new Error('Unexpected response. Please try again.');
  }
  return envelope ? payload : payload.data;
}
