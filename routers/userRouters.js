const express = require("express");
const Router = new express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/routerAuth");
require("dotenv").config();

const userControllers = require("../controllers/userControllers");

Router.get("/", (req, res) => {
  res.redirect("/dashboard");
});

/****************** Dashboard ************** */
Router.get("/dashboard", auth, userControllers.userProfile);
// Approv appointment Request page
Router.get(
  "/dashboard/appointment/:appointment_id",
  auth,
  userControllers.approveAppointmentPage
);
// Approv appointment Request
Router.patch(
  "/dashboard/appointment/:appointment_id",
  auth,
  userControllers.approveAppointmentUpdate
);
// Reject appointment Request
Router.delete(
  "/dashboard/reject/:appointment_id",
  auth,
  userControllers.rejectAppointment
);
/****************** Dashboard ************** */

/****************** Doctor authorization route ************** */
Router.get("/dashboard/doctors", auth, userControllers.doctorsList);
Router.get(
  "/dashboard/doctors/:doctor_id",
  auth,
  userControllers.approveDoctor
);
Router.patch(
  "/dashboard/doctors/:doctor_id",
  auth,
  userControllers.approveDoctorUpdate
);
/****************** Doctor authorization route ************** */

Router.get("/account/login", auth, (req, res) => {
  res.render("pages/login-page", { layout: "./layouts/userAuthentication" });
});

Router.get("/account/register", auth, (req, res) => {
  res.render("pages/register-page", {
    layout: "./layouts/userAuthentication",
    title: "Create an Account!",
    actionUrl: "/account/register",
  });
});

Router.get("/account/admin", auth, (req, res) => {
  res.render("pages/register-page", {
    layout: "./layouts/userAuthentication",
    title: "Create Admin Account",
    actionUrl: "/account/admin",
  });
});

Router.get("/account/resetpassword", auth, (req, res) => {
  res.render("pages/forget-password-page", {
    layout: "./layouts/userAuthentication",
  });
});

// Fetch doctor list based on pincode
Router.get("/users/:pincode", userControllers.DoctorsListBasedOnPincode);
//Create Doctor
Router.post("/account/register", auth, userControllers.createDoctorAccount);
// Create Admin
Router.post("/account/admin", auth, userControllers.createAdminAccount);
// User/Admin Login
Router.post("/account/login", auth, userControllers.userLogin);
// User/Admin logout
Router.get("/logout", userControllers.logout);
//User PATCH Method
Router.patch("/account/:id", auth, userControllers.updateUser);

module.exports = Router;
