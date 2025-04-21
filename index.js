require("dotenv").config();
const express = require("express");
const app = express();

const PORT = 3000;

const { registerUser } = require("./controllers/UserController");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", (req, res) => registerUser(req, res));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
