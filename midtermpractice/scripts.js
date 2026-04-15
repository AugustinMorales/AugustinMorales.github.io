// ─── State ───────────────────────────────────────────────────────────────
let currentQuoteId = null;
let authorInfoVisible = false;

const languages = [
  { code: 'EN', label: 'English',   flag: 'img/en.png' },
  { code: 'ES', label: 'Esperanto', flag: 'img/es.png' },
  { code: 'FR', label: 'French',    flag: 'img/fr.png' },
  { code: 'SP', label: 'Spanish',   flag: 'img/sp.png' },
];

// ─── 1. Load random quote on page load ───────────────────────────────────
async function loadRandomQuote() {
  try {
    const res = await fetch('https://csumb.space/api/famousQuotes/getRandomQuote.php');
    const data = await res.json();
    currentQuoteId = data.quoteId ?? data.id ?? data.quote_id;
    document.getElementById('quote-text').textContent = data.quote ?? data.text ?? '';
    document.getElementById('quote-author').textContent = '— ' + (data.author ?? '');
  } catch (e) {
    document.getElementById('quote-text').textContent = 'Could not load quote.';
  }
}

// ─── 2. Toggle Author Info ────────────────────────────────────────────────
async function toggleAuthorInfo() {
  const section = document.getElementById('author-info-section');
  authorInfoVisible = !authorInfoVisible;
  if (!authorInfoVisible) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  if (document.getElementById('author-bio').textContent) return; // already loaded

  try {
    const res = await fetch('https://csumb.space/api/famousQuotes/getRandomQuote.php');
    const data = await res.json();
    const bio = document.getElementById('author-bio');
    const img = document.getElementById('author-img');
    bio.textContent = data.authorBio ?? data.bio ?? 'No bio available.';
    if (data.authorPic ?? data.picture ?? data.img) {
      img.src = data.authorPic ?? data.picture ?? data.img;
      img.style.display = 'block';
    }
  } catch (e) {
    document.getElementById('author-bio').textContent = 'Could not load author info.';
  }
}

// ─── 3. Display languages in random order ────────────────────────────────
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderLanguages() {
  const grid = document.getElementById('languages-grid');
  const shuffled = shuffleArray([...languages]);
  grid.innerHTML = '';
  shuffled.forEach((lang, idx) => {
    const label = document.createElement('label');
    label.className = 'lang-label';
    label.innerHTML = `
      <input type="radio" name="lang" value="${lang.code}" data-flag="${lang.flag}" data-label="${lang.label}" ${idx === 0 ? 'checked' : ''}>
      <span>${lang.label}</span>
    `;
    grid.appendChild(label);
  });
}

// ─── 4. Translate ─────────────────────────────────────────────────────────
async function translateQuote() {
  const selected = document.querySelector('input[name="lang"]:checked');
  if (!selected || !currentQuoteId) return;

  const lang = selected.value;
  const flagSrc = selected.dataset.flag;
  const langLabel = selected.dataset.label;

  const resultDiv = document.getElementById('translation-result');
  const translatedEl = document.getElementById('translated-text');
  const flagImg = document.getElementById('flag-img');
  const langLabelEl = document.getElementById('lang-label-result');

  resultDiv.style.display = 'block';
  flagImg.src = flagSrc;
  langLabelEl.textContent = langLabel;
  translatedEl.textContent = 'Translating…';

  try {
    const res = await fetch(`https://csumb.space/api/famousQuotes/translateQuote.php?lang=${lang}&quoteId=${currentQuoteId}`);
    const data = await res.json();
    translatedEl.textContent = data.quote ?? data.translation ?? data.text ?? JSON.stringify(data);
  } catch (e) {
    translatedEl.textContent = 'Translation failed.';
  }
}

// ─── 5. Get Quotes ────────────────────────────────────────────────────────
async function getQuotes() {
  const input = document.getElementById('num-quotes-input').value.trim();
  const errorEl = document.getElementById('quotes-error');
  const listEl = document.getElementById('quotes-list');

  const n = Number(input);
  if (!input || isNaN(n) || n < 1 || n > 5 || !Number.isInteger(n)) {
    errorEl.style.display = 'block';
    listEl.style.display = 'none';
    return;
  }
  errorEl.style.display = 'none';

  listEl.style.display = 'block';
  listEl.innerHTML = '<p class="loading">Loading quotes…</p>';

  try {
    const res = await fetch(`https://csumb.space/api/famousQuotes/getQuotes.php?n=${n}`);
    const data = await res.json();
    const quotes = Array.isArray(data) ? data : (data.quotes ?? [data]);
    listEl.innerHTML = quotes.map(q => `
      <div class="quote-item">
        <div class="q-text">${q.quote ?? q.text ?? ''}</div>
        <div class="q-author">— ${q.author ?? ''}</div>
      </div>
    `).join('');
  } catch (e) {
    listEl.innerHTML = '<p style="color:var(--red)">Could not load quotes.</p>';
  }
}

// ─── 6. Random Background Image from Pixabay ─────────────────────────────
async function loadBackground() {
  try {
    const res = await fetch('https://pixabay.com/api/?key=5589438-47a0bca778bf23fc2e8c5bf3e&per_page=50&orientation=horizontal&q=flowers');
    const data = await res.json();
    const hits = data.hits;
    if (hits && hits.length) {
      const pick = hits[Math.floor(Math.random() * hits.length)];
      document.body.style.backgroundImage = `url('${pick.largeImageURL}')`;
    }
  } catch (e) {
    // fallback — keep dark background
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────
loadBackground();
loadRandomQuote();
renderLanguages();
