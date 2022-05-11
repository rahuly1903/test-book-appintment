const userModel = require("../models/userModel");
const appointmentModel = require("../models/appointmentModel");
const googleMeeting = require("../middleware/googleMeeting");
const sendmail = require("../middleware/sendMail");
const { head, all } = require("../routers/appointmentRouters");
const req = require("express/lib/request");
// const cookiesParser = require("cookie-parser");

const createDoctorAccount = async (req, res) => {
  // console.log(req.body);
  const user = new userModel({
    name: req.body.name,
    email: req.body.email,
    contact: req.body.contact,
    pincode: req.body.pincode,
    password: req.body.password,
  });

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.send({
      msg: "Account created successfully. We will check the details and contact you soon.",
    });
  } catch (e) {
    // res.send({})
    if (e.code) {
      return res.send({
        error: "Account is already exists with this Email id.",
      });
    }
    // res.send({ error: e });
    // console.log(e);
  }
};

const createAdminAccount = async (req, res) => {
  const user = new userModel({
    name: req.body.name,
    email: req.body.email,
    contact: req.body.contact,
    pincode: req.body.pincode,
    password: req.body.password,
    role: "Admin",
  });
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.send({
      msg: "Account created successfully. We will check the details and contact you soon.",
    });
  } catch (e) {
    if (e.code) {
      return res.send({
        error: "Account is already exists with this Email id.",
      });
    }
    console.log(e);
  }
};

const updateUser = async (req, res) => {
  const allowToUpdates = [
    "name",
    "email",
    "contactNumber",
    "pincode",
    "password",
  ];
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every((update) => {
    return allowToUpdates.includes(update);
  });
  if (!isValidUpdate) {
    return res.status(400).send({ error: "Invalid Updates" });
  }
  const _id = req.params.id;

  try {
    const user = await User.findById(req.params.id);
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    if (!responce) {
      res.status(404).send();
    }
    res.send(responce);
  } catch (e) {
    res.status(400).send(e);
  }
};

