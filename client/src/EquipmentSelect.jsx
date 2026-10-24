import { useState } from 'react';
import { LoadState, Pagination, useResource } from './ui.jsx';

export default function EquipmentSelect({ selected, onChange, allowOther = false }) {
  const [page, setPage] = useState(1);
  const resource = useResource(`/equipment?status=AVAILABLE&limit=50&page=${page}`);
  if (!resource.data) return <LoadState resource={resource} />;
  const rows = resource.data.data;
  const options = selected?.id && !rows.some((row) => row.id === selected.id) ? [selected, ...rows] : rows;
  return (
    <>
      <label>
        {allowOther ? 'Laboratory instrument' : 'Assign available laboratory asset'}
        <select
          name={selected === 'other' ? undefined : 'equipmentId'}
          value={selected === 'other' ? '__other__' : selected?.id || ''}
          required
          onChange={(event) => onChange(event.target.value === '__other__' ? 'other' : options.find((row) => row.id === event.target.value) || null)}
        >
          <option value="">Select available asset from register…</option>
          {options.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name} · [{row.assetTag}] · {row.location}
            </option>
          ))}
          {allowOther && <option value="__other__">Other unlisted instrument — describe requirements</option>}
        </select>
      </label>
      {resource.data.pagination.total > 50 && <Pagination pagination={resource.data.pagination} onPage={setPage} />}
      {!rows.length && (
        <p className="field-hint">
          No operational assets are currently marked AVAILABLE on this page.
          {allowOther ? ' Select Other to describe unlisted equipment.' : ' Register or restore a suitable asset in Equipment first.'}
        </p>
      )}
    </>
  );
}
