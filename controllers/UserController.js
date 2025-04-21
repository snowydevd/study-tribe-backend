const User = require("../models/User");
const { db, checkIfCollectionExists } = require("../lib/firebase");

function registerUser(req, res) {
  const userData = req.body;
  // Validate user data
  if (!userData.name || !userData.email || !userData.password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  try {
    const user = new User(userData.name, userData.email, userData.password);

    db.collection("users")
      .add(user)
      .then((docRef) => {
        console.log("User created with ID: ", docRef.id);
      })
      .catch((error) => {
        console.error("Error creating user: ", error);
      });
  } catch (error) {
    console.error("Error creating user: ", error);
    return res.status(500).json({ error: "Internal server error" + error });
  }
}

function getUsers(req, res) {
  // Get all users from the database
  try {
    db.collection("users")
      .get()
      .then((snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(users);
      })
      .catch((error) => {
        console.error("Error getting users: ", error);
        res.status(500).json({ error: "Internal server error" + error });
      });
  } catch (error) {
    console.error("Error getting users: ", error);
    res.status(500).json({ error: "Internal server error" + error });
  }
}

function getUser(req, res) {
  const { id } = req.params;

  try {
    const doc = db.collection("users").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error getting user: ", error);
    return res.status(500).json({ error: "Internal server error" + error });
  }
}

module.exports = {
  registerUser,
  getUsers,
  getUser,
};
