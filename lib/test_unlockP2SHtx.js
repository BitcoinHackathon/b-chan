const unlockP2SHtx = require('./unlock_p2sh').unlockP2SHtx;

const txid = 'ed22268aa9048abb0f39396b3b1fd76d4f1190100d95f95c6b592553a235a6c6';
const originalAmount = 84562;
const address = 'bchtest:qr4mlzl6ptshxnpu9ke6dtsvrwheugr35c8dmwc20f';
const userAnswer = 'ごりら';
const answer = 'らっぱ';

unlockP2SHtx(txid, originalAmount, address, userAnswer, answer).then(newTxid => {
    console.log(newTxid);
});