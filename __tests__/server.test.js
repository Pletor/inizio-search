const request = require('supertest');
const express = require('express');
const axios = require('axios');

// Mock axios pro testování bez reálných API volání
jest.mock('axios');

describe('Server API - Základní testy', () => {
    let app;

    beforeEach(() => {
        // Vytvoř testovací app instanci
        app = express();
        app.use(express.json());

        const API_KEY = 'test_api_key';
        const CX = 'test_cx_id';

        // Endpoint z server.js
        app.post('/api/search', async (req, res) => {
            const { query, num = 10, start = 1, gl, hl, googlehost } = req.body || {};

            if (!API_KEY || !CX) {
                return res.status(500).json({
                    error: 'Nesprávná konfigurace serveru: chybí API klíč nebo ID vyhledavače.',
                });
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

                const response = await axios.get(url, { params, timeout: 50000 });
                return res.json(response.data);
            } catch (error) {
                const status =
                    error.response && error.response.status ? error.response.status : 500;
                const message =
                    error.response && error.response.data
                        ? error.response.data
                        : { error: error.message };
                return res.status(status).json({ error: message });
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: Základní validace - chybějící query
    test('Vrátí 400 pokud chybí query', async () => {
        const response = await request(app).post('/api/search').send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Chybějící nebo prázdný dotaz');
    });

    // Test 2: Úspěšné vyhledávání
    test('Vrátí výsledky pro validní dotaz', async () => {
        const mockData = {
            items: [
                {
                    title: 'Test výsledek',
                    link: 'https://example.com',
                    snippet: 'Test snippet',
                    displayLink: 'example.com',
                },
            ],
        };

        axios.get.mockResolvedValue({ data: mockData });

        const response = await request(app).post('/api/search').send({ query: 'strom' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('items');
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0].title).toBe('Test výsledek');
    });

    // Test 3: Zpracování chyb z Google API
    test('Zpracuje chybu z Google API', async () => {
        axios.get.mockRejectedValue({
            response: {
                status: 403,
                data: { error: { message: 'Invalid API key' } },
            },
        });

        const response = await request(app).post('/api/search').send({ query: 'test' });

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error');
    });
});
