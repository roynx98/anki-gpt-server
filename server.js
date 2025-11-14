import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const PORT = 3000;

app.use(express.json());

const adapter = new JSONFile('db.json');
const db = new Low(adapter, { concepts: {} });

await db.read();

if (!db.data || !db.data.concepts) {
  db.data = { concepts: {} };
  await db.write();
}

app.post('/add', async (req, res) => {
  try {
    const { concept } = req.body;
    
    if (!concept) {
      return res.status(400).json({ error: 'Concept name is required' });
    }

    db.data.concepts[concept] = db.data.concepts[concept] || 0;
    await db.write();

    res.json({ 
      message: 'Concept added successfully', 
      concept, 
      learningScore: db.data.concepts[concept] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add concept' });
  }
});

app.get('/get', async (req, res) => {
  try {
    await db.read();
    res.json(db.data.concepts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve concepts' });
  }
});

app.listen(PORT, () => {
  console.log(`Anki GPT Server running on http://localhost:${PORT}`);
});
