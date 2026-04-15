// ─── Utility ────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast-msg';
  t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// ─── 1) Load US States — allStatesAPI ────────────────────────────────────────
async function loadStates() {
  const sel = document.getElementById('state');
  try {
    const res  = await fetch('https://csumb.space/api/allStatesAPI.php');
    const data = await res.json();
    sel.innerHTML = '<option value="">— Select State —</option>';
    data.forEach(item => {
      const opt  = document.createElement('option');
      // handle {state, abbreviation} or {name, abbr} shapes
      const abbr = item.abbreviation || item.abbr || item.code || item;
      const name = item.state || item.name || abbr;
      opt.value       = abbr;   // abbreviation used for countyListAPI
      opt.textContent = name;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error('States API error:', err);
    sel.innerHTML = '<option value="">Failed to load states</option>';
  }
}

// ─── 2) Load Counties — countyListAPI ────────────────────────────────────────
async function loadCounties(stateAbbr) {
  const sel = document.getElementById('county');
  sel.innerHTML = '<option value="">Loading…</option>';
  try {
    const res  = await fetch(`https://csumb.space/api/countyListAPI.php?state=${stateAbbr}`);
    const data = await res.json();
    sel.innerHTML = '<option value="">— Select County —</option>';
    data.forEach(item => {
      const o    = document.createElement('option');
      const name = typeof item === 'string' ? item : (item.county || item.name || '');
      o.value       = name;
      o.textContent = name;
      sel.appendChild(o);
    });
  } catch (err) {
    console.error('County API error:', err);
    sel.innerHTML = '<option value="">Failed to load counties</option>';
  }
}

// ─── 3) Zip Code Lookup — cityInfoAPI ────────────────────────────────────────
function clearGeo() {
  document.getElementById('city').value      = '';
  document.getElementById('latitude').value  = '';
  document.getElementById('longitude').value = '';
}

async function lookupZip(zip) {
  const zipFeedback = document.getElementById('zipFeedback');
  const zipInput    = document.getElementById('zipcode');
  try {
    const res  = await fetch(`https://csumb.space/api/cityInfoAPI.php?zip=${zip}`);
    const data = await res.json();

    // Handle {city, lat, lng} or {city, latitude, longitude}
    const city = data.city || data.City || data.place || '';
    const lat  = data.lat  || data.latitude  || data.Lat  || '';
    const lng  = data.lng  || data.longitude || data.Lng  || data.lon || '';

    if (!city) throw new Error('Zip not found');

    document.getElementById('city').value      = city;
    document.getElementById('latitude').value  = parseFloat(lat).toFixed(5);
    document.getElementById('longitude').value = parseFloat(lng).toFixed(5);

    zipFeedback.className   = 'feedback-msg success';
    zipFeedback.textContent = `✓ ${city}`;
    zipInput.classList.remove('is-invalid');
    zipInput.classList.add('is-valid');
  } catch {
    clearGeo();
    zipFeedback.className   = 'feedback-msg error';
    zipFeedback.textContent = '✗ Zip code not found';
    zipInput.classList.remove('is-valid');
    zipInput.classList.add('is-invalid');
  }
}

// ─── 4) Username Availability — usernamesAPI ─────────────────────────────────
async function checkUsername(val) {
  const usernameFeedback = document.getElementById('usernameFeedback');
  const usernameInput    = document.getElementById('username');
  try {
    const res  = await fetch(`https://csumb.space/api/usernamesAPI.php?username=${encodeURIComponent(val)}`);
    const data = await res.json();

    // Handle {available: true/false}, {status: "available"/"taken"}, {taken: bool}
    const available =
      data.available === true  || data.available === 'true'  ||
      data.status    === 'available'                          ||
      data.result    === 'available'                          ||
      data.taken     === false || data.taken     === 'false';

    if (available) {
      usernameFeedback.innerHTML = `<span class="username-badge badge-available">✓ "${val}" is available</span>`;
      usernameInput.classList.add('is-valid');
      usernameInput.classList.remove('is-invalid');
    } else {
      usernameFeedback.innerHTML = `<span class="username-badge badge-taken">✗ "${val}" is taken</span>`;
      usernameInput.classList.add('is-invalid');
      usernameInput.classList.remove('is-valid');
    }
  } catch (err) {
    console.error('Username API error:', err);
    usernameFeedback.className   = 'feedback-msg error';
    usernameFeedback.textContent = 'Could not check username';
  }
}

// ─── 5) Suggested Password — suggestedPassword API ───────────────────────────
async function fetchSuggestedPassword() {
  try {
    const res  = await fetch('https://csumb.space/api/suggestedPassword.php?length=8');
    const data = await res.json();
    // Handle {password: "..."} or plain string
    return data.password || data.suggested || data.pass ||
           (typeof data === 'string' ? data : null);
  } catch (err) {
    console.error('Password API error:', err);
    return null;
  }
}

// ─── Password Match Check ─────────────────────────────────────────────────────
function checkPasswordMatch() {
  const p1 = document.getElementById('password').value;
  const p2 = document.getElementById('retypePassword').value;
  const fb = document.getElementById('retypeFeedback');
  const rt = document.getElementById('retypePassword');
  if (!p2) { fb.innerHTML = ''; rt.classList.remove('is-valid','is-invalid'); return; }
  if (p1 === p2) {
    fb.className = 'feedback-msg success';
    fb.textContent = '✓ Passwords match';
    rt.classList.add('is-valid');
    rt.classList.remove('is-invalid');
  } else {
    fb.className = 'feedback-msg error';
    fb.textContent = '✗ Passwords do not match';
    rt.classList.remove('is-valid');
    rt.classList.add('is-invalid');
  }
}

// ─── Event Listeners ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStates();

  // State → Counties
  document.getElementById('state').addEventListener('change', function () {
    if (this.value) loadCounties(this.value);
    else document.getElementById('county').innerHTML = '<option value="">Select a state first</option>';
  });

  // Zip Code
  let zipTimer;
  document.getElementById('zipcode').addEventListener('input', function () {
    clearTimeout(zipTimer);
    const zip = this.value.trim();
    const zipFeedback = document.getElementById('zipFeedback');
    if (zip.length !== 5 || !/^\d+$/.test(zip)) {
      zipFeedback.innerHTML = '';
      clearGeo();
      return;
    }
    zipFeedback.className = 'feedback-msg checking';
    zipFeedback.innerHTML = '<span class="loading-dot">Searching</span>';
    zipTimer = setTimeout(() => lookupZip(zip), 500);
  });

  // Username
  let unTimer;
  document.getElementById('username').addEventListener('input', function () {
    clearTimeout(unTimer);
    const val = this.value.trim();
    const usernameFeedback = document.getElementById('usernameFeedback');
    if (val.length < 1) { usernameFeedback.innerHTML = ''; return; }
    if (val.length < 3) {
      usernameFeedback.className   = 'feedback-msg error';
      usernameFeedback.textContent = '✗ Too short (min 3 chars)';
      return;
    }
    usernameFeedback.innerHTML = '<span class="username-badge badge-checking">⟳ Checking…</span>';
    unTimer = setTimeout(() => checkUsername(val), 600);
  });

  // Password focus → fetch suggested password from CSUMB API
  const passwordInput     = document.getElementById('password');
  const suggestedPassEl   = document.getElementById('suggestedPass');
  const suggestedPassText = document.getElementById('suggestedPassText');

  passwordInput.addEventListener('focus', async function () {
    suggestedPassText.textContent = '…fetching…';
    suggestedPassEl.style.display = 'block';
    const pass = await fetchSuggestedPassword();
    if (pass) {
      suggestedPassText.textContent    = pass;
      suggestedPassEl.dataset.generated = pass;
    } else {
      suggestedPassEl.style.display = 'none';
    }
  });

  suggestedPassEl.addEventListener('click', function () {
    const pass = this.dataset.generated;
    if (!pass) return;
    passwordInput.value = pass;
    document.getElementById('retypePassword').value = pass;
    suggestedPassEl.style.display = 'none';
    const fb = document.getElementById('passwordFeedback');
    fb.className   = 'feedback-msg success';
    fb.textContent = '✓ Strong enough';
    passwordInput.classList.add('is-valid');
    passwordInput.classList.remove('is-invalid');
    checkPasswordMatch();
  });

  // Password input validation
  passwordInput.addEventListener('input', function () {
    const fb = document.getElementById('passwordFeedback');
    if (this.value.length >= 6) {
      fb.className = 'feedback-msg success';
      fb.textContent = '✓ Strong enough';
      this.classList.add('is-valid'); this.classList.remove('is-invalid');
    } else if (this.value.length > 0) {
      fb.className = 'feedback-msg error';
      fb.textContent = '✗ Too short (min 6 chars)';
      this.classList.remove('is-valid'); this.classList.add('is-invalid');
    } else {
      fb.innerHTML = '';
      this.classList.remove('is-valid','is-invalid');
    }
    checkPasswordMatch();
  });

  document.getElementById('retypePassword').addEventListener('input', checkPasswordMatch);

  // Submit validation
  document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value;
    const retype   = document.getElementById('retypePassword').value;
    let valid = true;

    if (username.length < 3) {
      showToast('⚠ Username must be at least 3 characters.');
      valid = false;
    }
    if (password.length < 6) {
      showToast('⚠ Password must be at least 6 characters.');
      valid = false;
    }
    if (password !== retype) {
      showToast('⚠ Passwords do not match.');
      valid = false;
    }
    if (valid) {
      const btn = document.querySelector('.btn-submit');
      btn.textContent = '✓ Account Created!';
      btn.classList.add('success');
      setTimeout(() => {
        btn.textContent = 'Create Account →';
        btn.classList.remove('success');
      }, 3000);
    }
  });
});
