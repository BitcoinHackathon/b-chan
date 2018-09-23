const express = require('express');
const bodyParser = require("body-parser");
const createP2SHtx = require('./lib/lock_p2sh').createP2SHtx;

// DataStore
let quizeData = {}; 
let userAcount = [];
const sourceTxid = 'cf4e8cc9cce4535932f9fc8c7eba57d72acbde0ed110899b90f9727500c4e39f'; // create in TestNet

// config express sever
const app = express();
// app.use(reload(__dirname + '/app.js'))
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");


app.get('/', (req, res) => {
    const response = {
        "message": '',
    };
    res.render("./index.ejs", response);
});

app.post('/quizzes/create', (req, res) => {
    quizeData = {
        ...req.body,
    };
    const response = {
        "message": "登録が成功しました。",
    };

    // create bounty
    createP2SHtx(sourceTxid, quizeData.bounty, quizeData.portKey).then(newTxid => {
        console.log(newTxid);
        // begin to wait answer.
        setInterval(getYouTube, 1000);
    });

    res.render("./index.ejs", response);
});

app.listen(3000, () => console.log('access http://localhost:3000'))


function getYouTube() {
    let messages = ["答えテスト", "こた"]; // fukazawaさんのコールに差し替える
    console.log('メッセージ', messages);
    if (messages.length > 1) {
        messages.forEach(message => {}); // 2つ目のトランザクション @param newTxid, user_address, user_answer, master_amount
    } 
 }
