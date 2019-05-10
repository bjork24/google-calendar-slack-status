const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const emojiRegex = require('emoji-regex/text.js');
const nodeEmoji = require('node-emoji');
const slack = require('slack');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 5000;

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const router = express.Router();

app.post('/', (req, res, next) => {
  // check for secret token
  if (!req.body.token || req.body.token !== process.env.SECRET_TOKEN) {
    next();
    return;
  }
  // store token
  const token = process.env.SLACK_TOKEN;
  // log some stuff for dev
  console.log(req.body);
  // grab status and emojis and clean it up
  let status = req.body.title;
  let statusEmoji = nodeEmoji.unemojify('💬');
  const statusHasEmoji = emojiRegex().exec(status);
  if (nodeEmoji.hasEmoji(statusHasEmoji[0])) {
    statusEmoji = nodeEmoji.unemojify(statusHasEmoji[0]);
    status = nodeEmoji.strip(status);
  }
  // additional tokens
  const dndToken = '[DND]';
  const awayToken = '[AWAY]';
  // parse event start/stop time
  const dateFormat = 'MMM D, YYYY [at] hh:mmA';
  const start = moment(req.body.start, dateFormat);
  const end = moment(req.body.end, dateFormat);
  // check for DND
  if (status.includes(dndToken)) {
    slack.dnd.setSnooze({
      token,
      num_minutes: end.diff(start, 'minutes')
    });
    status = status.replace(dndToken, '').trim();
  }
  // check for AWAY
  slack.users.setPresence({
    token,
    presence: status.includes(awayToken) ? 'away' : 'auto'
  });
  if (status.includes(awayToken)) {
    status = status.replace(awayToken, '').trim();
  }
  // set status
  status = `${status} from ${start.format('h:mm')} to ${end.format('h:mm a')} ${process.env.TIME_ZONE}`;
  let profile = JSON.stringify({
    "status_text": status,
    "status_emoji": statusEmoji,
    "status_expiration": end.unix()
  });
  console.log(profile);
  slack.users.profile.set({ token, profile });
  console.log(`Status set as "${status}" and will expire at ${end.format('h:mm a')}`);
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
