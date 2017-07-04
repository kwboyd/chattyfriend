var express = require('express');
var app = express();
var superagent = require("superagent");

var make_text_message = (texts) => {
  var txt = texts.map((text) => {return {text: text}})
  return {
    messages: txt
  }
};

app.get("/ask_question", function (request, response) {
    console.log('>>> Question endpoint.')

    var query = request.query.search_query
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
           console.log("texts =", texts)
           var textMessage = answer;
          //  var textMessage = make_text_message(texts)
           console.log('textMessage =', textMessage)
           response.send(textMessage);
         }
       });

  });


var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
