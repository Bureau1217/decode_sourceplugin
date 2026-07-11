async function init() {
  const [sourcesRes, storage] = await Promise.all([
    fetch(chrome.runtime.getURL("data/sources.json")),
    chrome.storage.local.get("srp_votes"),
  ]);
  const sources = await sourcesRes.json();
  const votes = storage.srp_votes || {};

  const tbody = document.getElementById("sourcesBody");
  sources
    .slice()
    .sort((a, b) => b.trust_score - a.trust_score)
    .forEach((s) => {
      const localVote = (votes[s.source_domain] || {}).userVote || null;
      const agree = (s.validated_count || 0) + (localVote === "agree" ? 1 : 0);
      const disagree =
        (s.invalidated_count || 0) + (localVote === "disagree" ? 1 : 0);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(s.source_name)}</td>
        <td>${escapeHtml(s.source_domain)}</td>
        <td class="score">${s.trust_score}/100</td>
        <td>${escapeHtml(s.trust_score_explanation)}</td>
        <td>${agree}</td>
        <td>${disagree}</td>
      `;
      tbody.appendChild(row);
    });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

init();
