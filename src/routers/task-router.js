const express = require("express");
const Task = require("../models/task.js");
const auth = require("../middleware/auth.js");
const apiAuth = require("../middleware/api-auth.js");

const router = express.Router();

router.get("/tasks" , auth, (req, res) => {
    res.render("task", {user: req.session.user});
});

//=========================API END-POINTS=======================================//


//Endpoint for creating a task
router.post("/api/tasks",apiAuth, async (req, res)=>{
    req.body.owner = req.session.user._id;
    const task = new Task(req.body);

    try{
        await task.save();
        res.send(task);

    }catch(e){
        res.send(e);
    }
});


//Endpoint for reading all tasks
router.get("/api/tasks" , apiAuth, async (req, res)=>{
    const searchText = req.query.search;
    const ownerId = req.session.user._id;

    var tasks = [];

    try{

        if(searchText){
            tasks = await Task.find({owner: ownerId, description: {$regex: searchText, $options: "i"}});

        }else{
            tasks = await Task.find({owner: ownerId});
        }

        res.send(tasks);
        
    }catch(e){
        res.send(e);
    }
});


//Endpoint for reading a task
router.get("/api/tasks/:id" , apiAuth, async (req, res) =>{
    const userId = req.session.user._id;
    
    try{
        const task = await Task.findOne({_id: req.params.id, owner: userId});

        if(!task){
            return res.send({ error: "task not found"});
        }
        res.send(task);

    }catch(e){
        res.send(e);
    }
});

//Endpoint for updating a task
router.patch("/api/tasks/:id" , apiAuth, async (req, res) => {
    const id = req.params.id;
    const userId = req.session.user._id;
    
    const allowedFields = ["description" , "completed"];
    const updateFields = Object.keys(req.body);

    const isValid = updateFields.every((field) =>{
        return allowedFields.includes(field);
    }); 
    
    if(!isValid){
        return res.send({error: "Invalide update"});
    }

    try{
            const task = await Task.findOneAndUpdate({_id: id, owner: userId}, req.body, {new : true})
            if(!task){
                return res.send({error: "Task not found"})
            }        
            res.send(task)

        }catch(e){
        res.send({error: "Something went wrong! Unable to update task."});
    }
});

//Endpoint for deleting a task
router.delete("/api/tasks/:id" , apiAuth, async (req, res) => {
    
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.session.user._id});

        if(!task){
            return res.send({error: "No user found!"});
        }
        res.send(task);
    }catch(e){
        res.send(e);
    }

});


module.exports = router;