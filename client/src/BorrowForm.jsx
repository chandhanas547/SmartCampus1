import { useState } from 'react';
import { apiRequest } from './api.js';
import ChoiceField from './ChoiceField.jsx';
import EquipmentSelect from './EquipmentSelect.jsx';
import { localInput, utcInput, useMutation, values } from './ui.jsx';

export default function BorrowForm({ equipment, refresh }) {
  const [selected, setSelected] = useState(equipment || null);
  const [requestKey] = useState(() => crypto.randomUUID());
  const mutation = useMutation(refresh);
  function submit(event) {
    const input = values(event);
    mutation.run(async () => {
      const request = await apiRequest('/requests', {
        method: 'POST',
        body: JSON.stringify({ ...input, requestKey, requestedDueAt: utcInput(input.requestedDueAt) }),
      });
      window.location.hash = `request/${request.id}`;
    }, 'Request submitted.');
  }
  return (
    <form onSubmit={submit} aria-busy={mutation.busy}>
      <EquipmentSelect selected={selected} onChange={setSelected} allowOther />
      {selected === 'other' && (
        <label>
          Describe required equipment or tooling
          <textarea
            name="requestedEquipment"
            required
            minLength="10"
            maxLength="500"
            placeholder="Specify instrument type, required specifications, or experimental needs…"
          />
          <span className="field-hint">
            A staff administrator will assign a specific physical asset tag during approval review. Unassigned requests do not reserve equipment.
          </span>
        </label>
      )}
      <ChoiceField
        label="Experimental purpose"
        name="purpose"
        options={[
          'Laboratory practical work',
          'Course project work',
          'Research experiment',
          'Workshop or practical study',
          'Independent learning',
        ]}
        minLength={10}
        maxLength={500}
        multiline
      />
      <label>
        Requested return timestamp (IST)
        <input name="requestedDueAt" type="datetime-local" required min={localInput(Date.now() + 60000)} />
      </label>
      <p className="field-hint">
        Final return deadline is confirmed upon staff approval. Maximum permissible loan duration is 168 hours (7 days).
      </p>
      <p role="status" className="feedback">{mutation.message}</p>
      <button disabled={mutation.busy || !selected}>Submit loan requisition</button>
    </form>
  );
}