const userLogin = async (req, res) => {
  try {
    const user = await userModel.findByCredentials(
      req.body.email,
      req.body.password
    );
    const isUserAuthorization = user.isUserAuthorize;
    if (!isUserAuthorization) {
      console.log("isUserAuthorization2", isUserAuthorization);
      res.send({ error: "User is not authorized" });
      return false;
    }
    const token = await user.generateAuthToken();
    res.cookie("token", token);
    res.send({ user, token });
  } catch (e) {
    res.send({ error: "Invalid login credentials" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    console.log(req.cookies.token);
    res.redirect("/account/login");
  } catch (e) {
    console.log("Cookies error");
  }
};

// show doctor on pincode search
const DoctorsListBasedOnPincode = async (req, res) => {
  // console.log("userParams", req.params.userID);
  console.log(req.params.pincode);
  const pincode = req.params.pincode;
  try {
    const userDetails = await userModel.find({ pincode, role: "Doctor" });
    console.log(userDetails);
    res.send(userDetails);
  } catch (e) {
    // res.status(400).send(e);
    console.log(e);
  }
};

// Appointment handling
const approveAppointmentPage = async (req, res) => {
  try {
    const userDetails = req.user;
    const appointment_id = req.params.appointment_id.replace(":", "");
    const appointmentDetails = await appointmentModel.findById(appointment_id);
    await appointmentDetails.populate("doctor");
    const doctorDetails = appointmentDetails.doctor;

    if (appointmentDetails.meetingTime !== "Not Updated") {
      res.redirect("/");
      return false;
    }
    res.render("pages/approve-appointment", {
      userDetails,
      appointmentDetails,
      appointment_id,
      doctorDetails,
    });
  } catch (e) {
    res.redirect("/");
    console.log(e);
  }
};

//
const approveAppointmentUpdate = async (req, res) => {
  console.log(req.body);
  const doctorEmail = req.body.doctorEmail;
  const doctorName = req.body.doctorName;
  const clientName = req.body.name;
  const clientEmail = req.body.email;
  console.log(doctorName, doctorEmail, clientName, clientEmail);
  // return false;
  const appointment_id = req.params.appointment_id.replace(":", "");
  const appointmentDate = req.body.date + " " + req.body.time;
  const meetingResponce = await googleMeeting.createGoogleMeeting(
    appointmentDate,
    doctorName,
    doctorEmail,
    clientName,
    clientEmail
  );
  // return false;
  if (!meetingResponce.code) {
    const standardTime = new Date(meetingResponce.start.dateTime) + "";
    const timeReplace = standardTime.replace(
      "GMT+0530 (India Standard Time)",
      ""
    );
    await appointmentModel.findByIdAndUpdate(appointment_id, {
      $set: {
        meetingLink: meetingResponce.hangoutLink,
        meetingTime: timeReplace,
        appointmentStatus: "confirm",
      },
    });

    await sendmail.sendNewMeetingAlertMail(
      meetingResponce.hangoutLink,
      timeReplace,
      doctorName,
      doctorEmail,
      clientName,
      clientEmail
    );
    res.send({ msg: meetingResponce });
  } else {
    res.send({ error: "Some issue with meeting creation" });
  }
};

const rejectAppointment = async (req, res) => {
  console.log(req.params.appointment_id);
  try {
    const appointment_id = req.params.appointment_id.replace(":", "");
    await appointmentModel.findByIdAndUpdate(appointment_id, {
      $set: {
        appointmentStatus: "declined",
      },
    });
    res.send({ msg: "successfully declined appointment" });
  } catch {
    res.send({ error: "Error in declineing appointment" });
  }
};

const userProfile = async (req, res) => {
  const allAppointments = req.appointmentMents;
  const user = req.user;
  const { status = "pending", limit = 10, page = 1 } = req.query;
  console.log(req.query, req.path);
  let pending = 0;
  let confirm = 0;
  let declined = 0;
  let result, queryResult;
  allAppointments.forEach((obj, index) => {
    if (obj.appointmentStatus == "confirm") confirm += 1;
    if (obj.appointmentStatus == "pending") pending += 1;
    if (obj.appointmentStatus == "declined") declined += 1;
  });
  // Show all appointment status count
  const newAppointmentStatusArray = {
    pending,
    confirm,
    declined,
    all: allAppointments.length,
  };
  // filter out appointment based on status and pagination
  if (!(status == "all")) {
    // result = allAppointments.filter(
    //   (appointment) => appointment.appointmentStatus == status
    // );
    result = await appointmentModel.find({
      doctor: user._id,
      appointmentStatus: status,
    });
    queryResult = await appointmentModel
      .find({
        doctor: user._id,
        appointmentStatus: status,
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
  } else {
    result = await appointmentModel.find({
      doctor: user._id,
    });
    queryResult = await appointmentModel
      .find({
        doctor: user._id,
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
  }
  // render homepage
  try {
    res.render("pages/home-page", {
      heading: `${status} requests`,
      appointmentStatusCount: newAppointmentStatusArray,
      userDetails: user,
      allResult: result,
      allBookAppointment: queryResult,
      totalPage: Math.ceil(result.length / limit),
      currentPage: page,
      limit: limit,
      skip: (page - 1) * limit,
    });
  } catch (e) {
    console.log("error: Invalid User details", e);
  }
};

const doctorsList = async (req, res) => {
  const heading = req.query.status || false;
  const userDetails = req.user;
  let authorize = 0;
  let unauthorize = 0;
  let result;
  console.log(userDetails.role);
  if (userDetails.role == "Doctor") {
    res.redirect("/");
    return false;
  }

  try {
    const allUsers = await userModel.find({
      role: "Doctor",
    });

    allUsers.forEach((obj, index) => {
      obj.isUserAuthorize ? (authorize += 1) : (unauthorize += 1);
    });

    const doctorCountStatus = {
      authorize,
      unauthorize,
      all: allUsers.length,
    };

    if (heading == "authorize") {
      result = allUsers.filter((user) => user.isUserAuthorize == true);
    } else if (heading == "unauthorize") {
      result = allUsers.filter((user) => user.isUserAuthorize == false);
    } else {
      result = allUsers;
    }

    res.render("pages/doctors-list", {
      heading: `${heading} Doctors`,
      users: result,
      doctorCount: doctorCountStatus,
      userDetails: req.user,
    });
  } catch (e) {
    console.log("error: Invalid User details", e);
  }
};

const approveDoctor = async (req, res) => {
  try {
    const userDetails = req.user;
    const doctor_id = req.params.doctor_id.replace(":", "");
    const doctorDetails = await userModel.findById(doctor_id);
    if (!userDetails.role == "Admin") {
      res.redirect("/");
      return false;
    }
    res.render("pages/approve-doctor", {
      userDetails,
      doctorDetails,
      doctor_id,
    });
  } catch (e) {
    res.redirect("/");
    console.log(e);
  }
};
const approveDoctorUpdate = async (req, res) => {
  try {
    console.log(req.body);
    res.send({ msg: req.body });
    await userModel.findByIdAndUpdate(req.body.doctor_id, {
      $set: {
        isUserAuthorize: true,
        calenderID: req.body.calenderID,
      },
    });

    res.send({ msg: "Doctor authorization done successfully." });
  } catch (e) {
    // res.redirect("/");
    console.log(e);
  }
};

module.exports = {
  createDoctorAccount,
  userLogin,
  userProfile,
  DoctorsListBasedOnPincode,
  updateUser,
  createAdminAccount,
  logout,
  approveAppointmentPage,
  approveAppointmentUpdate,
  rejectAppointment,
  doctorsList,
  approveDoctor,
  approveDoctorUpdate,
};
