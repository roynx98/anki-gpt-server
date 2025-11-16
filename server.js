import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const PORT = 3000;

app.use(express.json());

const adapter =  new JSONFile('./data/db.json');
const db = new Low(adapter, { concepts: {} });

await db.read();

if (!db.data || !db.data.concepts) {
  db.data = { concepts: {} };
  await db.write();
}

app.post('/upsert', async (req, res) => {
  try {
    const { concept, learningScore } = req.body;
    
    if (!concept) {
      return res.status(400).json({ error: 'Concept name is required' });
    }

    const score = learningScore !== undefined ? learningScore : 0;

    if (typeof score !== 'number' || score < 0 || score > 1) {
      return res.status(400).json({ error: 'Learning score must be a number between 0 and 1' });
    }

    db.data.concepts[concept] = {
      learningScore: score,
      lastModified: Date.now()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    await db.write();

    res.json({ 
      message: 'Concept added successfully', 
      concept, 
      ...db.data.concepts[concept]
    });
  } catch (error) {
    console.log('error', error);
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
