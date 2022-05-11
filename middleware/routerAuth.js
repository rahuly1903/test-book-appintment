const jwt = require("jsonwebtoken");
require("dotenv").config();
const userModel = require("../models/userModel");
const appointmentModel = require("../models/appointmentModel");
const auth = async (req, res, next) => {
  const jwtCookies = req.cookies.token;
  const pathUrl = req.path;
  //   next();
  if (jwtCookies && pathUrl.indexOf("/account/") > -1) {
    res.redirect("/");
  }
  if (!jwtCookies && pathUrl.indexOf("/dashboard") > -1) {
    res.redirect("/account/login");
  }
  if (!jwtCookies && pathUrl.indexOf("/account") > -1) {
    next();
  }
  if (jwtCookies && pathUrl.indexOf("/dashboard") > -1) {
    try {
      const decoded = jwt.verify(jwtCookies, process.env.SECRET_KEY);
      const user = await userModel.findOne({
        _id: decoded._id,
        "tokens.token": jwtCookies,
      });
      if (!user) {
        throw new Error();
      }

      let allBookAppointment;
      if (user.role == "Admin") {
        allBookAppointment = await appointmentModel.find();
      } else {
        allBookAppointment = await appointmentModel.find({
          doctor: user._id,
        });
      }

      req.user = user;
      req.appointmentMents = allBookAppointment;
      next();
    } catch (e) {
      console.log(e);
    }
  }
};

module.exports = auth;
