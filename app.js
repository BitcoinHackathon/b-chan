const express = require('express');
const app = express();

// app.use(reload(__dirname + '/app.js'))
app.use(express.static('public'));
app.set("view engine", "ejs");


app.get('/', function (req, res) {
    const response = {
        "message": '',
    };
    res.render("./index.ejs", response);
});

app.post('/quizzes/create', function (req, res) {
    const response = {
        "message": "登録が成功しました。",
    };

    res.render("./index.ejs", response);
});


 
app.listen(3000, () => console.log('access http://localhost:3000'))
