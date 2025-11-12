const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://userHabitsDB:oSWfyZI5c5Y3WAC1@cluster0.7suxelv.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Habit tracker Server is Working");
});

async function run() {
  try {
    await client.connect();
    const database = client.db("habitsTrackerDB");
    const habitCollection = database.collection("habits");

    app.get("/featuredHabits", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.userEmail = email;
      }
      const cursor = habitCollection
        .find(query)
        .sort({ reminderTime: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/userHabits", async (req, res) => {
      const cursor = habitCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/userHabits/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await habitCollection.findOne(query);
      res.send(result);
    });

    app.post("/addedHabit", async (req, res) => {
      const newHabit = req.body;
      const result = await habitCollection.insertOne(newHabit);
      res.send(result);
    });

    app.patch("/userHabits/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const updatedHabit = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updatedHabit,
      };
      const result = await habitCollection.updateOne(query, update);
      res.send(result);
    });

    app.patch("/userHabits/:id/complete", async (req, res) => {
      const id = req.params.id;

      const habit = await habitCollection.findOne({ _id: new ObjectId(id) });
      if (!habit) return res.status(404).send({ message: "Habit not found" });

      const completionHistory = habit.completionHistory || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastDate = completionHistory.length
        ? new Date(completionHistory[completionHistory.length - 1])
        : null;

      if (lastDate && lastDate.toDateString() === today.toDateString()) {
        return res.status(400).send({ message: "Already marked today" });
      }

      await habitCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { completionHistory: today } }
      );

      const history = [...completionHistory, today].sort(
        (a, b) => new Date(b) - new Date(a)
      );

      let streak = 1;
      for (let i = 1; i < history.length; i++) {
        const diff =
          (new Date(history[i - 1]) - new Date(history[i])) /
          (1000 * 60 * 60 * 24);
        if (diff === 1) streak++;
        else break;
      }

      await habitCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { currentStreak: streak } }
      );

      res.send({ message: "Habit marked complete", currentStreak: streak });
    });

    app.delete("/userHabits/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await habitCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Habit tracker is running on port: ${port}`);
});
