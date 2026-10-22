import { createElement, useState } from 'react';
import { apiRequest } from './api.js';
import { LoadState, Pagination, Status, localInput, utcInput, useMutation, useResource, values } from './ui.jsx';

function EquipmentFields({ equipment, create = false }) {
  return <>
    {create && <label>Asset tag<input name="assetTag" required minLength="2" maxLength="40" pattern={String.raw`[A-Za-z0-9][A-Za-z0-9._\-]{1,39}`} placeholder="LAB-001" /></label>}
    <label>Equipment name<input name="name" required minLength="2" maxLength="120" defaultValue={equipment?.name} /></label>
    <div className="form-grid"><label>Category<input name="category" required minLength="2" maxLength="80" defaultValue={equipment?.category} /></label><label>Location<input name="location" required minLength="2" maxLength="120" defaultValue={equipment?.location} /></label></div>
    <label>Description<textarea name="description" maxLength="2000" defaultValue={equipment?.description} /></label>
    <label>Condition note<textarea name="conditionNote" maxLength="2000" defaultValue={equipment?.conditionNote} /></label>
  </>;
}

export function Catalog({ user }) {
  const [filters, setFilters] = useState({ search: '', status: '', category: '', page: 1 });
  const [adding, setAdding] = useState(false);
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== ''));
  const resource = useResource(`/equipment?${query}`);
  const mutation = useMutation(resource.refresh);
  const admin = user.role === 'ADMIN';
  async function create(event) {
    const input = values(event);
    await mutation.run(async () => {
      const row = await apiRequest('/equipment', { method: 'POST', body: JSON.stringify(input) });
      setAdding(false); window.location.hash = `equipment/${row.id}`;
    }, 'Equipment added.');
  }
  return <>
    <div className="page-heading"><div><p className="eyebrow">{admin ? 'LAB INVENTORY' : 'LAB EQUIPMENT'}</p><h1>Equipment catalog</h1><p className="lede">Check availability and choose equipment for your work.</p></div>{admin && <button type="button" onClick={() => setAdding(!adding)}>{adding ? 'Close form' : 'Add equipment'}</button>}</div>
    {adding && <section className="panel" aria-labelledby="create-equipment-title"><h2 id="create-equipment-title">Add equipment</h2><form onSubmit={create} aria-busy={mutation.busy}>{createElement(EquipmentFields, { create: true })}<button disabled={mutation.busy}>Add equipment</button></form></section>}
    <p role="status" className="feedback">{mutation.message}</p>
    <form className="filters" onSubmit={(event) => setFilters({ ...values(event), page: 1 })}>
      <label>Search<input name="search" type="search" placeholder="Name, tag or category" maxLength="80" defaultValue={filters.search} /></label>
      <label>Category<input name="category" maxLength="80" placeholder="All categories" defaultValue={filters.category} /></label>
      <label>Availability<select name="status" defaultValue={filters.status}><option value="">All equipment</option>{['AVAILABLE', 'RESERVED', 'ISSUED', 'MAINTENANCE', ...(admin ? ['ARCHIVED'] : [])].map((state) => <option key={state}>{state}</option>)}</select></label>
      <button>Apply filters</button>
    </form>
    {!resource.data ? createElement(LoadState, { resource }) : <>
      {!resource.data.data.length ? <div className="empty-state"><h2>No equipment found</h2><p>Try another search or availability filter.{admin ? ' You can also add the first asset.' : ''}</p></div> : <div className="equipment-grid">{resource.data.data.map((row) => <article className="equipment-card" key={row.id}><div className="card-top"><span className="asset-tag">{row.assetTag}</span>{createElement(Status, { value: row.status })}</div><h2><a href={`#equipment/${row.id}`}>{row.name}</a></h2><p>{row.category}</p><div className="card-bottom"><span>{row.location}</span><a href={`#equipment/${row.id}`}>View equipment ↗</a></div></article>)}</div>}
      {createElement(Pagination, { pagination: resource.data.pagination, onPage: (page) => setFilters((value) => ({ ...value, page })) })}
    </>}
  </>;
}

