const mongoose = require('mongoose');
const url=process.env.MONGOURL

mongoose.connect(url,{useNewUrlParser:true,useCreateIndex:true});