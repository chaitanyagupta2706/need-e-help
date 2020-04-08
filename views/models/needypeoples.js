var mongoose = require("mongoose");
//connecting of mongoose on local server
mongoose.connect('mongodb://localhost:27017/userDetails',{useNewUrlParser: true, useUnifiedTopology: true});
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
    gender:{
      type:String,
      required:true
    },
    category:{
      type:String,
      required:true
    },
    HelpType:{
      type:String,
      default:true
    },
    goal:{
      type:Number,
      required:true
    },
    amount:{
      type:Number,
      required:false
    },
    regno:{
      type:Number,
      required:true
    }
    //image storage will be done later
});
//model formation
var model = mongoose.model("NeedyPeople",schema);
module.exports = model;
