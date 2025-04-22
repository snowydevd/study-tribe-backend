require("dotenv").config();
const express = require("express");
const app = express();

const PORT = 3000;

const userController = require("./controllers/UserController");
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", userController.registerUser);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
