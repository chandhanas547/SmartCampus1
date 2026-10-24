import { useEffect, useState } from 'react';
import { apiRequest } from './api.js';

export function useResource(path) {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, data: null, error: '' });
    apiRequest(path, { signal: controller.signal, envelope: true })
      .then((data) => {
        if (!controller.signal.aborted) setState({ loading: false, data, error: '' });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ loading: false, data: null, error: error.message });
      });
    return () => controller.abort();
  }, [path, revision]);
  function refresh() {
    setState({ loading: true, data: null, error: '' });
    setRevision((value) => value + 1);
  }
  return { ...state, refresh };
}

export function useMutation(refresh) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function run(action, success = 'Saved.') {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await action();
      setMessage(success);
      refresh();
    } catch (error) {
      setMessage(error.message);
      // Reload before another action when the mutation's outcome is uncertain or stale.
      if (!error.status || error.status === 409 || error.status >= 500) refresh();
    } finally {
      setBusy(false);
    }
  }
  return { busy, message, run };
}

const STATUS_ICONS = {
  AVAILABLE: '●',
  ISSUED: '↗',
  RESERVED: '◐',
  MAINTENANCE: '⚙',
  OVERDUE: '▲',
  PENDING: '○',
  APPROVED: '✓',
  REJECTED: '✕',
  CANCELLED: '—',
  ARCHIVED: '—',
  RETURNED: '●',
};

export function LoadState({ resource }) {
  return resource.loading ? (
    <p role="status" className="page-message">
      Updating laboratory register…
    </p>
  ) : (
    <div className="empty-state">
      <h2>Unable to load records</h2>
      <p role="alert">{resource.error || 'The laboratory service did not respond.'}</p>
      <button type="button" onClick={resource.refresh}>
        Retry operation
      </button>
    </div>
  );
}
export function Status({ value }) {
  const symbol = STATUS_ICONS[value] || '·';
  const label = value.replaceAll('_', ' ');
  return (
    <span className={`badge badge-${value.toLowerCase()}`}>
      <span aria-hidden="true">{symbol}</span>
      <span>{label}</span>
    </span>
  );
}
export function Pagination({ pagination, onPage }) {
  const pages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        disabled={pagination.page <= 1}
        onClick={() => onPage(pagination.page - 1)}
      >
        ← Previous
      </button>
      <span>
        Page {pagination.page} of {pages} · {pagination.total} records
      </span>
      <button
        type="button"
        disabled={pagination.page >= pages}
        onClick={() => onPage(pagination.page + 1)}
      >
        Next →
      </button>
    </nav>
  );
}
export function ist(value) {
  return value
    ? new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value)) + ' IST'
    : '—';
}
export function localInput(value) {
  return new Date(new Date(value).getTime() + 330 * 60000).toISOString().slice(0, 16);
}
export function utcInput(value) {
  return new Date(`${value}${value.length === 16 ? ':00' : ''}+05:30`).toISOString();
}
export function values(event) {
  event.preventDefault();
  return Object.fromEntries(new FormData(event.currentTarget));
}
