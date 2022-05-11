const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    appointmentStatus: {
      type: String,
      required: true,
      default: "pending",
    },
    isAppointmentDone: {
      type: Boolean,
      required: true,
      default: false,
    },
    meetingLink: {
      type: String,
      required: true,
      default: "Not Updated",
    },
    meetingTime: {
      type: String,
      required: true,
      default: "Not Updated",
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const appointmentModel = mongoose.model("Appointment", appointmentSchema);

// console.log(userSchema);

module.exports = appointmentModel;
