const express = require('express');
const bodyParser = require("body-parser");
const createP2SHtx = require('./lib/lock_p2sh').createP2SHtx;
const unlockP2SHtx = require('./lib/unlock_p2sh').unlockP2SHtx;
const youTube = require("./youtubeLiveComment");

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
        console.log('ニューID', newTxid);
        // begin to wait answer.
        setInterval(() => getYouTube(newTxid), 1000);
    });

    res.render("./index.ejs", response);
});

app.listen(3000, () => console.log('access http://localhost:3000'))

function getYouTube(newTxid) {
    youTube().then(messages => {
        console.log('メッセージ', messages);
        if (messages.length > 1) {
            messages.forEach(message => {
                console.log('コール', message, message.snippet.displayMessage);
                const userAddress = message.authorDetails.channelId; // FIXME: replase bitcoin address
                // begin transaction.
                unlockP2SHtx(newTxid, quizeData.bounty, userAddress, message.snippet.displayMessage, quizeData.portKey)
            });
        } 
    });
 }
