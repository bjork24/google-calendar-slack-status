# Sync your Slack status with G Calendar because nothing is sacred anymore #
## What you’ll need ##
You’ll only need two things to get this up and running:  

* An IFTTT account  
* A Heroku account  

## How this whole thing is gonna go down ##
1. You’re gonna set up an account on IFTTT and tell it to monitor Google Calendar.  
2. Whenever a new event starts, IFTTT will grab all the details and send them to a Node server (running on Heroku) via JSON.  
3. Your Node server will parse the JSON and update your Slack status via Slack’s API.  

### Part 1: Setting up your Node server on Heroku ###
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)  
1. Deploy this repo to Heroku by clicking the big button that says “Deploy to Heroku.”  
2. Give your app a unique name. This will be part of your server’s URL, so make it memorable!  
3. Paste your Slack user token, which you can find here, into the SLACK_TOKEN field. Choose the workspace you’d like to use, and copy (or generate) the token.  
4. Put a secret word or phrase in the SECRET_TOKEN field. You might even sprinkle in some emoji if you’re feeling particularly 😏.  
5. Finally, specify which time zone you’re working from in the TIME_ZONE field. (Fargo is in CST)  
6. Click the “Deploy App” button and wait for Heroku to do its thing.  
7. When everything is finished, you should see “Your app was successfully deployed.” and a button to view your newly provisioned app. Click that button.  
![server running](https://cdn-images-1.medium.com/max/800/1*_vlOOhgf3f5XLIKG0HRsaw.png)  
If you see this screen, you’re ready for part 2  

### Part 2: Setting up IFTTT ###
1. Head over to IFTTT and make sure you’re logged in.  
2. Click the “My Applets” link at the top of the page.  
3. Click the “New Applet” button.  
4. Click the “+ This” and type “Google Calendar.”  
5. Click on the Google Calendar button.  
6. If you haven’t already, you’ll be prompted to connect your calendar to IFTTT, so go ahead and do that.  
7. For your action, click on “Any event starts.”  
8. Choose the calendar you want to monitor, leave the “Time before event starts” at “0 minutes,” and click the “Create trigger” button.  
9. Click the “+ That” and type “Webhooks.”  
10. Click the Webhooks button and connect (if needed).  
11. Choose the “Make a web request” action.  
12. In the URL field, paste your Heroku server’s URL. In the example above, it would be https://bjork-lover.herokuapp.com  
13. Set the method to “POST” and the content type to “application/json.”  
14. Finally, for the body field, paste the JSON object that was listed on your server’s home page. In our case, it’s this:  
```
{
  "title":"<<<{{Title}}>>>",
  "start":"{{Starts}}",
  "end":"{{Ends}}",
  "token": "👻 bjork is so cool 🍄"
}
```
15. Click the “Create Action” button.  
16. Smash the “Finish” button on the next page, and you’re all set!  

## Tips and tricks ##
If you haven’t already, start filling every available minute of your calendar with events. Whenever you need some extra focus, simply append “[DND]” to the title of your event and let the code take care of the rest.  

If you ever need to turn this damn thing off, you can do that by either deactivating the applet in IFTTT or deleting the app from your Heroku dashboard.  

For the original, check out the Medium post here: [Syncing your Slack status with Google Calendar because nothing is sacred anymore](https://medium.com/@bjork24/syncing-your-slack-status-with-google-calendar-because-nothing-is-sacred-anymore-3032bd171770). Otherwise, click the button below to begin your journey:  

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
