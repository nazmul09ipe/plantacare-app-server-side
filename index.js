const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pca4tsp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
  
    await client.connect();
    const plantsCollection = client.db('plantDb').collection('plants');

    console.log(" MongoDB Connected & Routes are ready!");

    // ---------------------------
    // GET all plants or filter by careLevel
    // ---------------------------
    app.get('/plants', async (req, res) => {
      try {
        const { careLevel } = req.query;
        const query = {};
        if (careLevel) query.careLevel = careLevel;

        const plants = await plantsCollection.find(query).toArray();
        res.json(plants);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch plants" });
      }
    });

    // ---------------------------
    // GET single plant by ID
    // ---------------------------
    app.get('/plants/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const plant = await plantsCollection.findOne({ _id: new ObjectId(id) });
        if (!plant) return res.status(404).json({ error: "Plant not found" });
        res.json(plant);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch plant" });
      }
    });

    // ---------------------------
    // POST new plant
    // ---------------------------
    app.post('/plants', async (req, res) => {
      try {
        const newPlant = req.body;
        const result = await plantsCollection.insertOne(newPlant);
        res.json(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add plant" });
      }
    });

    // ---------------------------
    // UPDATE plant by ID
    // ---------------------------
    app.put('/plants/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedPlant = req.body;
        const result = await plantsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedPlant },
          { upsert: true }
        );
        res.json(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update plant" });
      }
    });

    // ---------------------------
    // DELETE plant by ID
    // ---------------------------
    app.delete('/plants/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await plantsCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete plant" });
      }
    });

    // ---------------------------
    // Root route
    // ---------------------------
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    // Start server after DB connection
    app.listen(port, () => console.log(`Server running on port ${port}`));

  } catch (err) {
    console.error(" Failed to connect MongoDB:", err);
  }
}

run().catch(console.dir);
