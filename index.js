const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path  = require('path');
const app = express();
const ejs = require('ejs');
const randomstring = require('randomstring');
const bcryptNodejs = require('bcrypt-nodejs');
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var passport = require("passport");
var passport1 = require("passport");
var passportLocal = require("passport-local").Strategy;
var session = require("express-session");
var cookieParser = require("cookie-parser");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var nodemailer = require("nodemailer");
var localStorage = require('local-storage');


var forgotpassworduser;

//setting up nodemailer
//https://myaccount.google.com/lesssecureapps visit this link and turn on the feature
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gcgcgc926@gmail.com',
    pass: 'Chaitanyagupta@1'
  }
});


mongoose.connect('mongod://mongodb://localhost:27017/userDetails',{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const User = require('./views/models/users.js');
const Ngo = require('./views/models/ngos.js');
app.use(cors());



app.use(cookieParser("secret"));
var expiryDate = new Date(Date.now()+100000);
//configuration of passport
app.use(session({
    secret: "cookies",
    resave: false,
    saveUninitialized: false,
    expires:expiryDate
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//app will use this middleware every time whenever app will get refresh or start
app.use(function(req,res,next){
    // res.locals.name = req.user.username ;
    res.locals.successMessage = req.flash("success");
    res.locals.errorMessage = req.flash("error");
    res.locals.loadingMessage = req.flash("loading");
    res.locals.user = req.flash('userLogin');

    console.log(res.locals);
    next();
});


app.get('/', function(req, res){
  console.log("inside /");
  console.log(JSON.parse(localStorage.get("user")));
  res.render("home",{user:JSON.parse(localStorage.get("user"))});
});

app.get('/userLogin',function(req,res){
  res.render("user_login",{user:undefined});
});

app.get('/myProfile',function(req,res){
  res.render("myprofile",{user:JSON.parse(localStorage.get("user"))})
})


app.get('/userSignup',function(req,res){
  res.render("user_signup",{user:undefined});
});

app.get('/SignupOption',function(req,res){
  res.render("SignupOption",{user:undefined})
});

app.get('/LoginOption',function(req,res){
  res.render("LoginOption",{user:undefined})
});

app.get('/userLogin/forgotPassword', function(req, res){
  res.render("forgot_password",{user:undefined});
});

app.get('/contact', function(req, res){
  res.render("contact",{user:JSON.parse(localStorage.get("user"))});
});

app.get('/about', function(req, res){
  res.render("about",{user:JSON.parse(localStorage.get("user"))})
});

app.get('/ngo-registration', function(req, res){
  res.render("ngo-registration",{user:JSON.parse(localStorage.get("user"))})
});

app.get('/ngo-login',function(req,res){
  res.render("ngo-login",{user:JSON.parse(localStorage.get("user"))})
})

app.get("ngoProfile",function(req,res){
  res.render("ngoProfile",{user:JSON.parse(localStorage.get("user"))})
})

app.get('/needy_registration', function(req, res){
  res.render("needy_registration",{user:JSON.parse(localStorage.get("user"))});
});

app.get('/verify', function(req, res) {
  res.render("verify",{user:undefined});
});

app.get('/verifyNgo', function(req, res) {
  res.render("verifyNgo",{user:undefined});
});

app.get('/changepassword', function(req, res) {
  res.render("changepassword",{user:undefined});
});

app.post('/changepassword', function(req, res) {
  const password = req.body.password;
  const password2 = req.body.password2;

  if(password !== password2) {
    req.flash("error","Passwords don't match");
    res.redirect('/changepassword');
    return;
  }
  //change password in forgotpassworduser using bcrypt
});

app.post('/verify', function(req, res) {
  const token = req.body.token;
  console.log(token);
  User.findOne({'token':token}, function(err, result) {
    if(err) throw err;
    if(result) {
      result.active = true;
      result.save();
      console.log("Verified!!");
      req.flash("success", "Successfully activated account, now you may sign in");
      res.redirect("/");
    }
    else {
      console.log("No user found with that token");
      req.flash("error", "No user found with that token");
      res.redirect("/");
    }
  });
});

app.post('/verifyNgo', function(req, res) {
  const token = req.body.token;
  console.log(token);
  Ngo.findOne({'token':token}, function(err, result) {
    if(err) throw err;
    if(result) {
      result.active = true;
      result.save();
      console.log("Verified!!");
      req.flash("success", "Successfully activated account, now you may sign in");
      res.redirect("/");
    }
    else {
      console.log("No NGO found with that token");
      req.flash("error", "No NGO found with that token");
      res.redirect("/");
    }
  });
});

app.post('/userLogin/forgotPassword', function(req, res){
  const email = req.body.email;
  User.findOne({'email':email}, function(err, result) {
    if(result) {
      forgotpassworduser = result;
    }
    else {
      console.log("No user found with that email");
      req.flash("No such user found");
      res.redirect('/userLogin/forgotPassword');
      return;
    }
  });
  console.log(email);
  var mailOptions = {
    from: 'gcgcgc926@gmail.com',
    to: ''+email,
    subject: 'Forgot your password?',
    html: `<h1>Click on the link given below to change password</h1>
           <br><br> <a href="http://localhost:3000/changepassword">Change password</a>`
  };
  transporter.sendMail(mailOptions, function(error, info) {
    if(error) console.log(error);
    else {
      console.log("email sent "+ info.response);
    }
  });
  req.flash("success","An email has been sent for password recovery");
  res.redirect("/");
});

app.post('/userSignupPost',function(req,res){
  //req.body
  console.log(req.body);

  const fullname = req.body.fullname;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword;
  const token = randomstring.generate();
  var newUser;
  if (password != confirmpassword){

    console.log("Password not matched");
    req.flash('error',"Password not matched");
    res.redirect('/userSignup');

    return;
  }




  User.find({email:email},function(err,allUsers){
    if (err){
      console.log(err);
    }else{
      if (allUsers.length == 0){
        //we can create a new User
        //use bcrypt

          newUser = new User({
            fullname:fullname,
            username:username,
            email:email,
            password:password,
            token:token //email verification
          });


        bcryptNodejs.hash(req.body.password, null, null, (err, hash)=> {
            if (err){
                console.log(err);
                req.flash("error",err.message);
            }else{

                newUser.password = hash;
                console.log("Hash: ",hash);
                User.register(newUser,req.body.password,(err,user)=>{
                    if (err){
                        // console.log(err.message);
                        req.flash("error",err.message);
                        // user.g = 0;
                        res.redirect("back");
                    }else{
                        passport.authenticate("local",{ failureRedirect: 'back',failureFlash:true })(req,res,function(){
                            // user.g = 1
                            var mailOptions = {
                              from: 'gcgcgc926@gmail.com',
                              to: ''+(newUser.email),
                              subject: 'Confirmation email for Need E-Help',
                              html: `<h1>Thanks for Registering to Need E-Help</h1>
                                     <br><br>Your secret token is <b>`+newUser.token+`<b>
                                     <br><br> <a href="http://localhost:3000/verify">Click on the following link to verify email</a>`
                            };
                            transporter.sendMail(mailOptions, function(error, info) {
                              if(error) console.log(error);
                              else {
                                console.log("email sent "+ info.response);
                              }
                            });
                            req.flash("success","An email has been sent for activiation");
                            res.redirect("/");

                        });
                        // console.log('registeration has been done  successfully');
                        // res.redirect('/');
                  }
              });
            }

        });


      }else{
        req.flash('error',"Email-Id already exists");
        res.redirect('back');

      }
    }
  })
});

// Login

app.post('/userLoginPost',function(req,res){
  console.log(req.body);

  /*
  { username: '18103021',
    password: 'Chaitanya@1',
  }
  */

  const username = req.body.username;
  const password = req.body.password;


    User.find({username:username},function(err,newuser){
        if (newuser.length>0){
          var result = bcryptNodejs.compareSync(password,newuser[0].password);
          if (result == true){
            if(newuser[0].active == false) {
              //flash account not yet active error
              req.flash("error","Account not yet activated")
              console.log("Account not yet active");
              res.redirect('/userLogin');
            }
            else {

              localStorage.set('user',JSON.stringify(newuser[0]));
              // req.flash("userLogin",newuser[0]);
              req.flash("success","You have successfully logged in");
              // res.render('home',{user:newuser[0]});
              res.redirect('/');

            }
          }else{
            req.flash('error',"Password does not match");
            res.redirect('back');
          }

        }else{
          req.flash("error","User doesn't exist!!!");
          console.log("login failed");
          res.redirect('back');
        }
  })

  //hash Password

});


app.post('/ngoSignupPost',function(req,res){
  console.log(req.body);

  const phoneno = req.body.phoneno;
  const regnumber = req.body.regnumber;
  const username = req.body.username;
  const aboutngo = req.body.aboutngo;
  const locationofwork = req.body.locationofwork;
  const ngoleadership = req.body.ngoleadership;
  const needyPeopleDetails = req.body.needyPeopleDetails;
  // const fullname = req.body.fullname;
  const email = req.body.email;
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword;
  const token = randomstring.generate();
  var newNgo;
  if (password != confirmpassword){

    console.log("Password not matched");
    req.flash('error',"Password does not match");
    res.redirect('back');

    return;
  }


  Ngo.find({email:email},function(err,allNgos){
    if (err){
      console.log(err);
    }else{
      if (allNgos.length == 0){
        //we can create a new User
        //use bcrypt

          newNgo = new Ngo({
            phoneno:phoneno,
            regnumber:regnumber,
            username:username,
            aboutngo:aboutngo,
            locationofwork:locationofwork,
            ngoleadership:ngoleadership,
            needyPeopleDetails:needyPeopleDetails,
            email:email,
            password:password,
            token:token //email verification
          });


        bcryptNodejs.hash(req.body.password, null, null, (err, hash)=> {
            if (err){
                console.log(err);
                req.flash("error",err.message);
            }else{

                newNgo.password = hash;
                console.log("Hash: ",hash);
                Ngo.register(newNgo,req.body.password,(err,user)=>{
                    if (err){
                        // console.log(err.message);
                        req.flash("error",err.message);
                        // user.g = 0;
                        res.redirect("back");
                    }else{
                        // passport.authenticate("local",{ failureRedirect: 'back',failureFlash:true })(req,res,function(){
                            // user.g = 1
                            var mailOptions = {
                              from: 'gcgcgc926@gmail.com',
                              to: ''+(newNgo.email),
                              subject: 'NGO Confirmation email for Need E-Help',
                              html: `<h1>Thanks for Registering your NGO to Need E-Help</h1>
                                     <br><br>Your secret token is <b>`+newNgo.token+`<b>
                                     <br><br> <a href="http://localhost:3000/verifyNgo">Click on the following link to verify email</a>`
                            };
                            transporter.sendMail(mailOptions, function(error, info) {
                              if(error) console.log(error);
                              else {
                                console.log("email sent "+ info.response);
                              }
                            });
                            req.flash("success","An email has been sent for activiation");
                            res.redirect("/");

                        // });
                        console.log('hi');
                        // res.redirect('/');
                  }
              });
            }

        });


      }else{
        req.flash('error',"Email-Id already exists");
        res.redirect('back');

      }
    }
  })
});


app.post('/ngoLoginPost',function(req,res){
  console.log(req.body);

  /*
  { username: '18103021',
    password: 'Chaitanya@1',
  }
  */

  const regnumber = req.body.regnumber;
  const password = req.body.password;


    Ngo.find({regnumber:regnumber},function(err,newuser){
        if (newuser.length>0){
          var result = bcryptNodejs.compareSync(password,newuser[0].password);
          if (result == true){
            if(newuser[0].active == false) {
              req.flash("error","Account not yet activated")
              console.log("Account not yet active");
              res.redirect('/ngo-login');
            }
            else {
              req.flash("success","you have successfully logged in");
              localStorage.set('user',JSON.stringify(newuser[0]));
              res.redirect('/');
            }
          }else{
            req.flash('error',"password not matched");
            res.redirect('back');
          }

        }else{
          req.flash("error","User doesn't exist!!!");
          console.log("login failed");
          res.redirect('back');
        }
  })
})

//Logout

app.get('/logout',function(req,res){
  req.logout();
  localStorage.set('user',undefined);
  req.flash("success","you have successfully logged out")
  res.redirect('/');
})



app.listen('3000',function(){
  console.log("Server Running on port 3000");
});
