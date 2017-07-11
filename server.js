var express = require('express');
var app = express();
var superagent = require("superagent");
const TextRazor = require('textrazor');
const textRazor = new TextRazor('98d2b4160bce259e9e5ede577635f209f4acd81d5ca8a360ead4779f');
const options = { extractors: 'entities' };


app.get("/ask_question", function (request, response) {
    console.log('>>> Question endpoint.')

    var query = request.query.search_query
    var first_name = request.query.first_name;
    var last_name = request.query.last_name;
    console.log("search_query = ", query)

    superagent
       .post('https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/b3058436-c0b3-4b84-bdeb-2ff329663810/generateAnswer')
       .send({ question: query })
       .set('Ocp-Apim-Subscription-Key', process.env.QA_SECRET)
       .set('Content-Type', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           response.send({answer: "Oh no! error = " + err + ", " + JSON.stringify(res)});
         } else {
           console.log("res.body =", res.body)
           var answer = res.body.answers[0].answer;
           var score = res.body.answers[0].score;
           console.log(score)
           var textMessage = {
             messages: [
               {text: answer}
             ]
           }
           console.log('textMessage =', textMessage)
           response.send(textMessage);
           textRazor.exec(query, options)
               .then(res => parseResults(res))
               .catch(err => console.error(err));

             function parseResults(res){
               const entities = res.response.entities;
               var tags = [];
               // console.log(JSON.stringify(res, null, 4))
              console.log(entities);
               for (i in entities){
                 tags.push(entities[i].entityId);
               }
               console.log(tags);
           }
         }
       });

  });


var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
