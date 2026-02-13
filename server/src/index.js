const express = require('express');
const cors = require('cors');
const path = require('path');
const languages = require('./languages');
const { runCode } = require('./runner');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve static client build in production.
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

// List supported languages.
app.get('/api/languages', (req, res) => {
  const list = Object.values(languages).map((lang) => ({
    id: lang.id,
    name: lang.name,
    monacoId: lang.monacoId,
  }));
  res.json(list);
});

// Execute code.
app.post('/api/execute', async (req, res) => {
  const { language, code, timeout } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: 'language and code are required' });
  }

  const lang = languages[language];
  if (!lang) {
    return res.status(400).json({ error: `unsupported language: ${language}` });
  }

  const timeoutSeconds = Math.min(Math.max(parseInt(timeout) || 10, 1), 60);

  try {
    const result = await runCode(lang, code, timeoutSeconds);
    res.json(result);
  } catch (err) {
    console.error('execution error:', err.message);
    res.status(500).json({ error: 'execution failed', details: err.message });
  }
});

// SPA fallback.
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`exekute server listening on port ${PORT}`);
});
