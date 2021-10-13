const express = require("express");
const path = require("path");
const ObjectId = require("mongodb").ObjectId;
const User = require("../models/user.js");

const session = require("express-session");

const apiAuth = require("../middleware/api-auth.js");
const auth = require("../middleware/auth.js");
const email = require("../email/account.js");

const router = express.Router();


//=======================================API ENDPOINTS=======================//

router.get("/", (req, res) => {
    
    if(req.session.user){
        req.session.user = undefined;
    }

    res.render("index", {msg: req.query.msg});
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/profile" , auth, (req, res) => {
    res.render("profile", {user: req.session.user});
});


//=======================================API ENDPOINTS=======================//


//Endpoint for login
router.post("/api/users/login", async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);

        if(user.error){
            return res.send(user);
        }

        req.session.user = user;
        res.send(User.getUserPublicData(user));

       
    }catch(e){
        res.send({error: "Something went wrong. unable to login"})
    }
});

//Endpoint for creating a user
router.post("/api/users" , async (req, res)=>{
    req.body.secret = new ObjectId().toHexString();
    const user = new User(req.body);

    try{
        await  user.save();
        res.send(User.getUserPublicData(user)); 
        email.sendConfirmMail(user);

    }catch(e){
        res.send(e);
    }
});

//Confirm account
router.get("/api/users/confirm_account", async (req, res) => {
    const userId = req.query.userId;
    const secret = req.query.secret;

    try{
        const user = await User.findOneAndUpdate({_id: userId, secret: secret}, {confirmed: true});

        if(!user){
            return res.redirect("/");
        }
        res.redirect("/?msg=Email confirmed. please login");
    }catch(e){
        res.redirect("/");
    }

});

//Endpoint for reading all users
router.get("/api/users", async (req, res)=>{
   
    try{
        const users = await User.find({},{password:0});
        res.send(users);
    }catch(e){
        res.send(e);
    }
   
});


//Endpoint for reading a user
router.get("/api/users" , apiAuth, async (req, res) =>{

    try{
        const user = await User.findById(req.session.user._id);

        if(!user){
            return res.send({ error: "user not found"});
        }
        res.send(User.getUserPublicData(user));

    }catch(e){
        res.send(e);
    }

});

//Endpoint for updating a user
router.patch("/api/users" , apiAuth, async (req, res) => {
    
    if(req.files){
        const result = User.uploadAvatar(req.files.profileImage);

        if(result.error){
            return res.send({error: result.error})
        }
    
        req.body.imagePath = result.fileName;
    }
    
    
    const id = req.session.user._id;
    
    const allowedFields = ["name" , "age", "password", "email", "imagePath"];
    const updateFields = Object.keys(req.body);

    const isValid = updateFields.every((field) =>{
        return allowedFields.includes(field);
    }); 
    
    if(!isValid){
        return res.send({error: "Invalide update"});
    }

    try{
            const user = await User.findById(id);
            const prevImage = User.imagePath;

            if(!user){
                return res.send({error: "user not found"})
            }
             
            updateFields.forEach( (update) => {
                user[update] = req.body[update];
            });

            await user.save();
            req.session.user = User.getUserPublicData(user);
            res.send(User.getUserPublicData(user));
            
            if(prevImage !== user.imagePath){
                await User.deleteAvatar(prevImage);
            }


        }catch(e){
        res.send(e);
    }
});

//Endpoint for deleting a user
router.delete("/api/users" ,apiAuth, async (req, res) => {
    
    try{
        const user = await User.findByIdAndDelete(req.session.user._id);

        if(!user){
            return res.send({error: "No user found!"});
        }
        res.send(User.getUserPublicData(user));
    }catch(e){
        res.send(e);
    }

});

module.exports = router;