const path = require("path");
const express = require("express");
const hbs = require("hbs");
require("./db/mongoose.js");
const session = require("express-session");
const fileUpload = require("express-fileupload");

const userRouter = require("./routers/user-router.js");
const taskRouter = require("./routers/task-router.js");

const app = express();
const port = process.env.PORT;

//setup the session
app.use(session ({secret: "something", saveUninitialized: true, resave: true}));

app.set("view engine", "hbs");

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

app.use(fileUpload());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(userRouter);
app.use(taskRouter);


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});