export function EquipmentDetail({ user, id }) {
  const resource = useResource(`/equipment/${id}`);
  const mutation = useMutation(resource.refresh);
  const [editing, setEditing] = useState(false);
  const [requestKey] = useState(() => crypto.randomUUID());
  if (!resource.data) return createElement(LoadState, { resource });
  const row = resource.data.data;
  const admin = user.role === 'ADMIN';
  function change(event) {
    const input = values(event);
    mutation.run(() => apiRequest(`/equipment/${id}`, { method: 'PATCH', body: JSON.stringify({ ...input, version: row.version }) }));
  }
  function borrow(event) {
    const input = values(event);
    mutation.run(async () => {
      const request = await apiRequest('/requests', { method: 'POST', body: JSON.stringify({ equipmentId: id, requestKey, purpose: input.purpose, requestedDueAt: utcInput(input.requestedDueAt) }) });
      window.location.hash = `request/${request.id}`;
    }, 'Request submitted.');
  }
  return <>
    <a className="back-link" href="#catalog">← Equipment catalog</a>
    <div className="page-heading"><div><p className="eyebrow">{row.assetTag} · {row.category}</p><h1>{row.name}</h1><p className="lede">{row.location}</p></div>{createElement(Status, { value: row.status })}</div>
    <p role="status" className="feedback">{mutation.message}</p>
    <div className="detail-grid"><section className="panel"><h2>About this equipment</h2><p className="preserve-lines">{row.description || 'No description added.'}</p><h3>Condition</h3><p className="preserve-lines">{row.conditionNote || 'No condition notes recorded.'}</p></section>
      <section className="panel"><h2>{admin ? 'Manage equipment' : 'Borrow this equipment'}</h2>
        {!admin && (row.status === 'AVAILABLE' ? <form onSubmit={borrow} aria-busy={mutation.busy}><label>What will you use it for?<textarea name="purpose" required minLength="10" maxLength="500" /></label><label>Preferred return date and time (IST)<input name="requestedDueAt" type="datetime-local" required min={localInput(Date.now() + 60000)} /></label><p className="field-hint">Approval confirms the due date. The maximum loan is seven days from approval.</p><button disabled={mutation.busy}>Send borrowing request</button></form> : <p>This equipment is currently {row.status.toLowerCase()}. You can request it when it becomes available.</p>)}
        {admin && row.status !== 'ARCHIVED' && <>
          <button type="button" className="secondary-button" disabled={mutation.busy} onClick={() => setEditing(!editing)}>{editing ? 'Close editing' : 'Edit details'}</button>
          {editing && <form onSubmit={change} aria-busy={mutation.busy}><input type="hidden" name="action" value="EDIT_METADATA" />{createElement(EquipmentFields, { equipment: row })}<button disabled={mutation.busy}>Save details</button></form>}
          {['AVAILABLE', 'MAINTENANCE'].includes(row.status) && <form onSubmit={change} aria-busy={mutation.busy}><input type="hidden" name="action" value={row.status === 'MAINTENANCE' ? 'RESTORE' : 'ENTER_MAINTENANCE'} /><label>{row.status === 'MAINTENANCE' ? 'Restoration note' : 'Maintenance reason'}<textarea name="note" required maxLength="2000" /></label><button disabled={mutation.busy}>{row.status === 'MAINTENANCE' ? 'Restore to available' : 'Enter maintenance'}</button></form>}
          {['AVAILABLE', 'MAINTENANCE'].includes(row.status) && <button type="button" className="danger-button" disabled={mutation.busy} onClick={() => { if (window.confirm('Archive this equipment? It will be hidden from students and cannot be restored.')) mutation.run(async () => { await apiRequest(`/equipment/${id}`, { method: 'DELETE' }); window.location.hash = 'catalog'; }, 'Equipment archived.'); }}>Archive equipment</button>}
          <p className="field-hint">Open requests block manual maintenance and archive. Historical borrowing records are retained.</p>
        </>}
        {admin && row.status === 'ARCHIVED' && <p>Archived equipment is read-only. Its borrowing history is retained.</p>}
      </section></div>
  </>;
}
