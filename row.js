// https://stackoverflow.com/questions/20534702/node-js-use-of-module-exports-as-a-constructor

// var google = require('googleapis');
// var googleAuth = require('google-auth-library');
// var GoogleSpreadsheet = require('google-spreadsheet');
// var auth = new googleAuth();

var googleAuth = require('google-auth-wrapper');
googleAuth.authorize()

// module.exports.storeRow = function (auth, values) {

function storeRow(auth, google){

    var sheets = google.sheets('v4');
    sheets.spreadsheets.values.append({
      auth: auth,
      spreadsheetId: '1tpeaZ8QkOpEWeaHI79BH-MguuJzV_S_MpIrqAodCwcg',
      range: 'questions',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          // ["09/06/2008", "Lindsay Carbonell", "does this work?", "well, i, guess, we, will, see"]
          values
        ]
      }
    }, function(err, response){
      if (err){
        return err;
      } else {
        return response;
      }
    });


  }

googleAuth.execute('./', 'client_secret', storeRow);
