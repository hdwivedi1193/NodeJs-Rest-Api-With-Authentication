const jwtwebtoken=require("jsonwebtoken")
const User=require("../models/users")

const auth=async (req,res,next)=>{
try{

var header=req.header("Authorization").replace("Bearer ","");
var token = await jwtwebtoken.verify(header, process.env.JWTKEY);
var user= await User.findOne({_id:token._id,"tokens.token":header})

if(!user){

    res.send('Unauthorised')
}
req.user=user
req.token=header

}catch(e){
    res.send("Unauthorised");
}

next()

}

module.exports=auth


