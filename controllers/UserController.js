const User = require("../models/User");
const { db } = require("../lib/firebase");
const { getDoc, doc, setDoc, collection, getDocs } = require("firebase/firestore");
const { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } = require("firebase/auth");
const bcrypt = require("bcryptjs");
const auth = getAuth();


//* /////////////////////////////////////////////////////
//* /////////////////////////////////////////////////////

// * START OF USER CONTROLLERS

//* /////////////////////////////////////////////////////
//* /////////////////////////////////////////////////////

async function getUsers(req, res) {
  // Get all users from the database
  try {
    const usersCollection = collection(db, "users")
    const usersSnapshot = await getDocs(usersCollection);

    const users = []

    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return res.status(200).json(users);

  } catch (error) {
    console.error("Error getting users: ", error);
    res.status(500).json({ error: "Internal server error" + error });
  }
}

async function getUser(req, res) {
  const { id } = req.params;

  try {
    const userDoc = doc(db, "users", id);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: userSnapshot.id,
      name: userSnapshot.data().name,
      email: userSnapshot.data().email,
      password: userSnapshot.data().password,
      // ...userSnapshot.data().email
    });

  } catch (error) {
    console.error("Error getting user: ", error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}

async function setAdminRole(req, res) {
  const { id } = req.params;

  try {
    const userDoc = doc(db, "users", id);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnapshot.data();

    if (userData.role === "admin") {
      return res.status(400).json({ error: "User is already an admin" });
    }

    // Update user role to admin
    await setDoc(userDoc, { ...userData, role: "admin" }, { merge: true });

    return res.status(200).json({ message: "User role updated to admin", user: { ...userData, role: "admin" } });
  } catch (error) {
    console.error("Error updating user role: ", error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}

async function setUserRole(req, res) {
  const { id } = req.params;

  try {
    const userDoc = doc(db, "users", id);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnapshot.data();

    if (userData.role === "user") {
      return res.status(400).json({ error: "User already has that role" });
    }

    // Update user role to admin
    await setDoc(userDoc, { ...userData, role: "user" }, { merge: true });

    return res.status(200).json({ message: "User role updated to admin", user: { ...userData, role: "user" } });
  } catch (error) {
    console.error("Error updating user role: ", error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;

  try {
    const userDoc = doc(db, "users", id);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete user from Firestore
    await setDoc(userDoc, { deleted: true }, { merge: true });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user: ", error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}


//! ///////////////////////////////////////////////////////
//! ///////////////////////////////////////////////////////


// ! #################################
// * AUTH CONTROLLERS, DO NOT TOUCH AND EVERYTHING SHOULD WORK FINE
// ! #################################


//! ///////////////////////////////////////////////////////
//!  ///////////////////////////////////////////////////////


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
      password
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

async function loginUser(req, res) {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      getAuth(),
      email,
      password
    );

    const userDoc = doc(db, "users", userCredential.user.uid);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    // return res.status(200).json({message: userCredential});
    return res.status(200).json({
      message: "User logged in successfully",
      data: {
        user: {
          id: userSnapshot.id,
          name: userSnapshot.data().name,
          email: userSnapshot.data().email,
          password: userSnapshot.data().password,
        },
        sessionInfo: {
          token: await userCredential.user.getIdToken()
        }
      }
     
    })
  } catch (error) {
    
  }

}

async function logoutUser(req, res) {
  try {
    if(!auth){
      return res.status(400).json({ error: "User is not logged in" });
    }

    await signOut(auth);

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user: ", error);
    return res.status(500).json({ error: "Internal server error" + error });
  }
}



module.exports = {
  registerUser,
  getUsers,
  getUser,
  loginUser,     
  logoutUser,
  setAdminRole,
  setUserRole,
  deleteUser,
};



