const express = require('express');
const app = express();
const errorMiddleware = require('./middlewares/error');
const cookieParser = require('cookie-parser')
const path = require('path')
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
dotenv.config({path:path.join(__dirname,"config/config.env")});


app.set('views',path.join(__dirname, "views" ));
app.use(express.static(path.join(__dirname, "public" )));
app.set('view engine',"ejs");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


// import the required routes
const projects = require('./routes/project')
const auth = require('./routes/auth')


// Configure a routes
app.use('', projects);
app.use('/auth/',auth);



app.use(errorMiddleware)
module.exports = app;