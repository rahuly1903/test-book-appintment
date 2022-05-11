const { google } = require("googleapis");
require("dotenv").config();

const { OAuth2 } = google.auth;

const OAuthClient = new OAuth2(process.env.GOAUTH1, process.env.GOAUTH2);

OAuthClient.setCredentials({
  refresh_token: process.env.GTOKEN,
});

const createGoogleMeeting = async (
  appointmentDate,
  doctorName,
  doctorEmail,
  clientName,
  clientEmail
) => {
  const calender = google.calendar({ version: "v3", auth: OAuthClient });
  console.log(appointmentDate);
  const eventDate = new Date(appointmentDate);
  const eventStartTime = eventDate;
  const eventEndTime = new Date(appointmentDate);
  eventEndTime.setMinutes(eventEndTime.getMinutes() + 30);

  const event = {
    summary: "Appointment with Gluton",
    location:
      "Number 11, Marol MIDC Industry Estate, Andheri East, Mumbai, Maharashtra 400069",
    description: "Meeting with Gluton",
    start: {
      dateTime: eventStartTime,
      timeZone: "America/Denver",
    },
    end: {
      dateTime: eventEndTime,
      timeZone: "America/Denver",
    },
    attendees: [
      {
        email: "noreply@glutone.in",
        name: "Gluton Ltd.",
      },
      {
        email: clientEmail,
        name: clientName,
      },
      {
        email: doctorEmail,
        name: doctorName,
      },
    ],
    conferenceData: {
      createRequest: {
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
        requestId: "adfasdf-asdf-asdf",
      },
    },
    colorId: 1,
  };

  console.log(eventStartTime, eventEndTime);

  await calender.freebusy.query(
    {
      resource: {
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        timeZone: "America/Denver",
        items: [{ id: "primary" }],
      },
    },
    (err, res) => {
      if (err) {
        console.error("Calender event creation error", err);
        return false;
      }
      const busyData = res.data.calendars.primary.busy;
      return false;
    }
  );

  try {
    const insertResponce = await calender.events.insert({
      calendarId: "c_ftnu5evpa9ig86afkgrqr74ikk@group.calendar.google.com",
      conferenceDataVersion: 1,
      // sendNotifications: true,
      resource: event,
    });
    // console.log("hellow", insertResponce);
    return insertResponce.data;
  } catch (e) {
    // console.log({ error: e });
    return e;
  }
};

module.exports = { createGoogleMeeting };
