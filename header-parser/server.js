// server.js
// where your node app starts

// init project
var express = require('express')
var bodyParser = require('body-parser')
var nunjucks = require('nunjucks')
var moment = require('moment');
var app = express()

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.set('json spaces', 2);

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

app.get('/ts/:stamp', (req, res) =>  {
  const stamp = req.params.stamp
  const data = {unix: null, natural: null}
  const re = /^[0-9]+$/;
  const unixtime = re.exec(stamp);

  if (moment(stamp).isValid() || unixtime ) {
    const datestring = unixtime ? moment.unix(stamp) : moment(stamp)
    data.natural = datestring.format("MMMM Do, YYYY")
    data.unix = datestring.unix()
  }
  // data is null
  res.json(data)
});

app.get('/header', (req, res) =>  {
  // const ip = req.ip
  const ip = req.get('X-Forwarded-For').split(',')[0]
  const lang = req.get('Accept-Language').split(',')[0]
  const re = /[\(\)]/
  const os = req.get('User-Agent').split(re)[1]
  res.json({ ipaddress: ip, language: lang, software: os} )
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
