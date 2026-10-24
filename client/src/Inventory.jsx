import { createElement, useState } from 'react';
import { apiRequest } from './api.js';
import BorrowForm from './BorrowForm.jsx';
import ChoiceField from './ChoiceField.jsx';
import {
  LoadState,
  Pagination,
  Status,
  useMutation,
  useResource,
  values,
} from './ui.jsx';

function EquipmentFields({ equipment, create = false }) {
  return (
    <>
      {create && (
        <label>
          Asset tag
          <input
            name="assetTag"
            required
            minLength="2"
            maxLength="40"
            pattern={String.raw`[A-Za-z0-9][A-Za-z0-9._\-]{1,39}`}
            placeholder="LAB-001"
          />
        </label>
      )}
      <ChoiceField label="Equipment name" name="name" options={['Digital oscilloscope', 'Digital multimeter', 'Compound microscope', 'Arduino starter kit', 'Bench power supply', 'Vernier caliper', 'Signal generator', 'Soldering station']} defaultValue={equipment?.name} />
      <div className="form-grid">
        <ChoiceField label="Category" name="category" options={['Electronics', 'Optics', 'Prototyping', 'Measurement', 'Computing', 'Mechanical tools']} defaultValue={equipment?.category} maxLength={80} />
        <ChoiceField label="Location" name="location" options={['Main lab', 'Electronics bench 1', 'Electronics bench 2', 'Electronics cabinet', 'Optics bench', 'Project cabinet', 'Measurement cabinet']} defaultValue={equipment?.location} />
      </div>
      <label>
        Description
        <textarea name="description" maxLength="2000" defaultValue={equipment?.description} />
      </label>
      <label>
        Condition note
        <textarea name="conditionNote" maxLength="2000" defaultValue={equipment?.conditionNote} />
      </label>
    </>
  );
}

export function Catalog({ user }) {
  const [filters, setFilters] = useState({ search: '', status: '', category: '', page: 1 });
  const [adding, setAdding] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== ''));
  const resource = useResource(`/equipment?${query}`);
  const mutation = useMutation(resource.refresh);
  const admin = user.role === 'ADMIN';
  async function create(event) {
    const input = values(event);
    await mutation.run(async () => {
      const row = await apiRequest('/equipment', { method: 'POST', body: JSON.stringify(input) });
      setAdding(false);
      window.location.hash = `equipment/${row.id}`;
    }, 'Equipment added.');
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{admin ? 'LABORATORY INVENTORY' : 'LABORATORY INSTRUMENTS'}</p>
          <h1>Equipment catalog</h1>
          <p className="lede">Verify operational state, technical specifications, and laboratory storage locations.</p>
        </div>
        {!admin && (
          <button type="button" onClick={() => setRequesting(!requesting)}>
            {requesting ? 'Close request form' : '+ Request equipment'}
          </button>
        )}
        {admin && (
          <button type="button" onClick={() => setAdding(!adding)}>
            {adding ? 'Close registration' : '+ Register new asset'}
          </button>
        )}
      </div>
      {requesting && (
        <section className="panel" aria-labelledby="borrow-title">
          <h2 id="borrow-title">Request equipment loan</h2>
          <BorrowForm refresh={resource.refresh} />
        </section>
      )}
      {adding && (
        <section className="panel" aria-labelledby="create-equipment-title">
          <h2 id="create-equipment-title">Register laboratory asset</h2>
          <form onSubmit={create} aria-busy={mutation.busy}>
            {createElement(EquipmentFields, { create: true })}
            <button disabled={mutation.busy}>Record asset in inventory</button>
          </form>
        </section>
      )}
      <p role="status" className="feedback">
        {mutation.message}
      </p>
      <form className="filters" onSubmit={(event) => setFilters({ ...values(event), page: 1 })}>
        <label>
          Search register
          <input
            name="search"
            type="search"
            placeholder="Search by name, asset tag, or domain…"
            maxLength="80"
            defaultValue={filters.search}
          />
        </label>
        <ChoiceField
          label="Domain"
          name="category"
          options={['Electronics', 'Optics', 'Prototyping', 'Measurement', 'Computing', 'Mechanical tools']}
          defaultValue={filters.category}
          required={false}
          maxLength={80}
          emptyLabel="All domains"
        />
        <label>
          Operational state
          <select name="status" defaultValue={filters.status}>
            <option value="">All statuses</option>
            {['AVAILABLE', 'RESERVED', 'ISSUED', 'MAINTENANCE', ...(admin ? ['ARCHIVED'] : [])].map(
              (state) => (
                <option key={state}>{state}</option>
              ),
            )}
          </select>
        </label>
        <button>Apply filter</button>
      </form>
      {!resource.data ? (
        createElement(LoadState, { resource })
      ) : (
        <>
          {!resource.data.data.length ? (
            <div className="empty-state">
              <h2>No registered assets found</h2>
              <p>
                No laboratory items match the active query or filter criteria.
                {admin ? ' Use the button above to register the first physical asset.' : ' Try clearing search keywords or selecting All statuses.'}
              </p>
            </div>
          ) : (
            <div className="equipment-grid">
              {resource.data.data.map((row) => (
                <article className="equipment-card" key={row.id}>
                  <div className="card-top">
                    <span className="asset-tag">{row.assetTag}</span>
                    {createElement(Status, { value: row.status })}
                  </div>
                  <div>
                    <h2>
                      <a href={`#equipment/${row.id}`}>{row.name}</a>
                    </h2>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px' }}>
                      {row.category}
                    </p>
                  </div>
                  <div className="card-bottom">
                    <span>📍 {row.location}</span>
                    <a href={`#equipment/${row.id}`}>View specs →</a>
                  </div>
                </article>
              ))}
            </div>
          )}
          {createElement(Pagination, {
            pagination: resource.data.pagination,
            onPage: (page) => setFilters((value) => ({ ...value, page })),
          })}
        </>
      )}
    </>
  );
}

