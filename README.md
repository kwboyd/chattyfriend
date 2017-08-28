# Mr. Reese
A journalist chatbot using QnAMaker, TextRazor, and Google Sheets. This was created as by Media Innovation Fellows Lindsay Carbonell and Kate Boyd.

This chatbot will answer questions based on a spreadsheet of question/answer pairs. It will tag the question with categories and add the question, tags, and info about the asker to a Google Spreadsheet.

## Setup:

First, clone this repo.
Run `npm install` to install dependencies.

### Services necessary:
Sign up for accounts on each of these sites (free versions on all will suffice):
1. [Microsoft QnAMaker](https://qnamaker.ai/)
2. [Zapier](https://zapier.com)
3. [Chatfuel](https://chatfuel.com/)
4. [Facebook](https://facebook.com/)
4. [Google Sheets](https://sheets.google.com/)
5. [Heroku or your Node.js server of choice](https://www.heroku.com/)
6. [TextRazor](https://www.textrazor.com/)

### Heroku
Create an account and a project. Add the Heroku project as an origin to your local repo.

### TextRazor

After registering for an account, replace the string on line 5 of server.js with your API key
ex: `const textRazor = new TextRazor('api-key')`

### QnAMaker

After registering for an account, create a project and upload your spreadsheet of questions and answers. 
QnAMaker breaks if a spreadsheet has over 4,000 rows or so, so divide the questions into multiple sheets if necessary. 
The first column should be questions and the second column should be answers. No other columns should be present. Do not use headers.

Upload the prepared spreadsheets to QnAMaker and wait for it to train. Feel free to train the AI on your own to improve its understanding.
QnAMaker also tends to break if you try to replace or edit a spreadsheet. It's easier to delete and reupload spreadsheets after you make changes, though it is timeconsuming.

After that is done, publish your project and replace the string on line 14 of server.js with the URL provided.
ex: `.post('https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/('example id')/generateAnswer')`

Make note of the secret key provided.

### Back to Heroku

Under your project settings in Heroku, add the secret key provided by QnAMaker to the Config Variables. The variable name should be `QA_SECRET`.

### Google Sheets

Create a spreadsheet. Give it five columns, with the first row headers as: date_asked, question, asker_full_name,	keywords,	email

### Chatfuel and Facebook

Make a Facebook page for your bot. Then, create a Chatfuel bot connected to that page. 

1. Under build, you will want to edit the Welcome Message block to suit your needs as an intro.

2. Create your blocks. You will need blocks called 'Question Prompt', 'Confirmation', 'Answered', and 'Not answered'

3. Have your Welcome Message block redirect to the Question Prompt block.

4. For the Question Prompt block, add a 'User Input' with a message such as 'What would you like to ask?' and set the Save Answer to Attribute field to {{search_query}}. 

5. Still in the 'Question Prompt' block, add a JSON API plugin. Make it a GET request to `https://(your app's name).herokuapp.com/ask_question?search_query={{search_query}}
--Replace your app's name with your heroku app's name.

6. Add a 'Go To Block' that redirects to the Confirmation block.

7. Under the Confirmation block, add a 'User Input' with a message such as "Did that answer your question (yes/no)?" Set the Save Answer to Attribute to {{confirmation}}.

8. Add a 'Go To Block' with a conditional. Add ('if) {{confirmation}} ('is') "yes" "yeah" "sure" (or whatever other synonyms for yes you can think of). Have this redirect to the 'Answered' block.

9. Add another 'Go To Block' with a conditional. Add ('if') {{confirmation}} ('is') "no" "nah" "nope" (or whatever other synonyms for no you can think of). Have this redirect to the 'Not answered' block.

10. Add a 'Go To Block' to the 'Answered' block. Add a message saying something like "Great! Feel free to ask another question." Have it simply redirect to the question prompt block.

11. Add a 'User Input' to the 'Not answered' block. Add a message such as "Okay! We will forward your question to a reporter. What is your email address so that we can contact you once we've found an answer?" Add a validation for email, then save the answer to the {{email}} attribute.

12. Add a 'JSON API' to the 'Not answered' block. Make a GET request to `https://(your app's name).herokuapp.com/store_question?email={{email}}&first_name={{first name}}&last_name={{last name}}`
Add {{first name}} and {{last name}} to the user attributes.

13. Add a 'Go To Block' to the 'Not answered' block. Have it redirect to the 'Question Prompt' block.

Be sure to publish your chatbot (this can take some time to get approved) and set the messaging settings for your page to use this Chatbot automatically. This will only work in Messenger, not messaging via Facebook. So, it will work in the Messenger mobile app and on the desktop site for Facebook, but not Facebook via mobile browsers.

### Zapier

On Zapier, you will need to create a Zap for "Add info to a Google Sheet from new Webhook POSTs." You will be given a Webhook URL. Change the URL on line 64 of server.js to this hook.

### Heroku

At this point, you will need to publish your heroku app. Push the repo to it and allow it to build. It should automatically detect that it is a Node.js server.

### Back to Zapier

Follow the instructions from Zapier to finish connecting your spreadsheet to your Zap.

You will need to actually send a request to the Zapier Webhook at this point. Use your chatbot to do this, as this is a good chance to check that your blocks are redirecting as they should.

### Finished

You now have a chatbot that can answer user questions! Things can take a long time to work because of all the different APIs used, so don't be worried when it takes a long time for a question to show up in the spreadsheet. If you are having trouble, make sure all your apps are published and public. Users must click 'Get Started' to have the chatbot begin.





