import express from "express";
const app = express();
const port = 3000;

import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import createError from "http-errors";

import { MongoClient, ObjectId } from "mongodb";
const connectionString = "mongodb://127.0.0.1:27017/";
const client = new MongoClient(connectionString);
let conn;
try {
  conn = await client.connect();
  console.log("Mongo db connection successfull");
} catch (e) {
  console.error(e);
}
let db = conn.db("nodejs_ottest");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(
  cors({
    origin: "*",
  })
);

// Get a single entry
app.get("/users/:id", async (req, res) => {
  let collection = await db.collection("users");
  let query = { _id: new ObjectId(req.params.id), age: { $gt: 21 } };
  let result = await collection.findOne(query);
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// additional code here
// Add a new document to the collection
app.post("/users", async (req, res) => {
  let collection = await db.collection("users");
  let newDocument = req.body;
  newDocument.date = new Date();
  let result = await collection.insertOne(newDocument);
  res.send(result).status(204);
});

app.put("/users/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const updates = {
    $set: { ...req.body },
  };
  let collection = await db.collection("users");
  let result = await collection.updateOne(query, updates);
  res.send(result).status(200);
});

// Delete an entry
app.delete("/users/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const collection = await db.collection("users");
  let result = await collection.deleteOne(query);
  res.send(result).status(200);
});

// Fetches the latest entry
app.get("/users", async (req, res) => {
  let collection = await db.collection("users");
  let results = await collection
    .aggregate([
      { $project: { age: 1, email: 1, name: 1 } }, // select field
      { $sort: { date: -1 } }, //sorting
      { $limit: 3 }, // limiting result
    ])
    .toArray();
  res.send(results).status(200);
});

app.get("/", (req, res) => {
  res.send("Welcome to Node ExpressJS app!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
