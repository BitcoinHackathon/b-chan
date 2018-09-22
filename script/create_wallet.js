const BITBOXCli = require('bitbox-cli/lib/bitbox-cli').default;
const BITBOX = new BITBOXCli({
    restURL: 'https://trest.bitcoin.com/v1/'
})


const mnemonic = BITBOX.Mnemonic.generate(128);

console.log(mnemonic);

// root seed buffer
let rootSeed = BITBOX.Mnemonic.toSeed(mnemonic);

// master HDNode
let masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, "testnet");

// HDNode of BIP44 account
let account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'");

// derive the first external change address HDNode
let change = BITBOX.HDNode.derivePath(account, "0/0");


let cashAddress = BITBOX.HDNode.toCashAddress(change);

console.log(cashAddress);
