const User = require("../models/User");
const { db } = require("../lib/firebase");
const { getDoc, doc, setDoc, collection, getDocs } = require("firebase/firestore");
const { createUserWithEmailAndPassword, getAuth } = require("firebase/auth");
const bcrypt = require("bcryptjs");
const auth = getAuth();


async function registerUser(req, res) {
  let { name, email, password } = req.body;

  // Validate user data
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" + res });
  }
  // if it doesnt have name, use email as name
  if(!name){
    name = email.split("@")[0];
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userCredential = await createUserWithEmailAndPassword(
      getAuth(),
      email,
      hashedPassword
    );
    const user = new User(name, email, hashedPassword);

    const userDoc = doc(db, "users", userCredential.user.uid);

    await setDoc(userDoc, {
      ...user,
      uid: userCredential.user.uid
    });

    return res.status(200).json({ message: "User created succesfuly, hashed password is: " + hashedPassword });

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
