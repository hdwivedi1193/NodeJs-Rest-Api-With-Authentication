const express=require("express")
const Tasks=require("../models/tasks")
const router= new express.Router()
const auth=require("../middleware/auth")

router.post("/save/task",auth,async(req,res)=>{
    try{
        const tasks=new Tasks({
            ...req.body,
            owner:req.user._id
        })

        await tasks.save()
        res.send("Task saved successfully")
        
    }catch(e){

        res.send("Unable to save task")
    }
    
})

router.patch("/update/task/:id",auth,async(req,res)=>{

    try{

    const onlyUpdates=['title','description']
    const reqestedUpdates=Object.keys(req.body)
    const isValidUpdate=reqestedUpdates.every((update)=>onlyUpdates.includes(update))

    if(!isValidUpdate){
        res.send("Invalid Updates")
    }

    

    const getTask=await Tasks.findOne({_id:req.params.id,"owner":req.user._id})

   

    if(!getTask){
        res.send("Not allowed to update this task")
    }

    reqestedUpdates.forEach((update)=>{
        getTask[update]=req.body[update]
    })

    await getTask.save()

    res.send("Task updated successfully")

    }catch(e){
        res.send("Oops something went wrong")

    }
    

})

router.delete("/delete/task/:id",auth,async(req,res)=>{
    try{
        const task=await Tasks.findOneAndRemove({_id:req.params.id,"owner":req.user._id})

        if(!task){
            res.send()
        }
        res.send("Task deleted successfully")

    }catch(e){

        res.send("Oops something went wrong")
    }
    
})

router.get("/myTasks",auth,async(req,res)=>{

    try{
        const match={}
        const sort={}
        if(req.query.completed){
            match.completed=req.query.completed=="true"
        }

        if(req.query.sortBy){
            const path=req.query.sortBy.split(":")
            sort[path[0]]=path[1]=="desc"?-1:1
        }
        console.log(sort);
        await req.user.populate({

            path:"tasks",
            match,
            options:{
                limit:parseInt(req.query.limit),
                sort
            }

        }).execPopulate()

        res.send(req.user.tasks);
    }catch(e){

        res.send('No Task Found')
    }
    
})



module.exports=router