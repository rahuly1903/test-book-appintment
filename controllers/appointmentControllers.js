const appintmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModel");
const sendmail = require("../middleware/sendMail");
// const cookiesParser = require("cookie-parser");

const addAppointment = async (req, res) => {
  const appointmentInstance = new appintmentModel({
    name: req.body.name,
    email: req.body.email,
    number: req.body.number,
    pincode: req.body.pincode,
    doctor: req.body.doctor_id,
  });

  try {
    const newAppointment = await appointmentInstance.save();
    const user = await userModel.find({ _id: newAppointment.doctor });
    await sendmail.sendNewAppointmentAlertMail(
      newAppointment,
      user[0].email,
      user[0].name
    );
    res.send({ msg: "Request Accepted. We will reach you soon." });
    // const
  } catch (e) {
    console.error("Something wrong in userCreation", e);
    res.send({ msg: "Please enter Valid Details" });
  }
};

const updateAppointment = async (req, res) => {
  // const reqEmail = req.pramas.email;
  console.log(req.params);
  try {
    const userDetails = await appintmentModel.updateMany(
      { doctor_email_id: "sadhana@gmail.com" },
      { $set: { doctor_email_id: "nitin123@gmail.com" } }
    );
    res.send(userDetails);
  } catch (e) {
    res.status(404).send(e);
  }
};

module.exports = {
  addAppointment,
  updateAppointment,
};
