describe('Frontend Utils - Základní testy', () => {
    // escapeHtml funkce (kopie z search.js)
    function escapeHtml(text = '') {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(text).replace(/[&<>"']/g, ch => map[ch]);
    }

    // Test 1: XSS ochrana
    test('escapeHtml chrání před XSS útoky', () => {
        const dangerous = '<script>alert("XSS")</script>';
        const safe = escapeHtml(dangerous);

        expect(safe).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
        expect(safe).not.toContain('<script>');
    });

    // Test 2: Běžný text zůstane nezměněný
    test('escapeHtml zachová běžný text', () => {
        expect(escapeHtml('Normální text bez HTML')).toBe('Normální text bez HTML');
    });
});
