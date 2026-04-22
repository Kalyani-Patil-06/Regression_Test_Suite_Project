/**
 * User Interaction Capture Snippet
 * 
 * Include this script on any web page to capture user interactions
 * (clicks, inputs, navigation) and send them to the backend for
 * ephemeral dynamic test case generation.
 * 
 * Usage: Add <script src="capture.js"></script> to your HTML page.
 */
(function () {
  const BACKEND_URL = 'http://localhost:5000/api/interactions';
  const SESSION_ID = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const actions = [];
  let flushTimeout = null;

  // Get a CSS selector path for an element
  function getSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.trim().split(/\s+/).join('.');
      if (classes) return el.tagName.toLowerCase() + '.' + classes;
    }
    return el.tagName.toLowerCase();
  }

  // Record an action
  function recordAction(type, el, extra = {}) {
    actions.push({
      type,
      selector: el ? getSelector(el) : '',
      value: extra.value || '',
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    // Auto-flush every 10 actions or after 5 seconds
    if (actions.length >= 10) {
      flush();
    } else {
      clearTimeout(flushTimeout);
      flushTimeout = setTimeout(flush, 5000);
    }
  }

  // Send actions to backend
  function flush() {
    if (actions.length === 0) return;

    const payload = {
      sessionId: SESSION_ID,
      url: window.location.href,
      actions: [...actions]
    };

    actions.length = 0; // Clear

    fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.debug('[Capture] Send failed:', err));
  }

  // Listen for clicks
  document.addEventListener('click', (e) => {
    recordAction('click', e.target);
  }, true);

  // Listen for input changes
  document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      recordAction('input', e.target, { value: e.target.value });
    }
  }, true);

  // Listen for form submissions
  document.addEventListener('submit', (e) => {
    recordAction('submit', e.target);
  }, true);

  // Flush on page unload
  window.addEventListener('beforeunload', flush);

  console.log('[Capture] User interaction capture initialized. Session:', SESSION_ID);
})();
