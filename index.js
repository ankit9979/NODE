const express      = require('express');
const mongoose     = require('mongoose');
const bodyparser   = require('body-parser');
const cookieParser = require('cookie-parser');
const app          = express();
const dotenv       = require("dotenv");
const userRoute    = require("./routes/user");
const authRoute    = require("./routes/auth");
const postRoute    = require("./routes/post");

dotenv.config();

app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology:true }, function(err) {
    if(err) console.log(err);
});

app.get('/',function(req,res){
    res.status(200).send('Welcome To Social APP');
});


app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);


// listening port
const PORT = process.env.PORT||3000;
app.listen(PORT);