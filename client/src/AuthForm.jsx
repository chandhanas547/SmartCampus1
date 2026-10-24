import { useState } from 'react';
import { apiRequest } from './api.js';

export default function AuthForm({ onSignIn }) {
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      if (mode === 'register')
        await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(values) });
      const user = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: values.email, password: values.password }),
      });
      onSignIn(user);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-layout" aria-labelledby="auth-title">
      <div className="auth-intro">
        <p className="eyebrow">LABORATORY ACCESS PROTOCOL</p>
        <h1>
          Physical assets.
          <br />
          Controlled loans.
        </h1>
        <p className="lede">
          Search registered lab equipment, submit formal borrowing requisitions, and track circulation timestamps.
        </p>
        <p className="auth-note">
          Approved equipment is issued from the central lab bench and must be returned for physical condition inspection.
        </p>
      </div>
      <div className="auth-panel">
        <p className="eyebrow">{mode === 'login' ? 'LABORATORY DISPATCH' : 'STUDENT REGISTRATION'}</p>
        <h2 id="auth-title">
          {mode === 'login' ? 'Sign in to LabFlow' : 'Create student account'}
        </h2>
        <form onSubmit={submit} aria-busy={busy}>
          {mode === 'register' && (
            <label>
              Full name
              <input
                name="name"
                autoComplete="name"
                required
                minLength="2"
                maxLength="120"
                placeholder="e.g. Marie Curie"
                aria-describedby={error ? 'auth-error' : undefined}
              />
            </label>
          )}
          <label>
            Institutional email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength="254"
              placeholder="operator@college.edu"
              aria-describedby={error ? 'auth-error' : undefined}
            />
          </label>
          <label>
            Passphrase
            <input
              key={mode}
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength="12"
              maxLength="128"
              placeholder="Minimum 12 characters"
              aria-describedby={mode === 'register' ? 'password-hint auth-error' : 'auth-error'}
            />
          </label>
          {mode === 'register' && (
            <p id="password-hint" className="field-hint">
              12–128 characters required. Spaces and passphrases are encouraged for secure storage.
            </p>
          )}
          <p id="auth-error" role="alert" className="form-error">
            {error}
          </p>
          <button disabled={busy} type="submit">
            {busy ? 'Authenticating…' : mode === 'login' ? 'Sign in to station' : 'Register account'}
          </button>
        </form>
        <p className="switch-form">
          {mode === 'login' ? 'New laboratory researcher?' : 'Existing laboratory researcher?'}{' '}
          <button
            type="button"
            className="text-button"
            disabled={busy}
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </section>
  );
}
