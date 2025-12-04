require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_ID_SEARCH;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.post('/api/search', async (req, res) => {
    const { query, num = 10, start = 1, gl, hl, googlehost } = req.body || {};

    if (!API_KEY || !CX) {
        return res
            .status(500)
            .json({ error: 'Nesprávná konfigurace serveru: chybí API klíč nebo ID vyhledavače.' });
    }
    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ error: 'Chybějící nebo prázdný dotaz.' });
    }

    try {
        const url = 'https://www.googleapis.com/customsearch/v1';
        const params = {
            key: API_KEY,
            cx: CX,
            q: query.trim(),
            num,
            start,
        };
        if (gl) params.gl = gl;
        if (hl) params.hl = hl;
        if (googlehost) params.googlehost = googlehost;

        console.log('Odesílání požadavku na Google Custom Search API s parametry:', params);

        const response = await axios.get(url, { params, timeout: 50000 });
        return res.json(response.data);
    } catch (error) {
        console.error(
            'Chyba při volání Google Custom Search API:',
            error.response ? error.response.data : error.message
        );

        const status = error.response && error.response.status ? error.response.status : 500;
        const message =
            error.response && error.response.data ? error.response.data : { error: error.message };
        return res.status(status).json({ error: message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server běží na http://localhost:${PORT}`);
});
