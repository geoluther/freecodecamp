// FCC exercise tracker app

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const ObjectId = require('mongodb').ObjectID;
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })

// make user schema. move this to models later...
// separate user / exercise model? nah

const userSchema = new mongoose.Schema({
    username:  String,
    exercises: [ { description: String, duration: String, date: Date} ]
})

const User = mongoose.model('User', userSchema);


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.set('json spaces', 2)

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/exercise/add', (req, res) => {
  const id = req.body.userId
  let update = {
    description: req.body.description, 
    duration: req.body.duration,
    date: req.body.date
  }
  
  // A.findByIdAndUpdate(id, update, callback)
  // todo: return a proper error if id isn't found.
  
  User.findByIdAndUpdate(id,
                         {$push: {"exercises": update}},
                         {new : true},
                         (err, data) => {
    if (err) return err
    // console.log(data)
    return res.json(data)
  })
  res.json({ error: `could not find id: ${id}` })
})


app.get('/api/exercise/check-user', (req, res) => {
  if (!req.query.username) return res.json({error: 'no username in query'})
  const user = req.query.username
  console.log(user)
  
  User.findOne({username: user}, (err, data) => {
    if (err) return res.json({"error": err})
    console.log(data)
    if (data === null) return res.json({error: `user ${user} not found`})
    res.json(data)
  })
})

app.post('/api/exercise/new-user', (req, res) => {
  const username = req.body.username
  const user = new User({username: username})
  // enforce unique usersname?
  user.save(function (err, data) {
    if (err) return err;
    console.log(data)
  });
  
  res.json(req.body)
})

// GET /api/exercise/log?{userId}[&from][&to][&limit]
app.get('/api/exercise/log', (req, res) => {
  
  const userID = req.query.userID 
  const obId = ObjectId(userID)
  
  let lim = {}
  let daterange = {} // do i validate dates
  
  let hasLimit = (typeof(req.query.limit) != 'undefined')
  if (hasLimit) lim.$limit = parseInt(req.query.limit)
  
  if (typeof(req.query.from) != 'undefined') daterange.$gte = new Date(req.query.from)
  if (typeof(req.query.to) != 'undefined') daterange.$lte = new Date(req.query.to)
  
  let noDates = ( (typeof(req.query.from) === 'undefined') && (typeof(req.query.to) === 'undefined') )
  
  // console.log("limit:", lim)
  // console.log("date", daterange)
  
  let dateFilter = { 'exercises.date': daterange }
  console.log(dateFilter)
  console.log("no date?:", noDates)
  
  let pipeline = [
    { $match: { _id:  obId } },
    { $unwind: "$exercises" },
    // { $match: { "exercises.date": { $gte: new Date("2018-07-08") } } }
    { $match: dateFilter } // this should be a push below, breaks if no to or from given
  ]
  
  // todo: build pipeline push for date query
  
  if (hasLimit) pipeline.push(lim)
  
  console.log(pipeline)
  // this!
  let query = User.aggregate(pipeline)
  .sort("-exercises.date")
  .exec( (err, data) => {
    console.log("filtered data:", data)
    if (err) return res.json({error: err})
    if (!data.length) return res.json({error: 'no results found'})
    return res.json(data)      
  })

})
// end log
        
// get all users so we can test add exercise
app.get('/api/users', (req, res) => {
  User.find({}, (err, data) => {
    if (err) return err;
    res.json(data)
  })
})

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})