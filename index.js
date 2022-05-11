const express = require("express");
const expressEjsLayout = require("express-ejs-layouts");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cookiesParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 3005;
// mongo database connect
require("./database/dbConnection");
// userRouters
const userRouter = require("./routers/userRouters");
const appointmentRouters = require("./routers/appointmentRouters");

// console log function
const consoleLog = (arg) => console.log(arg);

// Static Files
const assetsPath = path.join(__dirname, "public");
app.use("/", express.static(assetsPath));
app.use("/account", express.static(assetsPath));
app.use("/dashboard", express.static(assetsPath));
app.use("/dashboard/appointment", express.static(assetsPath));
app.use("/dashboard/doctors", express.static(assetsPath));

//***************** Request parser ***************** */
// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));
// create application/json parser
app.use(bodyParser.json());
//***************** Cookies parser ***************** */
app.use(cookiesParser());
//***************** CORS request ***************** */
app.use(cors());

// set template engine
app.set("view engine", "ejs");
app.use(expressEjsLayout);
app.set("layout", "./layouts/dashboard.ejs");

app.use(userRouter);
app.use(appointmentRouters);

app.listen(process.env.PORT, () => {
  consoleLog(`Server is running on port ${process.env.PORT}`);
});

// const main = async () => {
//   // const appointment = await Appointment.findById("6271273ab510f5bef537da4a");
//   // await appointment.populate("doctor");
//   // console.log(appointment.doctor);
//   const user = await User.findById("6270f1d13394e924cc69f903");
//   await user.populate("appointments");
//   console.log(user.appointments);
//   // await user.populate
// };

// main();
