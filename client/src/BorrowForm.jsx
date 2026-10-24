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
          Describe the equipment you need
          <textarea name="requestedEquipment" required minLength="10" maxLength="500" />
          <span className="field-hint">An administrator must assign a registered asset before approval. This request does not reserve equipment.</span>
        </label>
      )}
      <ChoiceField label="Purpose" name="purpose" options={['Laboratory practical work', 'Course project work', 'Research experiment', 'Workshop or demonstration', 'Independent learning']} minLength={10} maxLength={500} multiline />
      <label>
        Preferred return date and time (IST)
        <input name="requestedDueAt" type="datetime-local" required min={localInput(Date.now() + 60000)} />
      </label>
      <p className="field-hint">Approval confirms the due date. The maximum loan is seven days from approval.</p>
      <p role="status" className="feedback">{mutation.message}</p>
      <button disabled={mutation.busy || !selected}>Send borrowing request</button>
    </form>
  );
}
