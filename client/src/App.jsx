import { useEffect, useState } from 'react';
import { apiRequest } from './api.js';
import { createElement } from 'react';
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
        <a className="brand" href="/" aria-label="LabFlow home"><span className="brand-mark" aria-hidden="true">L<span>F</span></span>LabFlow</a>
        <span className="preview-label">ICTAK demonstration</span>
      </header>
      {connection.state === 'error' && <p className="form-error" role="alert">{connection.message}</p>}
      <main id="main" tabIndex="-1">
        {restoring ? <p role="status" className="page-message">Restoring your session…</p> : user ? createElement(Workspace, { user, onSignOut: signOut }) : createElement(AuthForm, { onSignIn: setUser })}
        {!user && <><section className="connection-panel" aria-labelledby="connection-title">
          <div><p className="eyebrow">LIVE CONNECTION</p><h2 id="connection-title">Ready for the next step</h2></div>
          <div className="connection-action">
            <p role="status" className={`connection-status ${connection.state}`}>
              <span className="status-dot" aria-hidden="true" />
              {connection.state === 'loading' ? 'Checking connection…' : connection.state === 'ready' ? 'Connected to LabFlow' : connection.message}
            </p>
            <button type="button" onClick={retry} disabled={connection.state === 'loading'}>Check connection <span aria-hidden="true">↗</span></button>
          </div>
        </section>
        <section className="journey" aria-labelledby="journey-title">
          <div className="section-heading"><h2 id="journey-title">From the shelf to your next idea.</h2><span>THE BORROWING JOURNEY</span></div>
          <ol className="steps">
            {[['Explore', 'Find the right equipment for your work.'], ['Request', 'Send your purpose and preferred return date.'], ['Collect', 'Pick up your approved equipment from the lab.'], ['Return', 'Bring it back for inspection and the next borrower.']].map(([title, description], index) => (
              <li key={title}><span className="step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>
            ))}
          </ol>
        </section></>}
      </main>
      <footer><span>LabFlow</span><p>One lab. Shared possibilities.</p><span>ICTAK capstone · Demo</span></footer>
    </div>
  );
}
