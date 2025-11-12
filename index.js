const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const database = client.db("habitsTrackerDB")
    const habitCollection = database.collection('habits')

    app.get('/featuredHabits', async (req, res)=>{
      const email = req.query.email;
      const query = {}
      if(email){
        query.userEmail = email
      }
      const cursor = habitCollection.find(query).sort({reminderTime:-1}).limit(6)
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/userHabits', async (req, res)=>{
      const cursor = habitCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/userHabits/:id', async (req, res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await habitCollection.findOne(query)
      res.send(result)
    })

    app.post('/addedHabit', async(req,res)=>{
      const newHabit = req.body
      const result = await habitCollection.insertOne(newHabit)
      res.send(result)
    })

      app.patch('/userHabits/:id', async(req, res)=>{
        const id = req.params.id
        console.log(id)
        const updatedHabit = req.body
        const query = {_id: new ObjectId(id)}
        const update = {
            $set:updatedHabit
        }
        const result = await habitCollection.updateOne(query, update)
        res.send(result)
    })

    app.delete('/userHabits/:id', async(req, res)=>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await habitCollection.deleteOne(query)
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