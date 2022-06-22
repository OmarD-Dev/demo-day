// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8600;
const MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var methodOverride = require('method-override')
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

var db

// configuration ===============================================================
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, passport, db);
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(methodOverride('_method'))

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'rcbootcamp2021b', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);


// const axios = require('axios').default;
// const { v4: uuidv4 } = require('uuid');

// var key = "NKxjOBxaBS23eI0dj5vZAPnpW4eig5lo/vTQFkPShUcCIdBoB5YEQcSBB17rrTe203WfmPQi35Gr+ASt7Z0q5Q==";
// var endpoint = "https://api.cognitive.microsofttranslator.com";

// // Add your location, also known as region. The default is global.
// // This is required if using a Cognitive Services resource.
// var location = "East US";

// axios({
//     baseURL: endpoint,
//     url: '/translate',
//     method: 'post',
//     headers: {
//         'Ocp-Apim-Subscription-Key': key,
//         'Ocp-Apim-Subscription-Region': location,
//         'Content-type': 'application/json',
//         'X-ClientTraceId': uuidv4().toString()
//     },
//     params: {
//         'api-version': '3.0',
//         'from': 'en',
//         'to': ['de', 'it']
//     },
//     data: [{
//         'text': 'Hello World!'
//     }],
//     responseType: 'json'
// }).then(function(response){
//     console.log(JSON.stringify(response.data, null, 4));
// })
// curl -X POST 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=de' \
// -H 'Ocp-Apim-Subscription-Key: NKxjOBxaBS23eI0dj5vZAPnpW4eig5lo/vTQFkPShUcCIdBoB5YEQcSBB17rrTe203WfmPQi35Gr+ASt7Z0q5Q==' \
// -H 'Content-Type: application/json' \
// --data-raw '[{ "text": "How much for the cup of coffee?" }]' | json_pp

// DefaultEndpointsProtocol=https;AccountName=translationstandard;AccountKey=NKxjOBxaBS23eI0dj5vZAPnpW4eig5lo/vTQFkPShUcCIdBoB5YEQcSBB17rrTe203WfmPQi35Gr+ASt7Z0q5Q==;EndpointSuffix=core.windows.net

