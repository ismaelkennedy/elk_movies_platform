// Page courante dans la pagination — démarre toujours à 1
let currentPage = 1;

// --- Chargement des filtres disponibles depuis Elasticsearch ---
// Les genres et langues sont récupérés via une agrégation ES
// pour que les menus déroulants reflètent toujours les vraies données de l'index
async function loadAggregations() {
  const resp = await fetch('/api/aggregations');
  const data = await resp.json();

  // Remplissage du menu "Genre"
  const genreSelect = document.getElementById('genre');
  data.genres.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g;
    opt.textContent = g;
    genreSelect.appendChild(opt);
  });

  // Correspondance code ISO → nom lisible pour les langues
  // Les codes viennent directement du champ original_language dans ES
  const langNames = {
    en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch',
    it: 'Italiano', ja: '日本語', ko: '한국어', zh: '中文',
    pt: 'Português', ru: 'Русский', hi: 'हिन्दी'
  };

  // Remplissage du menu "Langue"
  // Si le code n'est pas dans langNames, on affiche le code en majuscules (ex: "ZH")
  const langSelect = document.getElementById('language');
  data.languages.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = langNames[l] || l.toUpperCase();
    langSelect.appendChild(opt);
  });
}

// --- Lecture des valeurs des filtres depuis le formulaire ---
// Regroupés ici pour ne pas dupliquer cette logique dans plusieurs fonctions
function getParams() {
  return {
    q:         document.getElementById('q').value.trim(),
    genre:     document.getElementById('genre').value,
    language:  document.getElementById('language').value,
    year_from: document.getElementById('year_from').value,
    year_to:   document.getElementById('year_to').value,
    sort:      document.getElementById('sort').value,
  };
}

// --- Déclenchement d'une recherche ---
// Appelé soit par le bouton "Rechercher", soit par la pagination, soit par la touche Entrée
// Le paramètre `page` permet de naviguer sans repartir de zéro
async function doSearch(page) {
  currentPage = page;
  const params = getParams();

  // Construction de la query string : tous les filtres + numéro de page
  const qs = new URLSearchParams({ ...params, page });

  // Affichage du spinner pendant la requête ES (peut prendre quelques centaines de ms)
  document.getElementById('results').innerHTML =
    '<div class="loading"><div class="spinner"></div><div>Recherche en cours…</div></div>';
  document.getElementById('results-header').style.display = 'none';
  document.getElementById('pagination').innerHTML = '';

  const resp = await fetch('/api/search?' + qs);
  const data = await resp.json();

  renderResults(data);
}

// --- Affichage des résultats retournés par l'API ---
function renderResults(data) {
  // Bandeau "X résultat(s) — Page N / M"
  const header = document.getElementById('results-header');
  header.style.display = 'flex';
  header.innerHTML = `
    <div>Environ <span>${data.total.toLocaleString()}</span> résultat(s)</div>
    <div>Page ${data.page} / ${data.pages || 1}</div>
  `;

  const container = document.getElementById('results');

  // Cas où ES ne retourne aucun document correspondant aux critères
  if (data.hits.length === 0) {
    container.innerHTML = '<div class="no-results">Aucun film trouvé. Essayez d\'autres critères.</div>';
    return;
  }

  // Construction des cartes films
  container.innerHTML = data.hits.map(m => {
    // Extraction de l'année depuis la date complète (ex: "2010-07-16" → "2010")
    const year = m.release_date ? m.release_date.substring(0, 4) : '—';

    // Couleur de la note : vert si ≥ 7, rouge si < 5, jaune sinon (défaut CSS)
    const avgClass = m.vote_average >= 7 ? 'good' : m.vote_average < 5 ? 'bad' : '';

    // Badges de genre — un film peut appartenir à plusieurs genres
    const genres = (m.genres || [])
      .map(g => `<span class="badge badge-genre">${g}</span>`)
      .join('');

    // Conversion de la durée en minutes vers le format "1h45min"
    const runtime = m.runtime
      ? `${Math.floor(m.runtime / 60)}h${Math.round(m.runtime % 60)}min`
      : '—';

    // Le titre et l'overview peuvent contenir des balises <mark> injectées par ES
    // pour mettre en surbrillance les termes de la recherche — on les laisse passer en innerHTML
    return `
      <div class="movie-card">
        <div>
          <div class="movie-title">${m.title}</div>
          ${m.tagline ? `<div class="movie-tagline">${m.tagline}</div>` : ''}
          <div class="badges">
            ${genres}
            <span class="badge badge-lang">${m.language.toUpperCase()}</span>
            ${m.status ? `<span class="badge badge-status">${m.status}</span>` : ''}
          </div>
          <div class="movie-overview">${m.overview || '<em>Pas de description disponible.</em>'}</div>
          <div class="movie-meta">
            <span>&#128197; <strong>${year}</strong></span>
            <span>&#9200; <strong>${runtime}</strong></span>
            <span>&#128101; <strong>${m.vote_count?.toLocaleString() || 0}</strong> votes</span>
            <span>&#11088; Popularité <strong>${m.popularity?.toFixed(0) || 0}</strong></span>
          </div>
        </div>
        <div class="score-box">
          <div class="vote-avg ${avgClass}">${m.vote_average?.toFixed(1) || '—'}</div>
          <div style="font-size:0.75rem;color:#888;">/ 10</div>
        </div>
      </div>
    `;
  }).join('');

  renderPagination(data);
}

// --- Génération des boutons de pagination ---
// On affiche au maximum 7 boutons centrés sur la page courante
// pour éviter une barre de pagination trop longue sur de grands index
function renderPagination(data) {
  const pag = document.getElementById('pagination');

  // Pas de pagination si tous les résultats tiennent sur une page
  if (data.pages <= 1) { pag.innerHTML = ''; return; }

  const maxButtons = 7;
  let start = Math.max(1, data.page - 3);
  let end   = Math.min(data.pages, start + maxButtons - 1);

  // Recalage de la fenêtre si on est proche de la dernière page
  if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

  let html = `<button onclick="doSearch(${data.page - 1})" ${data.page === 1 ? 'disabled' : ''}>&laquo; Préc.</button>`;

  for (let i = start; i <= end; i++) {
    html += `<button class="${i === data.page ? 'active' : ''}" onclick="doSearch(${i})">${i}</button>`;
  }

  html += `<button onclick="doSearch(${data.page + 1})" ${data.page === data.pages ? 'disabled' : ''}>Suiv. &raquo;</button>`;
  pag.innerHTML = html;
}

// --- Raccourci clavier : Entrée lance la recherche depuis n'importe où dans le champ texte ---
document.getElementById('q').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch(1);
});

// Chargement initial : genres + langues disponibles, puis affichage de tous les films (pas de filtre)
loadAggregations();
doSearch(1);
