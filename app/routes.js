const { ObjectID, ObjectId } = require("mongodb");

module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) { 
      if(req.user.local.userType ==="researcher"){
      db.collection('studies').find({researcherId: req.user._id}).toArray((err, result) => {
          if (err) return console.log(err)
          console.log('This is the studies: ',result)
          res.render('researcherProfile.ejs', {
            user : req.user,
            studies: result
          })
        })
      }else if (req.user.local.userType ==="participant"){
        db.collection('studies').find().toArray((err, result) => {
          if (err) return console.log(err)
          console.log('This is the studies: ',result)
          res.render('participantProfile.ejs', {
            user : req.user,
            studies: result
          })
        })
      }
    });

    //Research Post=============
  
  // VIEW STUDY ===============================
  app.get('/studyDetails/:currentStudy', isLoggedIn, function(req, res) {
    db.collection('studies').find({_id: ObjectId(req.params.currentStudy)}).toArray((err, result) => {
      console.log('Stud details result : ', result)
      if (err) return console.log(err)
      const study = result[0]
      study.isParticipant = study.participants.indexOf(req.user._id.toString()) !== -1
      console.log('Here is the study: ', study)
      console.log('the user id :[%s]', req.user._id)
      res.render('studyView.ejs', {
        user : req.user,
        study
      })
    })
  });

  app.put('/studySignup/:currentStudy/:participant', (req, res) => {
    // console.log("description: ", req.body.description)
    console.log('parameters: ', req.params.currentStudy , req.params.participant)
    db.collection('studies')
    .findOneAndUpdate({_id: ObjectId(req.params.currentStudy)}, {
      $push: {
        participants: req.params.participant
      }
    }, {
      sort: {_id: -1},
      upsert: false
    }, (err, result) => {
      if (err) return res.send(err)
      res.redirect('/profile')
    })
  })
  


    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });



// STUDY CREATE ===========================================

    app.get('/createStudy', isLoggedIn, function(req, res) {
      db.collection('studies').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('researchPost.ejs', {
          user : req.user,

        })
      })
    });

    app.post('/createStudy', (req, res) => {
      db.collection('studies').insertOne({
        researcherId: ObjectId(req.body.researcherId),
        name: req.body.name, 
        title: req.body.title,
        participants: [],
        type: req.body.type,
        description: req.body.description
        }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })
    app.delete('/createStudy', (req, res) => {
      db.collection('studies').findOneAndDelete({
        title: req.body.title,
        type: req.body.type,
        description: req.body.description
      }, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// EDIT POST ======================================
app.get('/editStudy/:currentStudy', isLoggedIn, function(req, res) {
  db.collection('studies').find({_id: ObjectId(req.params.currentStudy)}).toArray((err, result) => {
    console.log(result)
    if (err) return console.log(err)
    res.render('editStudy.ejs', {
      user : req.user,
      study: result
    })
  })
});

app.put('/editStudy/:currentStudy', (req, res) => {
  // console.log("description: ", req.body.description)
  console.log('parameters: ', req.params.currentStudy)
  db.collection('studies')
  .findOneAndUpdate({_id: ObjectId(req.params.currentStudy)}, {
    $set: {
      name: req.body.name, 
      title: req.body.title,
      type: req.body.type,
      description: req.body.description
    }
  }, {
    sort: {_id: -1},
    upsert: false
  }, (err, result) => {
    if (err) return res.send(err)
    res.redirect('/profile')
  })
})

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
