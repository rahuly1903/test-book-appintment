const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const res = require("express/lib/response");
require("dotenv").config();

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isUserAuthorize: {
      type: Boolean,
      required: true,
      default: false,
    },
    calenderID: {
      type: String,
      required: true,
      default: "Not Updated",
    },
    role: {
      type: String,
      required: true,
      default: "Doctor",
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("appointments", {
  ref: "Appointment",
  localField: "_id",
  foreignField: "doctor",
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  try {
    const user = await userModel.findOne({ email });
    // console.log(user);
    if (!user) {
      throw new Error();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // console.log(isMatch);
    if (!isMatch) {
      throw new Error();
    }
    return user;
  } catch (e) {
    res.send({ error: "Invalid email or password" });
  }
};

// Hash Password
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const userModel = mongoose.model("User", userSchema);

// console.log(userSchema);

module.exports = userModel;
