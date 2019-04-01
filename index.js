const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const slack = require('slack');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 5000;

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();

// Body Format:
// {
//     "title": "<<<{{Title}}>>>",
//     "start":"{{Starts}}",
//     "end":"{{Ends}}",
//     "token": "xXx"
// }

app.post('/', (req, res, next) => {
  // check for secret token
  if (!req.body.token || req.body.token !== process.env.SECRET_TOKEN) next();
  // grab status and clean it up
  let status = req.body.title;
  const dndToken = '[DND]';
  // parse event start/stop time
  const dateFormat = 'MMM D, YYYY [at] hh:mmA';
  const start = moment(req.body.start, dateFormat);
  const end = moment(req.body.end, dateFormat);
  let endTime = end.unix() - 4200; // CST / GMT-6

  const twelveHours = start.add(12, "hours");
  if (end.isAfter(twelveHours)) next(); // Don't include events longer than 12 hours. (all day events)

  // check for DND
  if (status.includes(dndToken)) {
    slack.dnd.setSnooze({
      token: process.env.SLACK_TOKEN,
      num_minutes: end.diff(start, 'minutes')
    });
    status = status.replace(dndToken, '');
  }
  // set status
  slack.users.profile.set({
    token: process.env.SLACK_TOKEN,
    profile: JSON.stringify({
      "status_text": `${status}`, // the text to be displayed
      "status_emoji": process.env.STATUS_EMOJI, // emoji
      "status_expiration": endTime // setting the expiration time for the status
    })
  });
  res.status(200);
  res.send('🤘');
});

app.get('/', (req, res, next) => {
  // welcome message
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome!</title>
        <style>
          pre {
            background-color: #DDD;
            padding: 1em;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <h1>Your Heroku server is running!</h1>
        <p>You'll need the following information for your IFTTT recipe:</p>
        <h3>Body</h3>
<pre>{
  "title":"<<<{{Title}}>>>",
  "start":"{{Starts}}",
  "end":"{{Ends}}",
  "token": "${process.env.SECRET_TOKEN}"
}</pre>
      </body>
    </html>
  `);
});

app.use((req, res, next) => {
  res.status(404);
  res.send('Not found');
});

app.listen(port);
console.log(`Server running on port ${port}`);
