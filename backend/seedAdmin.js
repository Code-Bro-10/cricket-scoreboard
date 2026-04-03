const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const username = "master_admin";
    const password = "admin123";

    const existingAdmin = await User.findOne({ username });
    if (existingAdmin) {
      console.log(`Admin user '${username}' already exists.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new User({
      username,
      password: hashedPassword,
      role: "ADMIN"
    });

    await newAdmin.save();
    console.log(`Admin user '${username}' created successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

seedAdmin();
