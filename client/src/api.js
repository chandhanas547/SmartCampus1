export async function apiRequest(path, { signal, headers, ...options } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
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
    const error = new Error('The request could not be completed. Please try again.');
    error.status = response.status;
    error.code = payload.error?.code;
    throw error;
  }
  if (!payload || typeof payload !== 'object' || !Object.hasOwn(payload, 'data')) {
    throw new Error('Unexpected response. Please try again.');
  }
  return payload.data;
}
