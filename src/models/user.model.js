import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// schema for user
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refereshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// https://expressjs.com/en/guide/using-middleware.html
// pre middleware - before saving or updating its checked password is changed or not
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;

  // bcrypt is used for encrypt data through hashing
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.method.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate access token through jwt
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// generate referesh token through jwt
userSchema.methods.generateRefereshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFERESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
