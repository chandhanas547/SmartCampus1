import { createElement, useEffect, useState } from 'react';
import { Catalog, EquipmentDetail } from './Inventory.jsx';
import { Requests, RequestDetail } from './Requests.jsx';
import { LoadState, useResource } from './ui.jsx';

function Dashboard() {
  const resource = useResource('/dashboard');
  if (!resource.data) return createElement(LoadState, { resource });
  const data = resource.data.data;
  const metrics = [
    { label: 'Pending approval', count: data.pending, link: '#requests?status=PENDING', note: 'Awaiting decision' },
    { label: 'Active loans', count: data.issued, link: '#requests?status=ISSUED', note: 'In circulation' },
    { label: 'Overdue loans', count: data.overdue, link: '#requests?overdue=true', note: 'Requires recall', urgent: data.overdue > 0 },
    { label: 'Damage reports', count: data.unreviewedDamage, link: '#requests?damage=true', note: 'Awaiting inspection', urgent: data.unreviewedDamage > 0 },
  ];
  const stateMeta = [
    { key: 'AVAILABLE', symbol: '●', label: 'Available' },
    { key: 'ISSUED', symbol: '↗', label: 'Issued' },
    { key: 'RESERVED', symbol: '◐', label: 'Reserved' },
    { key: 'MAINTENANCE', symbol: '⚙', label: 'Maintenance' },
    { key: 'ARCHIVED', symbol: '—', label: 'Archived' },
  ];

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">LABORATORY OPERATIONS</p>
          <h1>Circulation summary</h1>
          <p className="lede">Live inventory distribution, open reservations, and returns requiring physical inspection.</p>
        </div>
        <button type="button" onClick={resource.refresh}>
          ↻ Refresh register
        </button>
      </div>

      <div className="stats-grid">
        {metrics.map(({ label, count, link, note, urgent }) => (
          <a
            href={link}
            className={`stat ${urgent ? 'stat-urgent' : ''}`}
            key={label}
          >
            <span>{label}</span>
            <strong style={urgent ? { color: 'var(--status-overdue-text)' } : undefined}>
              {count}
            </strong>
            <span>{note} →</span>
          </a>
        ))}
      </div>

      <section className="panel">
        <h2>Physical assets by operational state</h2>
        <div className="state-counts">
          {stateMeta.map(({ key, symbol, label }) => (
            <div key={key}>
              <span>
                <span aria-hidden="true" style={{ marginRight: '4px' }}>{symbol}</span>
                {label}
              </span>
              <strong>{data.equipment[key] || 0}</strong>
            </div>
          ))}
        </div>
        <a href="#catalog" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
          Manage equipment catalog →
        </a>
      </section>
    </>
  );
}

export default function Workspace({ user, onSignOut }) {
  const initial = () =>
    window.location.hash.slice(1) || (user.role === 'ADMIN' ? 'dashboard' : 'catalog');
  const [route, setRoute] = useState(initial);
  useEffect(() => {
    function update() {
      setRoute(initial());
    }
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [user.role]);
  const [address, search = ''] = route.split('?');
  const [page, id] = address.split('/');
  const admin = user.role === 'ADMIN';
  return (
    <>
      <div className="workspace-bar">
        <nav aria-label="Main navigation">
          {admin && (
            <a href="#dashboard" aria-current={page === 'dashboard' ? 'page' : undefined}>
              Overview
            </a>
          )}
          <a
            href="#catalog"
            aria-current={['catalog', 'equipment'].includes(page) ? 'page' : undefined}
          >
            Equipment
          </a>
          <a
            href="#requests"
            aria-current={['requests', 'request'].includes(page) ? 'page' : undefined}
          >
            {admin ? 'Requests' : 'My requests'}
          </a>
        </nav>
        <div>
          <span className="preview-label" style={{ textTransform: 'none' }}>
            {user.name} · {admin ? 'Staff Administrator' : 'Student'}
          </span>
          <button type="button" className="text-button" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
      {page === 'dashboard' && admin ? (
        createElement(Dashboard)
      ) : page === 'catalog' ? (
        createElement(Catalog, { user })
      ) : page === 'equipment' && id ? (
        createElement(EquipmentDetail, { key: id, user, id })
      ) : page === 'requests' ? (
        createElement(Requests, { key: search, user, search })
      ) : page === 'request' && id ? (
        createElement(RequestDetail, { key: id, user, id })
      ) : (
        <section className="empty-state">
          <h2>Location not registered</h2>
          <p>This laboratory record does not exist or requires different clearance permissions.</p>
          <a href="#catalog" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
            Return to equipment catalog →
          </a>
        </section>
      )}
    </>
  );
}
