describe('Frontend Utils - Základní testy', () => {
    function escapeHtml(text = '') {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(text).replace(/[&<>"']/g, ch => map[ch]);
    }

    test('escapeHtml chrání před XSS útoky', () => {
        const dangerous = '<script>alert("XSS")</script>';
        const safe = escapeHtml(dangerous);

        expect(safe).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
        expect(safe).not.toContain('<script>');
    });

    test('escapeHtml zachová běžný text', () => {
        expect(escapeHtml('Normální text bez HTML')).toBe('Normální text bez HTML');
    });
});
