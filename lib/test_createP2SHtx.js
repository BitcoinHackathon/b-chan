const createP2SHtx = require('./lock_p2sh').createP2SHtx;

const txid = '371bd13d65ae5d02bae72b4b020da231b4de94d6ea346f55433d9892eb8da717';
const originalAmount = 89659;
const answer = 'ごりら';

createP2SHtx(txid, originalAmount, answer).then(newTxid => {
    console.log(newTxid);
});