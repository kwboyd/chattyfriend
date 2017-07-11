var express = require('express');
var app = express();
var superagent = require("superagent");
const TextRazor = require('textrazor');
const textRazor = new TextRazor('98d2b4160bce259e9e5ede577635f209f4acd81d5ca8a360ead4779f');
const options = { extractors: 'entities' };
var query;
var first_name;
var last_name;

app.get("/ask_question", function (request, response) {

    query = request.query.search_query

    superagent
       .post('https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/b3058436-c0b3-4b84-bdeb-2ff329663810/generateAnswer')
       .send({ question: query })
       .set('Ocp-Apim-Subscription-Key', process.env.QA_SECRET)
       .set('Content-Type', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           response.send({answer: "Error: " + err + ", " + JSON.stringify(res)});
         } else {
           var answer = res.body.answers[0].answer;
          //  var score = res.body.answers[0].score;
          //  console.log(score)
           var textMessage = {
             messages: [
               {text: answer}
             ]
           }
           response.send(textMessage);
         }
       });

  });

  app.get("/store_question", function (request, response) {
      console.log('>>> Storing endpoint.')

      var email = request.query.email;
      var first_name = request.query.first_name;
      var last_name = request.query.last_name;
      var full_name = `${first_name} ${last_name}`;

             textRazor.exec(query, options)
                 .then(res => parseResults(res))
                 .catch(err => console.error(err));

               function parseResults(res){
                 var entities = res.response.entities;
                 var tags = [];
                 for (i in entities){
                   tags.push(entities[i].entityId);
                 }
                 console.log(tags);
                 var textMessage = {
                   messages: [
                     {text: 'Thank you, your question has been submitted! Feel free to ask another question.'}
                   ]
                 }
                 response.send(textMessage);
             }
             console.log(full_name);
             console.log(email);

             // Load client secrets from a local file.
             fs.readFile('client_secret.json', function processClientSecrets(err, content) {
               if (err) {
                 console.log('Error loading client secret file: ' + err);
                 return;
               }
               // Authorize a client with the loaded credentials, then call the
               // Google Sheets API.
               authorize(JSON.parse(content), doSheetThings);
             });

             /**
              * Create an OAuth2 client with the given credentials, and then execute the
              * given callback function.
              *
              * @param {Object} credentials The authorization client credentials.
              * @param {function} callback The callback to call with the authorized client.
              */
             function authorize(credentials, callback) {
               var clientSecret = credentials.installed.client_secret;
               var clientId = credentials.installed.client_id;
               var redirectUrl = credentials.installed.redirect_uris[0];
               var auth = new googleAuth();
               var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

               // Check if we have previously stored a token.
             // getNewToken(oauth2Client, callback);
               fs.readFile(TOKEN_PATH, function(err, token) {
                 if (err) {
                   getNewToken(oauth2Client, callback);
                 } else {
                   oauth2Client.credentials = JSON.parse(token);
                   callback(oauth2Client);
                 }
               });
             }

             /**
              * Get and store new token after prompting for user authorization, and then
              * execute the given callback with the authorized OAuth2 client.
              *
              * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
              * @param {getEventsCallback} callback The callback to call with the authorized
              *     client.
              */
             function getNewToken(oauth2Client, callback) {
               var authUrl = oauth2Client.generateAuthUrl({
                 access_type: 'offline',
                 scope: SCOPES
               });
               console.log('Authorize this app by visiting this url: ', authUrl);
               var rl = readline.createInterface({
                 input: process.stdin,
                 output: process.stdout
               });
               rl.question('Enter the code from that page here: ', function(code) {
                 rl.close();
                 oauth2Client.getToken(code, function(err, token) {
                   if (err) {
                     console.log('Error while trying to retrieve access token', err);
                     return;
                   }
                   oauth2Client.credentials = token;
                   storeToken(token);
                   callback(oauth2Client);
                 });
               });
             }

             /**
              * Store token to disk be used in later program executions.
              *
              * @param {Object} token The token to store to disk.
              */
             function storeToken(token) {
               try {
                 fs.mkdirSync(TOKEN_DIR);
               } catch (err) {
                 if (err.code != 'EEXIST') {
                   throw err;
                 }
               }
               fs.writeFile(TOKEN_PATH, JSON.stringify(token));
               console.log('Token stored to ' + TOKEN_PATH);
             }

             function doSheetThings(auth) {

               var sheets = google.sheets('v4');
               sheets.spreadsheets.values.append({
                 auth: auth,
                 spreadsheetId: '1tpeaZ8QkOpEWeaHI79BH-MguuJzV_S_MpIrqAodCwcg',
                 range: 'questions',
                 valueInputOption: 'USER_ENTERED',
                 resource: {
                   values: [
                     tags
                   ]
                 }
               }, function(err, response){
                 if (err){
                   console.log(err);
                 } else {
                   console.log(response);
                 }
               });
             }

     });


var listener = app.listen(process.env.PORT, function () {
  console.log('App is listening on port ' + listener.address().port);
});
