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
        {allowOther ? 'Equipment' : 'Assign available equipment'}
        <select
          name={selected === 'other' ? undefined : 'equipmentId'}
          value={selected === 'other' ? '__other__' : selected?.id || ''}
          required
          onChange={(event) => onChange(event.target.value === '__other__' ? 'other' : options.find((row) => row.id === event.target.value) || null)}
        >
          <option value="">Choose equipment</option>
          {options.map((row) => <option key={row.id} value={row.id}>{row.name} · {row.assetTag} · {row.location}</option>)}
          {allowOther && <option value="__other__">Other — please specify</option>}
        </select>
      </label>
      {resource.data.pagination.total > 50 && <Pagination pagination={resource.data.pagination} onPage={setPage} />}
      {!rows.length && <p className="field-hint">No available assets on this page.{allowOther ? ' Choose Other to describe what you need.' : ' Add or restore a suitable asset in Equipment, then return here to assign it.'}</p>}
    </>
  );
}
