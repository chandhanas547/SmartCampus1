import { createElement, useEffect, useState } from 'react';
import { apiRequest } from './api.js';
import AuthForm from './AuthForm.jsx';
import Workspace from './Workspace.jsx';

export default function App() {
  const [connection, setConnection] = useState({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    apiRequest('/auth/me', { signal: controller.signal }).then((value) => { if (!controller.signal.aborted) setUser(value); }).catch(() => {}).finally(() => { if (!controller.signal.aborted) setRestoring(false); });
    return () => controller.abort();
  }, []);
  async function signOut() {
    try { await apiRequest('/auth/logout', { method: 'POST', body: '{}' }); setUser(null); }
    catch (error) { if (error.status === 401) setUser(null); else setConnection({ state: 'error', message: error.message }); }
  }
  useEffect(() => {
    const controller = new AbortController();
    apiRequest('/health', { signal: controller.signal })
      .then((data) => {
        if (data.status !== 'ready') throw new Error('Service temporarily unavailable. Please try again.');
        if (!controller.signal.aborted) setConnection({ state: 'ready' });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setConnection({ state: 'error', message: error.message });
      });
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setConnection({ state: 'loading' });
    setAttempt((value) => value + 1);
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main" onClick={(event) => { event.preventDefault(); document.getElementById('main').focus(); }}>Skip to content</a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="LabFlow home"><span className="brand-mark" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 28 28" focusable="false"><path d="M5 6v15h9M17 9v15m0-15h8m-8 7h6" fill="none" stroke="currentColor" strokeWidth="2" /></svg></span>LabFlow</a>
        <span className="preview-label">ICTAK demonstration</span>
      </header>
      {connection.state === 'error' && <div className="form-error" role="alert"><p>{connection.message}</p><button type="button" onClick={retry}>Try again</button></div>}
      <main id="main" tabIndex="-1">
        {restoring ? <p role="status" className="page-message">Restoring your session…</p> : user ? createElement(Workspace, { user, onSignOut: signOut }) : createElement(AuthForm, { onSignIn: setUser })}
        {!user && <section className="journey" aria-labelledby="journey-title">
          <div className="section-heading"><h2 id="journey-title">How borrowing works</h2><span>THE BORROWING JOURNEY</span></div>
          <ol className="steps">
            {[['Explore', 'Find the right equipment for your work.'], ['Request', 'Send your purpose and preferred return date.'], ['Collect', 'Pick up your approved equipment from the lab.'], ['Return', 'Bring it back for inspection and the next borrower.']].map(([title, description], index) => (
              <li key={title}><span className="step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>
            ))}
          </ol>
        </section>}
      </main>
      <footer><span>LabFlow</span><p>Equipment borrowing and returns</p><span>ICTAK capstone · Demo</span></footer>
    </div>
  );
}
