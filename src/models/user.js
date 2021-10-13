const path = require("path");
const fs = require("fs");

const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const ObjectId = require("mongodb").ObjectId;


const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            default:0
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate: (value)=>{
                if(!validator.isEmail(value)){
                    throw new Error("Invalide Email address");
                }
        }
    
        },
        password: {
            type: String,
            min: 7,
            trim: true,
            validate: (value)=>{
                if(value.toLowerCase().includes("password")){
                    throw new Error ("password can not contain the key password.");
                }
            }
        },
        imagePath: {
            type: String,
            default: "profile.jpg"
        },
        confirmed:{
            type: Boolean,
            default: false
        },
        secret: {
            type: String
        }
    }
);

userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
});


userSchema.pre("save", async function(next) {
    const user = this;
    
    if(user.isModified("password")){
        user.password = await bcryptjs.hash(user.password, 8);
    }
    
    next();
});


userSchema.statics.findByCredentials = async (email, password) => {
    
    const user = await User.findOne({email: email});

    if(!user){
        return {error: "Invalid credentials"};
    }

    const isMatch = await bcryptjs.compare(password , user.password);

    if(!isMatch){
        return {error: "Invalid credentials"};
    }

    if(!user.confirmed){
        return {error: "Please confirm your email account"};
    }

    return user;
}

userSchema.statics.getUserPublicData = (user) => {
    
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        imagePath: user.imagePath
    }
}

userSchema.statics.uploadAvatar = (file) => {
    const fileName = file.name;

    const allowedFiles = ["jpg", "jpeg", "JPEG", "png"];
    const fileExtension = fileName.split(".").pop();

    
    if(!allowedFiles.includes(fileExtension)){
        return {error: "please upload image file"}

    }

    const newFileName = new ObjectId().toHexString() + "." + fileExtension;
    var result = {fileName: newFileName};

    file.mv(path.resolve("./public/images/"+ newFileName), (e) => {
        if(e){
            result.error = "Something went wrong, unable to upload the image";
        }
    });
    return result;
}

userSchema.statics.deleteAvatar = async (fileName) => {
    if(fileName === "profile.jpg"){
        return "";
    }

    var result = "fire removed successfully";

    await fs.unlink("./public/images/" + fileName, (e) => {
        if(e){
            result = "unable to remove file"
        }
    });

    return result;
}

const User = mongoose.model("User", userSchema);

module.exports = User;