const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3001;

// boiler plate code that will be in all your express apps
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// sets the static folder on the frontend to public this will allow the filepath
// on the frontend to start at public ie <script src="/js/script.js>"
app.use(express.static("public"));

function readDatabase() {
  // readFileSync is the same as readFile without the callback function
  const fileData = fs.readFileSync("./db/database.json", "utf-8");
  // after the file is read and saved into variable the string needs to be parsed
  // into a javascript object or if failed just return an empty array
  return JSON.parse(fileData) || [];
}

function writeToDatabase(data) {
  // turn data into a string for writeFileSync to be able to write to the
  // designated file
  const json = JSON.stringify(data, null, "\t");
  fs.writeFileSync("./db/database.json", json);
}

// sends a file and is the entry point to the application http://localhost:3001/
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// gets all the leads to send to front end
app.get("/api/get-all", (req, res) => {
  const database = readDatabase();
  res.json(database);
});

// not shown on frontend but will get a single lead
app.get("/api/get-lead/:id", (req, res) => {
  const database = readDatabase();
  const newData = database.filter((lead) => lead.id == req.params.id);
  if (newData.length < 1) {
    res.status(404).end();
    return;
  }
  res.json(newData);
});

// creates a new lead object based on the body sent in the request
app.post("/api/add-lead", (req, res) => {
  const newLead = req.body;
  // crypto package allows to create a unique id for entries
  newLead.id = crypto.randomUUID().substring(1, 10);
  newLead.complete = false;

  console.log(newLead);
  const database = readDatabase();
  // after data is grabbed from the database add new lead to existing array
  database.push(newLead);

  writeToDatabase(database);

  res.json(newLead);
});

// this route is looking for a specific lead to update to complete
app.put("/api/update-lead/:id", (req, res) => {
  const database = readDatabase();
  console.log(req.params.id);
  // loop through existing database to find lead to update
  for (let i = 0; i < database.length; i++) {
    const lead = database[i];

    if (lead.id == req.params.id) {
      lead.complete = req.body.complete;
      writeToDatabase(database);
      // once lead is found and updated send on ok
      return res.status(204).end();
    }
  }
  // if no matching leads were found send a not found status
  res.status(404).end();
});

// same idea of the put route look for a lead to delete
app.delete("/api/delete-lead/:id", (req, res) => {
  const database = readDatabase();
  // check each lead to match the id to the params object id
  const newData = database.filter((lead) => lead.id != req.params.id);
  // if there was no change in the database send a not found
  if (database.length == newData.length) {
    res.status(404).end();
    return;
  }
  writeToDatabase(newData);
  res.status(200).end();
});

app.listen(PORT, () => {
  console.log(`🌎 listening at http://localhost:${PORT}`);
});
