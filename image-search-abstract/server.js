// server.js
// where your node app starts

// init project
const express = require('express')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')
const moment = require('moment');
const mongodb = require('mongodb');
const expressMongoDb = require('express-mongo-db');

var app = express()

var url = process.env.MONGOLAB_URI;
app.use(expressMongoDb(url));

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// app.set('json spaces', 2);

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/hello", (req, res) =>  {
  res.render(__dirname + '/views/hello.html', {foo: 'bar'} )
});

app.get('/nuns', (req, res) =>  {
  res.render(__dirname + '/views/nuns.njk', {foo: 'bar'} )
});


// url shortener microservice
// get new url shortcut
app.get('/new/(*)', (req, res) =>  {
  const url = req.params[0]
  const re = /^https?\:\/\/[\-_\w\.]?[\w\\-_]+.[\w\\_\-:]+/
  const validurl = re.exec(url)
  if (validurl) {
    const shortString = randomString(5)
    const shortURL = "https://panoramic-printer.glitch.me/short/" + shortString
    const db = req.db
    const data = { "original_url": url, "short_url": shortString}
    db.collection('urls').insertOne(data, (err, result) => {
      if (err) { throw err }
    });
    res.json({"original_url": url, "short_url": shortURL})
  }

  res.json({error: 'invalid url'})
});

// this blueprint for mongodb connections
app.get('/short/:url', function (req, res) {
  const url = req.params.url
    var db = req.db
  const data = {'short_url': url}
  db.collection('urls').findOne(data, (err, result) => {
    if (err) {
      return console.log(err)
    }
    if (result) {
      res.redirect(result.original_url)
    }
    else {
      res.json({error: 'invalid short url'})
    }
  })
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


function randomString(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}