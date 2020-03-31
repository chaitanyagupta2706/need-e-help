var mongoose = require("mongoose");
//connecting of mongoose on local server
mongoose.connect('mongodb://localhost:27017/userDetails',{useNewUrlParser: true, useUnifiedTopology: true});
var passportLocalMongoose = require("passport-local-mongoose");
//making of schema
var schema = new mongoose.Schema({
    name:{
      type:String,
      required:true
    },
    phoneno:{
      type:String,
      required:true
    },
    category:{
      type:String,
      required:true
    },
    isDonation:{
      type:Boolean,
      default:true
    },
    amount:{
      type:Number,
      required:true
    },
    //image storage will be done later
});
//plugging of local-passport-mongoose features into user-schema
schema.plugin(passportLocalMongoose);
//model formation
var model = mongoose.model("NeedyPeople",schema);
module.exports = model;
