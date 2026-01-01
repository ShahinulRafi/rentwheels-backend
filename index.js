const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    
    const database = client.db("carRental");
    const carServices = database.collection("services")

    app.post('/cars', async (req, res) => {
        const car = req.body;
        console.log(car);
        const result = await carServices.insertOne(car);
        res.send(result);
    })

    //get services from data
    app.get('/services', async(req, res) => {
      const result = await carServices.find().toArray();
      res.send(result);
    })

    app.get('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await carServices.findOne(query);
        res.send(result);
    })

    app.get('/myBookings', async (req, res) => {
      const {email} = req.query;
      const query = {email: email}
      const result = await carServices.find(query).toArray();
      res.send(result);
    })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello, World!');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})