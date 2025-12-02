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

app.post('/api/search', async (req, res) => { });
