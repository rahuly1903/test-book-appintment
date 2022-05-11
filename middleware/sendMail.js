var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;
require("dotenv").config();

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const sendNewAppointmentAlertMail = (
  appointmentDetails,
  doctorEmailID,
  doctorName
) => {
  console.log(appointmentDetails, doctorEmailID, doctorName);
  //   return false;
  var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

  sendSmtpEmail = {
    to: [
      {
        email: doctorEmailID,
        name: doctorName,
      },
      {
        email: "noreply@glutone.in",
        name: "Gluton Ltd.",
      },
    ],
    templateId: 1,
    params: {
      ...appointmentDetails,
      date: "Date: 2022-05-09 Time: 20:00:00",
      hangoutLink: "https://meet.google.com/pju-nwhm-sjg",
    },
    headers: {
      "api-key": process.env.SENDINBLUE_API_KEY,
      "content-type": "application/json",
      accept: "application / json",
    },
  };

  console.log(sendSmtpEmail.params);

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log("New Appointment Alert Notification Mail send: " + data);
    },
    function (error) {
      console.error(error);
    }
  );
};

const sendNewMeetingAlertMail = (
  hangoutLink,
  date,
  doctorName,
  doctorEmail,
  clientName,
  clientEmail
) => {
  console.log(
    hangoutLink,
    date,
    doctorName,
    doctorEmail,
    clientName,
    clientEmail
  );
  //   return false;
  var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

  sendSmtpEmail = {
    to: [
      {
        email: doctorEmail,
        name: doctorName,
      },
      {
        email: clientEmail,
        name: clientName,
      },
      {
        email: "noreply@glutone.in",
        name: "Gluton Ltd.",
      },
    ],
    templateId: 2,
    params: {
      date: date,
      hangoutLink: hangoutLink,
    },
    headers: {
      "api-key": process.env.SENDINBLUE_API_KEY,
      "content-type": "application/json",
      accept: "application / json",
    },
  };

  console.log(sendSmtpEmail.params);

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log("New Appointment Alert Notification Mail send: " + data);
    },
    function (error) {
      console.error(error);
    }
  );
};

module.exports = { sendNewAppointmentAlertMail, sendNewMeetingAlertMail };
