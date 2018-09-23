const express = require('express');
const bodyParser = require("body-parser");
const app = express();

// app.use(reload(__dirname + '/app.js'))
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");

let quizeData = {}; 

app.get('/', function (req, res) {
    const response = {
        "message": '',
    };
    res.render("./index.ejs", response);
});

app.post('/quizzes/create', function (req, res) {
    quizeData = req.body;
    const response = {
        "message": "登録が成功しました。",
    };

    res.render("./index.ejs", response);
});


 
app.listen(3000, () => console.log('access http://localhost:3000'))
