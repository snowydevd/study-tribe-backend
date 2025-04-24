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


const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No auth token provided" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Verify the token
    await auth.verifyIdToken(token);
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


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
  verifyToken,
};



