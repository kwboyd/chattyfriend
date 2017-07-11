var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

module.exports.auth = new googleAuth();


module.exports.authorizeToken = function() {
  async.waterfall(
    [
      //authorize
      function(credentials, callback) {
        // Load client secrets from a local file.
        fs.readFile('client_secret.json', function processClientSecrets(err, content) {
          if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
          }
          // Authorize a client with the loaded credentials, then call the
          // Google Sheets API.
          // authorize(JSON.parse(content), doSheetThings);
          credentials = JSON.parse(content);

          console.log(credentials)

          var clientSecret = credentials.installed.client_secret;
          var clientId = credentials.installed.client_id;
          var redirectUrl = credentials.installed.redirect_uris[0];
          var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

          // Check if we have previously stored a token.
        //getNewToken(oauth2Client, callback);
          fs.readFile(TOKEN_PATH, function(err, token) {
            if (err) {
              getNewToken(oauth2Client, callback);
              console.log("err")
            } else {
              oauth2Client.credentials = JSON.parse(token);
              callback(oauth2Client);
              console.log('no')
            }
          });
        });



      },

      //GET NEW TOKEN
      function(oauth2Client, callback) {
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
      },

      //STORE TOKEN
      function(token){
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
    ]
  );
}
