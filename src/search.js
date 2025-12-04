document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('searchBox');
    const searchButton = document.querySelector('.btn-search');
    const resultsContainer = document.querySelector('.results');
    const exportButtons = document.querySelector('.export-buttons');
    const exportJsonBtn = document.querySelector('.btn-export-json');
    const exportCsvBtn = document.querySelector('.btn-export-csv');

    let lastResults = null;

    function escapeHtml(text = '') {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(text).replace(/[&<>"']/g, ch => map[ch]);
    }

    searchButton.addEventListener('click', performSearch);
    searchBox.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });

    exportJsonBtn.addEventListener('click', () => {
        if (!lastResults) return;
        const dataStr = JSON.stringify(lastResults, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `search-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    exportCsvBtn.addEventListener('click', () => {
        if (!lastResults) return;

        let csv = 'Title,URL,DisplayLink,Snippet\n';

        lastResults.forEach(item => {
            const title = (item.title || '').replace(/"/g, '""');
            const link = item.link || item.formattedUrl || '';
            const display = (item.displayLink || '').replace(/"/g, '""');
            const snippet = (item.snippet || '').replace(/"/g, '""').replace(/\n/g, ' ');
            csv += `"${title}","${link}","${display}","${snippet}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `search-results-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    async function performSearch() {
        const query = searchBox.value.trim();
        if (!query) {
            resultsContainer.textContent = 'Prosím, zadej hledaný výraz.';
            return;
        }

        resultsContainer.textContent = 'Načítám výsledky...';

        try {
            const response = await fetch('http://localhost:3000/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    num: 10,
                    start: 1,
                    gl: 'cz',
                    hl: 'cs',
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Neznámá chyba' }));
                resultsContainer.textContent = `Chyba ${response.status}: ${errorData.error || 'Chyba serveru'}`;
                return;
            }
            const data = await response.json();
            console.log('Odpověď z backendu:', data);
            if (!data.items || data.items.length === 0) {
                resultsContainer.innerHTML =
                    '<p>Není nalezeno nic pro "<strong>' + escapeHtml(query) + '</strong>".</p>';
                return;
            }

            const html = data.items
                .map(item => {
                    const title = escapeHtml(item.title || 'Bez názvu');
                    const link = escapeHtml(item.link || item.formattedUrl || '#');
                    const display = escapeHtml(item.displayLink || '');
                    const snippet = escapeHtml(item.snippet || '');
                    return `
                    <div class="search-result">
                        <a href="${link}" target="_blank" rel="noopener noreferrer">
                            ${title}
                        </a>
                        <div class="url">${display || link}</div>
                        <p>${snippet}</p>
                    </div>
                `;
                })
                .join('');

            resultsContainer.innerHTML = html;

            lastResults = data.items;
            exportButtons.style.display = 'block';
        } catch (error) {
            resultsContainer.textContent = `Chyba sítě / serveru: ${error.message}`;
            console.error('Fetch error:', error);
        }
    }
});
