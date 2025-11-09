const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://userHabitsDB:oSWfyZI5c5Y3WAC1@cluster0.7suxelv.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get("/", (req, res) => {
  res.send("Habit tracker Server is Working");
});

async function run() {
  try {
    await client.connect();
    const database = client.db("userHabits")
    const habitCollection = database.collection('habits')

    app.get('/userHabits', async (req, res)=>{
      const cursor = habitCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Habit tracker is running on port: ${port}`);
});
