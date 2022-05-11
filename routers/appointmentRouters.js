const express = require("express");
const Router = express.Router();

const appointmentControllers = require("../controllers/appointmentControllers");

Router.post("/profile/addAppointment", appointmentControllers.addAppointment);
Router.patch(
  "/profile/doctoremail/:email",
  appointmentControllers.updateAppointment
);

module.exports = Router;
