import { useState } from 'react';
import { apiRequest } from './api.js';

export default function AuthForm({ onSignIn }) {
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError('');
    try {
      if (mode === 'register') await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(values) });
      const user = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email: values.email, password: values.password }) });
      onSignIn(user);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return (
    <section className="auth-layout" aria-labelledby="auth-title">
      <div className="auth-intro"><p className="eyebrow">YOUR COLLEGE LABORATORY</p><h1>Borrow lab<br />equipment.</h1><p className="lede">Check availability, request equipment and track your loans.</p><p className="auth-note">Collect approved equipment from the lab and return it for inspection.</p></div>
      <div className="auth-panel">
        <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'STUDENT REGISTRATION'}</p>
        <h2 id="auth-title">{mode === 'login' ? 'Sign in to LabFlow' : 'Create your student account'}</h2>
        <form onSubmit={submit} aria-busy={busy}>
          {mode === 'register' && <label>Your name<input name="name" autoComplete="name" required minLength="2" maxLength="120" aria-describedby={error ? 'auth-error' : undefined} /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength="254" aria-describedby={error ? 'auth-error' : undefined} /></label>
          <label>Password<input key={mode} name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength="12" maxLength="128" aria-describedby={mode === 'register' ? 'password-hint auth-error' : 'auth-error'} /></label>
          {mode === 'register' && <p id="password-hint" className="field-hint">Use 12–128 characters. Spaces and passphrases are welcome.</p>}
          <p id="auth-error" role="alert" className="form-error">{error}</p>
          <button disabled={busy} type="submit">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        <p className="switch-form">{mode === 'login' ? 'New to the lab?' : 'Already have an account?'} <button type="button" className="text-button" disabled={busy} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
      </div>
    </section>
  );
}
