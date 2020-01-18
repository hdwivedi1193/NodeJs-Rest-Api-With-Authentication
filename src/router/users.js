const express=require("express")
const app=express();
const mongoose=require("../db/mongoose")
const User=require("../models/users")
const router=new express.Router();
const auth=require("../middleware/auth")
const multer  = require('multer')
const sharp=require("sharp")
const sendMail=require("../mail/mail")

router.post("/signup",async(req,res)=>{

    try{
        const newUser=new User(req.body)

        await newUser.save()

        await newUser.generateAuthToken()

        sendMail(newUser.email,newUser.name)


        res.send("User signed up successfully")

    }catch(e){

        res.send(e)
    }
        


})

router.post("/login",async(req,res)=>{

    try{

        const user=req.body
        const findUser=await User.findUserByCredentials(user.email,user.password)
        const token= await findUser.generateAuthToken();
        return res.status(200).send({
            findUser,
            token
        })
    }catch(e){
        res.send("Unable to login")
    }
    
    
})

router.post("/logout",auth,async(req,res)=>{
    try{
    const loggedInToken=req.user.tokens.filter((token)=>{

        return token.token!=req.token

    })

    req.user.tokens=loggedInToken
    await req.user.save();

    res.send("User Logged Out Successfully")

    }catch(e){

        res.send("Oops something went wrong")
    }

})



router.get('/user/me',auth,async (req,res)=>{
        res.send(req.user)
})

router.patch("/user/update",auth,async(req,res)=>{
    try{
        const userId=req.params.id
        const onlyUpdate=['name','password','phone']
        const requestedUpdates=Object.keys(req.body)
    
        const isValidUpdation=requestedUpdates.every((update)=>onlyUpdate.includes(update))
    
        if(!isValidUpdation){
            res.send("Invalid Updates")
        }
    
        requestedUpdates.forEach((updateData)=>{
            req.user[updateData]=req.body[updateData]
    
        })
        await req.user.save(); 

        res.send("Updated successfully")



    }catch(e){

        res.send("Unable to update data")
    }
       
    

})

router.delete("/user/deactivate",auth,async(req,res)=>{

    await req.user.remove()

    res.send("User deleted successfully")

})

var upload = multer({ 

    limits:{
        fileSize:10000
    },
    fileFilter(req, file, cb){

        if(!file.originalname.match(/\.(jpeg|png|jpg)$/)){

            return cb(new Error("Only jpeg,png,jpg is allowed"))
        }

        return cb(undefined,true)
    }

 })


router.post("/profile/pic/upload",auth,upload.single('avatar'),async(req,res)=>{
    try{
    const avatar=await sharp(req.file.buffer).resize(40,40).toBuffer()
    req.user.avatar=avatar
    await req.user.save()

    res.send("File uploaded succesfully")

    }catch(e){

        res.send("Oops something went wrong")
    }

},(error,req,res,next)=>{

    res.send({error:error.message});
})



module.exports=router;

