## handyman

![handyman logo](https://i.imgur.com/4gAIkFj.png)

handyman as the name suggest is a handy set of tools that improve the productivity of the customer service agents using **Freshdesk** platform to address issues.

Based on the user feedback, here are some quick tools (recently viewed tickets, bookmark tickets with personal notes, grouped attachments and sentiment analysis) all under one widget that will help you take quick decisions, find what you are looking for faster and also understand the sentiment of the customer's ticket details. 
 
### Features

#### Analyze Customer's Sentiment
Every time a ticket is opened, the tool auto analyses the customer's ticket information and determines the mood/sentiment of the customer using an API and determines the polarity to be either positive, negative or neutral and also determines a score which is 0 for neutral, more than 0 for positive and less than 0 for negative.

> Helps the Agent understand the sensitivity and urgency of the ticket and act accordingly.

#### Bookmarklet
The bookmarklet widget allows the Agent to make a person note of each ticket that they want to visit back later. A bookmark can only be added once and the  Agent can also delete his bookmarks and add them back with a new personal note. All bookmarks are visible once the Agent opens a ticket. 

> Helps the Agent to make a note against tickets and keep track of what action needs to be taken.

#### Recently Viewed Tickets
This simple tool allows the Agent to view the last few tickets seen. The number of tickets to be tracked can be set while installing the Handyman app itself.

#### Attachments Assist

Attachments Assist gives you a quick glimpse of all the attachments in a ticket's thread. As a customer service agent, this makes it a breeze for you to view all attachments in one place instead of you scrolling through the ticket to find these.

This widget also lets you download any of the attachment you like or preview it instantly in a new tab and take faster decisions.

If you as the agent are aware of the file size of the attachment, you can also quickly do a search and find the attachment you are looking for.  

> Make it easy to find all attachments in one place especially for tickets that have responses spanning over weeks and months.

**Requirements**
After clicking the install button,
1. In the Settings page, you will need to enter your Freshdesk API key to authenticate 
2. After the Freshdesk authentication, click the Install button to finish the installation
You are now good to go!

| Feature/API | Purpose & Description  |
| --- | --- |
| Installation Parameters | Installation parameters are used to store the API Key of the current user and also the total number of tickets to be tracked for "Recently Viewed" widget. | 
| Conversations | Conversations consist of replies as well as public and private notes added to a ticket. This is used to fetch the attachments of the current ticket opened by the Agent.|
| App lifecycle methods | To load recently viewed tickets, get agent information to get all their bookmarks, get current ticket to analyse the sentiment of the customer. | 
| Serverless app | Data operations are performed on server side instead of client side for persistent store |
| Data Storage & Storage API | To store/retrieve/delete the tickets of agent |
| Data Method | 1. To get current logged in user details <br/>2.  To get current domain <br/> 3. To get current ticket details | 
| Server Method Invocation | Calling server side to store/retrieve/delete data |

### Project Pitch Video

[![handyman - pitch video](http://img.youtube.com/vi/OKv9gQWu3GY/maxresdefault.jpg)](http://www.youtube.com/watch?v=OKv9gQWu3GY "Handyman | The Freshworks Refresh App Challenge Submission")

### Roadmap & Known Issues

 - [ ] Attachment information to be shown in a Modal for the Agent to view all the information from the ticket page itself. 
 - [ ] Add delete functionality to attachments for Agents.  
 - [ ] Add domain field in the Installation page Customize the installation page with APIs. 
 - [ ] Better tracking of recently viewed tickets and enabling de-duplications.
 - [ ] Refactoring the code and better error handling acrosst he app.

### Credits

 - Base: [Bookmark Tickets](https://github.com/freshworks/marketplace-sample-apps/tree/master/Freshworks-Samples/Freshdesk/bookmark_tickets)
 - Example by Freshworks team  [SENTIM-API](https://sentim-api.herokuapp.com/) - A free API for sentiment analysis