export function EquipmentDetail({ user, id }) {
  const resource = useResource(`/equipment/${id}`);
  const mutation = useMutation(resource.refresh);
  const [editing, setEditing] = useState(false);
  if (!resource.data) return createElement(LoadState, { resource });
  const row = resource.data.data;
  const admin = user.role === 'ADMIN';
  function change(event) {
    const input = values(event);
    mutation.run(() =>
      apiRequest(`/equipment/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...input, version: row.version }),
      }),
    );
  }
  return (
    <>
      <a className="back-link" href="#catalog">
        ← Back to equipment catalog
      </a>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            <span className="asset-tag">{row.assetTag}</span> · {row.category}
          </p>
          <h1>{row.name}</h1>
          <p className="lede">Laboratory location: {row.location}</p>
        </div>
        {createElement(Status, { value: row.status })}
      </div>
      <p role="status" className="feedback">
        {mutation.message}
      </p>
      <div className="detail-grid">
        <section className="panel">
          <h2>Technical specification & condition</h2>
          <p className="preserve-lines">{row.description || 'No technical description recorded in register.'}</p>
          <h3>Calibration & condition notes</h3>
          <p className="preserve-lines">{row.conditionNote || 'No condition notes recorded for this asset.'}</p>
        </section>
        <section className="panel">
          <h2>{admin ? 'Asset administration' : 'Loan requisition'}</h2>
          {!admin &&
            (row.status === 'AVAILABLE' ? (
              <BorrowForm equipment={row} refresh={resource.refresh} />
            ) : (
              <p>
                This physical instrument is currently <strong>{row.status.toLowerCase()}</strong>. Requisition will be enabled once returned to available state.
              </p>
            ))}
          {admin && row.status !== 'ARCHIVED' && (
            <>
              <button
                type="button"
                className="secondary-button"
                disabled={mutation.busy}
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Close editing' : 'Edit details'}
              </button>
              {editing && (
                <form onSubmit={change} aria-busy={mutation.busy}>
                  <input type="hidden" name="action" value="EDIT_METADATA" />
                  {createElement(EquipmentFields, { equipment: row })}
                  <button disabled={mutation.busy}>Save details</button>
                </form>
              )}
              {['AVAILABLE', 'MAINTENANCE'].includes(row.status) && (
                <form onSubmit={change} aria-busy={mutation.busy}>
                  <input
                    type="hidden"
                    name="action"
                    value={row.status === 'MAINTENANCE' ? 'RESTORE' : 'ENTER_MAINTENANCE'}
                  />
                  <label>
                    {row.status === 'MAINTENANCE' ? 'Restoration note' : 'Maintenance reason'}
                    <textarea name="note" required maxLength="2000" />
                  </label>
                  <button disabled={mutation.busy}>
                    {row.status === 'MAINTENANCE' ? 'Restore to available' : 'Enter maintenance'}
                  </button>
                </form>
              )}
              {['AVAILABLE', 'MAINTENANCE'].includes(row.status) && (
                <details className="archive-confirmation">
                  <summary>Archive equipment</summary>
                  <p>Archived equipment is hidden from students and cannot be restored.</p>
                  <button
                    type="button"
                    className="danger-button"
                    disabled={mutation.busy}
                    onClick={() =>
                      mutation.run(async () => {
                        await apiRequest(`/equipment/${id}`, { method: 'DELETE' });
                        window.location.hash = 'catalog';
                      }, 'Equipment archived.')
                    }
                  >
                    Confirm archive
                  </button>
                </details>
              )}
              <p className="field-hint">
                Open requests block manual maintenance and archive. Historical borrowing records are
                retained.
              </p>
            </>
          )}
          {admin && row.status === 'ARCHIVED' && (
            <p>Archived equipment is read-only. Its borrowing history is retained.</p>
          )}
        </section>
      </div>
    </>
  );
}
