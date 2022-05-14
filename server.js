const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

function readDatabase() {
  const fileData = fs.readFileSync("./db/database.json", "utf-8");

  return JSON.parse(fileData) || [];
}

function writeToDatabase(data) {
  const json = JSON.stringify(data, null, "\t");
  fs.writeFileSync("./db/database.json", json);
}

// sends a file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// gets data to send to front end
app.get("/api/get-all", (req, res) => {
  const database = readDatabase();
  res.json(database);
});

app.get("/api/get-lead/:id", (req, res) => {
  const database = readDatabase();
  const newData = database.filter((lead) => lead.id == req.params.id);
  if (newData.length < 1) {
    res.status(404).end();
    return;
  }
  res.json(newData);
});

app.post("/api/add-lead", (req, res) => {
  const newLead = req.body;
  newLead.id = crypto.randomUUID().substring(1, 10);
  newLead.complete = false;

  console.log(newLead);
  const database = readDatabase();

  database.push(newLead);

  writeToDatabase(database);

  res.json(newLead);
});

app.put("/api/update-lead/:id", (req, res) => {
  const database = readDatabase();
  console.log(req.params.id);
  for (let i = 0; i < database.length; i++) {
    const lead = database[i];

    if (lead.id == req.params.id) {
      lead.complete = req.body.complete;
      writeToDatabase(database);
      return res.status(204).end();
    }
  }
  res.status(404).end();
});

app.delete("/api/delete-lead/:id", (req, res) => {
  const database = readDatabase();
  const newData = database.filter((lead) => lead.id != req.params.id);
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
