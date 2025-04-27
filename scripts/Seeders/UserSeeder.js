const { db } = require("../../lib/firebase");
const { doc, setDoc } = require("firebase/firestore");
const { createUserWithEmailAndPassword, getAuth } = require("firebase/auth");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const fakeUsers = require("../../data/SeedData");

async function seedUsers() {
  const auth = getAuth();

  for (const userData of fakeUsers.users) {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user instance
      const user = new User(
        userData.name,
        userData.email,
        hashedPassword,
      );

      // Add additional fields
      const userWithExtra = {
        ...user,
        uid: userCredential.user.uid,
      };

      // Save to Firestore
      const userDoc = doc(db, "users", userCredential.user.uid);
      await setDoc(userDoc, userWithExtra);

      console.log(`Created user: ${userData.email}`);
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error);
    }
  }
}

seedUsers()
  .then(() => console.log('Seeding completed'))
  .catch(console.error);