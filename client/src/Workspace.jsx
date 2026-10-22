import { createElement, useEffect, useState } from 'react';
import { Catalog, EquipmentDetail } from './Inventory.jsx';
import { Requests, RequestDetail } from './Requests.jsx';
import { LoadState, useResource } from './ui.jsx';

function Dashboard() {
  const resource = useResource('/dashboard');
  if (!resource.data) return createElement(LoadState, { resource });
  const data = resource.data.data;
  const counts = [['Pending requests', data.pending, '#requests?status=PENDING'], ['Issued equipment', data.issued, '#requests?status=ISSUED'], ['Overdue loans', data.overdue, '#requests?overdue=true'], ['Unreviewed damage', data.unreviewedDamage, '#requests?damage=true']];
  return <><div className="page-heading"><div><p className="eyebrow">LAB OPERATIONS</p><h1>Lab dashboard</h1><p className="lede">Current equipment, loans and requests that need attention.</p></div><button type="button" onClick={resource.refresh}>Refresh dashboard</button></div><div className="stats-grid">{counts.map(([label, count, link]) => <a href={link} className="stat" key={label}><span>{label}</span><strong>{count}</strong><span>View requests ↗</span></a>)}</div><section className="panel"><h2>Equipment by state</h2><div className="state-counts">{['AVAILABLE', 'RESERVED', 'ISSUED', 'MAINTENANCE', 'ARCHIVED'].map((status) => <div key={status}><span>{status}</span><strong>{data.equipment[status] || 0}</strong></div>)}</div><a href="#catalog">Manage inventory ↗</a></section></>;
}

export default function Workspace({ user, onSignOut }) {
  const initial = () => window.location.hash.slice(1) || (user.role === 'ADMIN' ? 'dashboard' : 'catalog');
  const [route, setRoute] = useState(initial);
  useEffect(() => {
    function update() { setRoute(initial()); }
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [user.role]);
  const [address, search = ''] = route.split('?');
  const [page, id] = address.split('/');
  const admin = user.role === 'ADMIN';
  return <>
    <div className="workspace-bar"><nav aria-label="Main navigation">{admin && <a href="#dashboard" aria-current={page === 'dashboard' ? 'page' : undefined}>Overview</a>}<a href="#catalog" aria-current={['catalog', 'equipment'].includes(page) ? 'page' : undefined}>Equipment</a><a href="#requests" aria-current={['requests', 'request'].includes(page) ? 'page' : undefined}>{admin ? 'Requests' : 'My requests'}</a></nav><div><span>{user.name} · {admin ? 'Administrator' : 'Student'}</span><button type="button" className="text-button" onClick={onSignOut}>Sign out</button></div></div>
    {page === 'dashboard' && admin ? createElement(Dashboard) : page === 'catalog' ? createElement(Catalog, { user }) : page === 'equipment' && id ? createElement(EquipmentDetail, { key: id, user, id }) : page === 'requests' ? createElement(Requests, { key: search, user, search }) : page === 'request' && id ? createElement(RequestDetail, { key: id, user, id }) : <section className="empty-state"><h1>Page unavailable</h1><p>This page does not exist or is not available for your role.</p><a href="#catalog">Go to equipment</a></section>}
  </>;
}
