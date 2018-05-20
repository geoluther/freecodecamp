// server.js
// where your node app starts

// init project
const express = require('express')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')
const moment = require('moment');
const mongodb = require('mongodb');

var app = express()

var url = process.env.MONGOLAB_URI;

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


// image search abstraction layer
app.get('/img/:search', (req, res, next) => {
  const searchterms = req.params.search
  let offset = req.query.offset || 10
  //url, snippet, thumbnail, context
  googleImgClient.search(searchterms, {page: offset})
    .then(images => {
    // const db = req.db
    const data = { "terms": searchterms, "date": new Date()}
    db.collection('search_terms').insertOne(data, (err, result) => {
      if (err) { throw err }
    });

    res.json(images)
    // console.log(images)
  })
  .catch( err => {
    console.log(err)
    res.json({error: "something went wrong"})
  });

});

// show recent queries
app.get('/recent', (req, res, next) => {
  console.log('connected to recent')

  const collection = db.collection('search_terms')

  collection.find({}).sort({ date: -1}).project({'_id': 0}).limit(10).toArray(function(err, docs) {
    // assert.equal(err, null);
    console.log("Found the following records");
    res.json(docs)
  });
  // res.json({'recent': 'results'})
});


// connect to mongodb and start the server
MongoClient.connect(dburi, function (err, client) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to mongodb');
    // do some work here with the database.
    // listen for requests :)
    db = client.db()
    var listener = app.listen(process.env.PORT, function () {
      console.log('Your app is listening on port ' + listener.address().port);
    });
    //Close connection
    // db.close();
  }
});

