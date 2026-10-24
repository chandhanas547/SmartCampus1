import { createElement, useState } from 'react';
import { apiRequest } from './api.js';
import EquipmentSelect from './EquipmentSelect.jsx';
import {
  LoadState,
  Pagination,
  Status,
  ist,
  localInput,
  utcInput,
  useMutation,
  useResource,
  values,
} from './ui.jsx';

export function Requests({ user, search = '' }) {
  const [filters, setFilters] = useState(() => {
    const query = new URLSearchParams(search);
    return {
      status: query.get('status') || '',
      page: 1,
      ...(user.role === 'ADMIN'
        ? { overdue: query.get('overdue') || '', damage: query.get('damage') || '' }
        : {}),
    };
  });
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== ''));
  const resource = useResource(`/requests?${query}`);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {user.role === 'ADMIN' ? 'CIRCULATION DESK · LOAN REGISTER' : 'STUDENT REQUISITIONS'}
          </p>
          <h1>{user.role === 'ADMIN' ? 'Borrowing requests' : 'My requests'}</h1>
          <p className="lede">Track loan requests, lab handover confirmations, and return inspections.</p>
        </div>
      </div>
      <form className="filters" onSubmit={(event) => setFilters({ ...values(event), page: 1 })}>
        <label>
          Status filter
          <select name="status" defaultValue={filters.status}>
            <option value="">All statuses</option>
            {['PENDING', 'APPROVED', 'ISSUED', 'RETURNED', 'CANCELLED', 'REJECTED'].map(
              (status) => (
                <option key={status}>{status}</option>
              ),
            )}
          </select>
        </label>
        {user.role === 'ADMIN' && (
          <>
            <label>
              Overdue filter
              <select name="overdue" defaultValue={filters.overdue}>
                <option value="">All loans</option>
                <option value="true">Overdue only</option>
                <option value="false">Not overdue</option>
              </select>
            </label>
            <label>
              Damage filter
              <select name="damage" defaultValue={filters.damage}>
                <option value="">All reports</option>
                <option value="true">Unreviewed only</option>
                <option value="false">No unreviewed report</option>
              </select>
            </label>
          </>
        )}
        <button>Apply filter</button>
      </form>
      {!resource.data ? (
        createElement(LoadState, { resource })
      ) : (
        <>
          {!resource.data.data.length ? (
            <div className="empty-state">
              <h2>No circulation requests found</h2>
              <p>No active or historical requests match your current filter parameters.</p>
              <a href="#catalog" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
                Browse equipment catalog →
              </a>
            </div>
          ) : (
            <div className="request-list">
              {resource.data.data.map((row) => (
                <article key={row.id}>
                  <div>
                    <div style={{ marginBottom: '8px' }}>
                      {row.assetSnapshot?.assetTag ? (
                        <span className="asset-tag">{row.assetSnapshot.assetTag}</span>
                      ) : (
                        <span className="asset-tag" style={{ borderStyle: 'dashed' }}>UNLISTED ITEM</span>
                      )}
                    </div>
                    <h2>
                      <a href={`#request/${row.id}`}>{row.assetSnapshot?.name || row.requestedEquipment}</a>
                    </h2>
                    {user.role === 'ADMIN' && (
                      <p style={{ fontWeight: 500, color: 'var(--ink)' }}>
                        Borrower: {row.borrower?.name || 'Account unavailable'} ({row.borrower?.email || 'No email'})
                      </p>
                    )}
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      Requested due: {ist(row.requestedDueAt)}
                    </p>
                    {row.dueAt && (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                        Confirmed due: {ist(row.dueAt)}
                      </p>
                    )}
                  </div>
                  <div className="request-summary">
                    {createElement(Status, { value: row.status })}
                    {row.damageReport && !row.damageReport.reviewedAt && (
                      <span className="attention-label">⚠ Inspection pending</span>
                    )}
                    <a href={`#request/${row.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
                      Inspect record →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
          {createElement(Pagination, {
            pagination: resource.data.pagination,
            onPage: (previous) => setFilters((prev) => ({ ...prev, page: previous })),
          })}
        </>
      )}
    </>
  );
}

function DecisionForm({ row, busy, act }) {
  const [decision, setDecision] = useState('APPROVE');
  const [assigned, setAssigned] = useState(null);
  return (
    <form
      onSubmit={(event) => {
        const input = values(event);
        act(
          'decision',
          decision === 'APPROVE'
            ? { action: decision, dueAt: utcInput(input.dueAt), ...(!row.equipmentId ? { equipmentId: input.equipmentId } : {}) }
            : { action: decision, reason: input.reason },
        );
      }}
    >
      <label>
        Administrative decision
        <select value={decision} onChange={(event) => setDecision(event.target.value)}>
          <option value="APPROVE">Approve & reserve equipment</option>
          <option value="REJECT">Reject request</option>
        </select>
      </label>
      {decision === 'APPROVE' ? (
        <>
          {!row.equipmentId && <><EquipmentSelect selected={assigned} onChange={setAssigned} /><a href="#catalog" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '6px', display: 'inline-block' }}>Add a missing asset in Equipment →</a></>}
          <label>
            Confirmed due date and time (IST)
            <input
              name="dueAt"
              type="datetime-local"
              required
              min={localInput(Date.now() + 60000)}
              max={localInput(Date.now() + 168 * 3600000)}
              defaultValue={localInput(
                Math.min(new Date(row.requestedDueAt).getTime(), Date.now() + 167 * 3600000),
              )}
            />
          </label>
          <p className="field-hint">
            The asset must be available and the requested date must still be future. Maximum lending
            is 168 hours from approval.
          </p>
        </>
      ) : (
        <label>
          Rejection reason
          <textarea name="reason" required maxLength="2000" placeholder="State reason for rejection…" />
        </label>
      )}
      <button disabled={busy || (decision === 'APPROVE' && !row.equipmentId && !assigned)}>
        {decision === 'APPROVE' ? 'Confirm approval & reserve asset' : 'Confirm rejection'}
      </button>
    </form>
  );
}

export function RequestDetail({ user, id }) {
  const [returnCondition, setReturnCondition] = useState('SERVICEABLE');
  const resource = useResource(`/requests/${id}`);
  const mutation = useMutation(resource.refresh);
  if (!resource.data) return createElement(LoadState, { resource });
  const row = resource.data.data;
  const admin = user.role === 'ADMIN';
  const report = row.damageReport;
  function act(endpoint, body) {
    mutation.run(() =>
      apiRequest(`/requests/${id}/${endpoint}`, { method: 'POST', body: JSON.stringify(body) }),
    );
  }
  return (
    <>
      <a className="back-link" href="#requests">
        ← Back to circulation requests
      </a>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {row.assetSnapshot?.assetTag ? (
              <>
                <span className="asset-tag">{row.assetSnapshot.assetTag}</span> · REQUISITION RECORD
              </>
            ) : (
              <>
                <span className="asset-tag" style={{ borderStyle: 'dashed' }}>UNLISTED NEED</span> · PENDING ASSIGNMENT
              </>
            )}
          </p>
          <h1>{row.assetSnapshot?.name || row.requestedEquipment}</h1>
          <p className="lede">Circulation timeline, loan terms, and inspection log.</p>
        </div>
        {createElement(Status, { value: row.status })}
      </div>
      <p role="status" className="feedback">
        {mutation.message}
      </p>
      <div className="detail-grid">
        <section className="panel">
          <h2>Request details</h2>
          <dl className="facts">
            {admin && (
              <div>
                <dt>Borrower</dt>
                <dd>
                  {row.borrower?.name || 'Account unavailable'}
                  {row.borrower && (
                    <>
                      <br />
                      {row.borrower.email}
                    </>
                  )}
                </dd>
              </div>
            )}
            {row.requestedEquipment && <div><dt>Originally requested equipment</dt><dd className="preserve-lines">{row.requestedEquipment}</dd></div>}
            <div>
              <dt>Purpose</dt>
              <dd className="preserve-lines">{row.purpose}</dd>
            </div>
            <div>
              <dt>Requested return</dt>
              <dd>{ist(row.requestedDueAt)}</dd>
            </div>
            <div>
              <dt>Confirmed due</dt>
              <dd>{ist(row.dueAt)}</dd>
            </div>
            {row.returnCondition && (
              <div>
                <dt>Returned condition</dt>
                <dd>{row.returnCondition}</dd>
              </div>
            )}
          </dl>
          {report && (
            <section className="report-note">
              <h3>Damage report</h3>
              <p className="preserve-lines">{report.description}</p>
              <p className="field-hint">
                Reported {ist(report.reportedAt)} ·{' '}
                {report.reviewedAt
                  ? `Inspected ${ist(report.reviewedAt)} · ${report.inspectionResult}`
                  : 'Awaiting inspection at return'}
              </p>
            </section>
          )}
          {row.inspectionNote && (
            <>
              <h3>Inspection note</h3>
              <p className="preserve-lines">{row.inspectionNote}</p>
            </>
          )}
          <h3>Timeline</h3>
          <ol className="timeline">
            {row.events.map((event, index) => (
              <li key={`${event.action}-${index}`}>
                <strong>{event.action.replaceAll('_', ' ')}</strong>
                <time>{ist(event.at)}</time>
                {event.reason && <p className="preserve-lines">{event.reason}</p>}
              </li>
            ))}
          </ol>
        </section>
        <section className="panel">
          <h2>{admin ? 'Circulation desk actions' : 'Loan requisition actions'}</h2>
          {admin &&
            row.status === 'PENDING' &&
            createElement(DecisionForm, { row, busy: mutation.busy, act })}
          {admin && row.status === 'APPROVED' && (
            <>
              <button
                type="button"
                disabled={mutation.busy || new Date(row.dueAt).getTime() <= Date.now()}
                onClick={() => act('issue', {})}
              >
                Confirm lab handover & issue asset
              </button>
              <form onSubmit={(event) => act('cancellation', values(event))}>
                <label>
                  Cancellation reason
                  <textarea name="reason" required maxLength="2000" placeholder="State reason for administrative cancellation…" />
                </label>
                <button className="secondary-button" disabled={mutation.busy}>
                  Cancel reservation
                </button>
              </form>
              <p className="field-hint">
                An expired reservation must be cancelled before a fresh request; its due date cannot
                be extended at issue.
              </p>
            </>
          )}
          {!admin && ['PENDING', 'APPROVED'].includes(row.status) && (
            <>
              <p>You may cancel this requisition prior to physical handover at the lab.</p>
              <button
                type="button"
                className="secondary-button"
                disabled={mutation.busy}
                onClick={() => act('cancellation', {})}
              >
                Withdraw loan request
              </button>
            </>
          )}
          {!admin &&
            row.status === 'ISSUED' &&
            (report ? (
              <p>Your damage notification has been registered in the log. Staff will verify upon physical return.</p>
            ) : (
              <form onSubmit={(event) => act('damage-report', values(event))}>
                <label>
                  Incident or damage description
                  <textarea name="description" required maxLength="2000" placeholder="Describe when and how the issue occurred…" />
                </label>
                <button className="danger-button" disabled={mutation.busy}>
                  Submit damage report
                </button>
              </form>
            ))}
          {admin && row.status === 'ISSUED' && (
            <form
              onSubmit={(event) => {
                const input = values(event);
                if (!input.inspectionNote.trim()) delete input.inspectionNote;
                act('return', input);
              }}
            >
              <label>
                Physical inspection result
                <select
                  name="condition"
                  value={returnCondition}
                  onChange={(event) => setReturnCondition(event.target.value)}
                >
                  <option value="SERVICEABLE">Serviceable — return to inventory</option>
                  <option value="DAMAGED">Damaged — transition to maintenance</option>
                </select>
              </label>
              <label>
                Inspection notes
                <textarea
                  name="inspectionNote"
                  required={!!report || returnCondition === 'DAMAGED'}
                  maxLength="2000"
                  placeholder="Record physical inspection findings…"
                />
              </label>
              <p className="field-hint">
                A note is required for any reported issue or damaged return. Existing reports are
                resolved with this inspection result.
              </p>
              <button disabled={mutation.busy}>Confirm return inspection & log condition</button>
            </form>
          )}
          {['RETURNED', 'CANCELLED', 'REJECTED'].includes(row.status) && (
            <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              Requisition record is closed. Audit timeline and loan history are permanently preserved.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
