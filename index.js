require("dotenv").config();
const express = require("express");
const app = express();

const PORT = 3000;

const userController = require("./controllers/UserController");
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// * USER ROUTES
app.get("/get-users", userController.getUsers);
app.get("/get-user/:id", userController.getUser);
// ! AUTH ROUTES

app.post("/register", userController.registerUser);
app.post("/login", userController.loginUser);
app.post("/logout", userController.logoutUser);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
