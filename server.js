var express = require('express');
var app = express();
var superagent = require("superagent");
const TextRazor = require('textrazor');
const textRazor = new TextRazor('98d2b4160bce259e9e5ede577635f209f4acd81d5ca8a360ead4779f');
const options = { extractors: 'entities' };
var query;

app.get("/ask_question", function (request, response) {
  console.log('>>> Question asked')
  // endpoint for receiving questions
  query = request.query.search_query

  // send question to q&a maker and respond with answer
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
        var textMessage = {
          messages: [
            {text: answer}
          ]
        }
        // send response back to facebook
        response.send(textMessage);
      }
    });
});

app.get("/store_question", function (request, response) {
  console.log('>>> Storing endpoint.')
  // endpoint for storing question information

  var email = request.query.email;
  var first_name = request.query.first_name;
  var last_name = request.query.last_name;
  var full_name = `${first_name} ${last_name}`;
  var now = new Date();
  var time_asked = getDateTime();

  // send question to textrazor to get category tags
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

    // send question info to google sheets via zapier
    superagent
      .post('https://hooks.zapier.com/hooks/catch/2378437/5dyk2p/')
      .send({
        question: query,
        email: email,
        full_name: full_name,
        keywords: tags,
        time: time_asked
        })
      .set('Content-Type', 'application/json')
      .end(function(err, res) {
        if (err || !res.ok) {
          response.send({answer: "Error: " + err + ", " + JSON.stringify(res)});
        } else {
          console.log(query)
          console.log(email)
          console.log(tags)
          console.log('sent to sheets')
          console.log(JSON.stringify(res))
        }
      });
    }
});

var listener = app.listen(process.env.PORT, function () {
  console.log('App is listening on port ' + listener.address().port);
});

function getDateTime() {
  // returns day/month/year
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;
  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;
  return day + '/' + month + '/' + year;
}
