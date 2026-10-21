import { useEffect, useState } from 'react';
import { apiRequest } from './api.js';

export default function App() {
  const [connection, setConnection] = useState({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
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
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="LabFlow home"><span className="brand-mark" aria-hidden="true">L<span>F</span></span>LabFlow</a>
        <span className="preview-label">Development preview</span>
      </header>
      <main id="main" tabIndex="-1">
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="eyebrow">YOUR COLLEGE LABORATORY</p>
            <h1 id="page-title">Good equipment.<br />Great possibilities.</h1>
            <p className="lede">A place to find the tools you need, keep track of what you borrow, and look after what comes next.</p>
            <div className="development-note"><span className="note-marker" aria-hidden="true">↗</span><p><strong>We’re getting the lab ready.</strong><br />Equipment browsing and borrowing will arrive in the next milestones.</p></div>
          </div>
          <div className="lab-illustration" aria-hidden="true">
            <svg viewBox="0 0 400 320" fill="none">
              <path d="M20 260H380M60 280H340" stroke="#8eaaa0" strokeWidth="2" />
              <rect x="63" y="128" width="130" height="132" rx="12" fill="#faf9f4" stroke="#183c34" strokeWidth="3" />
              <rect x="80" y="147" width="96" height="60" rx="4" fill="#d7e7db" stroke="#183c34" strokeWidth="2" />
              <path d="M88 180H100L108 163L118 192L131 168L140 180H168" stroke="#487358" strokeWidth="3" />
              <circle cx="94" cy="231" r="9" stroke="#183c34" strokeWidth="3" /><circle cx="131" cy="231" r="9" stroke="#183c34" strokeWidth="3" />
              <path d="M238 71L271 52L310 119L277 138Z" fill="#d4af71" stroke="#183c34" strokeWidth="3" />
              <path d="M286 136C327 150 342 204 296 237M270 196H325M243 260H339L326 241H257Z" stroke="#183c34" strokeWidth="9" strokeLinejoin="round" />
              <path d="M252 91L236 100M264 112L248 121" stroke="#183c34" strokeWidth="3" />
              <path d="M91 82H139M115 58V106M336 59V83M324 71H348" stroke="#8eaaa0" strokeWidth="2" />
            </svg>
            <span className="illustration-caption">MAKE MORE. BORROW MINDFULLY.</span>
          </div>
        </section>
        <section className="connection-panel" aria-labelledby="connection-title">
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
        </section>
      </main>
      <footer><span>LabFlow</span><p>One lab. Shared possibilities.</p><span>ICTAK capstone · Demo</span></footer>
    </div>
  );
}
