const mongoose=require("mongoose")
const validator=require("validator");
const jwt=require("jsonwebtoken")
const brcypt=require("bcryptjs")
const Tasks=require("../models/tasks")
const UserSchema=new mongoose.Schema({

    name:{

        type:String,
        required:true,
        trim:true
    },
    email:{

        type:String,
        required:true,
        unique:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("This email is not valid")
            }
        }
    },

    phone:{
        type:String,
        validate(value){
            if(!validator.isMobilePhone(value,['en-IN'])){
                throw new Error("This number is not a valid")
            }
        }
    },

    password:{
        type:String,
        required:true,
        minlength:6
    },

    tokens:[{
        token:{
            type:String,
        }
    }],

    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

UserSchema.virtual("tasks",{
  ref: 'Task', 
  localField: '_id', 
  foreignField: 'owner'
})

UserSchema.statics.findUserByCredentials=async (email,password)=>{
        const user=await User.findOne({email})

        if(!user){
            throw new Error("User does not exist")
        }

        const checkPassword=await brcypt.compare(password,user.password)
        if(checkPassword==false){
            throw new Error("Password id wrong")

        }

        return user;

}

UserSchema.methods.generateAuthToken=async function(){

    var token = await jwt.sign({ _id: this.id }, process.env.JWTKEY);
    this.tokens=this.tokens.concat({token})
    await this.save();

    return token;


}

UserSchema.pre("save",async function(next){
    if(this.isModified("password")){
        var encryptPassword=await brcypt.hash(this.password,8)
        this.password=encryptPassword

        next()
    }


})

UserSchema.pre("remove",async function(next){
    const deleteTasks=await Tasks.deleteMany({"owner":this._id})

    next()

})

UserSchema.methods.toJSON= function(){

    const obj=this.toObject();

    delete obj.password
    delete obj.tokens

    return obj
    

}
const User=mongoose.model("User",UserSchema)



module.exports=User;

