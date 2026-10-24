import { useState } from 'react';

export default function ChoiceField({ label, name, options, defaultValue = '', required = true, minLength = 2, maxLength = 120, multiline = false, emptyLabel = 'Choose an option' }) {
  const [choice, setChoice] = useState(() => defaultValue && !options.includes(defaultValue) ? '__other__' : defaultValue);
  const [custom, setCustom] = useState(() => options.includes(defaultValue) ? '' : defaultValue);
  const other = choice === '__other__';
  const CustomInput = multiline ? 'textarea' : 'input';
  return (
    <div className="choice-field">
      <label>
        {label}
        <select name={other ? undefined : name} value={choice} onChange={(event) => setChoice(event.target.value)} required={required}>
          <option value="">{emptyLabel}</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
          <option value="__other__">Other — please specify</option>
        </select>
      </label>
      {other && (
        <label>
          Specify {label.toLowerCase()}
          <CustomInput
            name={name}
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            required
            minLength={minLength}
            maxLength={maxLength}
            placeholder={`Specify custom ${label.toLowerCase()}…`}
          />
        </label>
      )}
    </div>
  );
}
