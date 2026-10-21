import axe from 'axe-core';

const tools = document.createElement('aside');
tools.id = 'labflow-audit-tools';
tools.setAttribute('aria-label', 'Development accessibility checks');
const button = document.createElement('button');
button.textContent = 'Run accessibility check';
const output = document.createElement('pre');
output.id = 'accessibility-results';
output.style.whiteSpace = 'pre-wrap';
const zoom = document.createElement('button');
zoom.textContent = 'Use 200% content zoom';
zoom.addEventListener('click', () => {
  const enlarged = document.documentElement.style.zoom !== '2';
  document.documentElement.style.zoom = enlarged ? '2' : '1';
  zoom.textContent = enlarged ? 'Reset content zoom' : 'Use 200% content zoom';
});
tools.append(button, zoom, output);
document.body.append(tools);
button.addEventListener('click', async () => {
  button.disabled = true;
  output.textContent = 'Checking…';
  try {
    const result = await axe.run({ exclude: ['#labflow-audit-tools'] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
    const summarize = (rules) => rules.map(({ id, impact, help, nodes }) => ({ id, impact, help, targets: nodes.map(({ target }) => target) }));
    output.textContent = JSON.stringify({ engine: result.testEngine, timestamp: result.timestamp, route: location.hash, viewport: { width: innerWidth, height: innerHeight }, violations: summarize(result.violations), incomplete: summarize(result.incomplete), passedRules: result.passes.length }, null, 2);
  } catch { output.textContent = 'Accessibility check failed; inspect the local development setup.'; }
  finally { button.disabled = false; }
});
