let BITBOXCli = require('bitbox-cli/lib/bitbox-cli').default;

const BITBOX = new BITBOXCli({
  restURL: 'https://trest.bitcoin.com/v1/'
})

let inputString = Buffer.from("りんご", 'ascii');

console.log(inputString);

let stringHash = BITBOX.Crypto.hash160(inputString);

console.log(stringHash);

let mnemonic = 'bleak keen diesel short shy runway shock carry render ten track wave';

// root seed buffer
let rootSeed = BITBOX.Mnemonic.toSeed(mnemonic);

// master HDNode
let masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, 'testnet');

// HDNode of BIP44 account
let account = BITBOX.HDNode.derivePath(masterHDNode, "m/44'/145'/0'");

// derive HDNode
let node = BITBOX.HDNode.derivePath(account, "432/123");
let cashAddress = BITBOX.HDNode.toCashAddress(node);
console.log("cashAddress");
console.log(cashAddress);
let legacyAddress = BITBOX.Address.toLegacyAddress(cashAddress);
console.log("legacyAddress");
console.log(legacyAddress);



// create instance of Transaction Builder class
let transactionBuilder = new BITBOX.TransactionBuilder();

// set original amount, txid and vout
let originalAmount = 82697;
let txid = '16d1490a714f6ea8835342ba2a8a1c28a55cadc5c960cd6abcb5ee4e5bb6355e';
let vout = 0;

// add input
transactionBuilder.addInput(txid, vout);

// set fee and send amount
let fee = 250;
let sendAmount = originalAmount - fee;

let script = BITBOX.Script.encode([
  BITBOX.Script.opcodes.OP_HASH160,
  Buffer.from(stringHash),
  BITBOX.Script.opcodes.OP_EQUAL
]);

console.log(script)

// hash160 script buffer
let p2sh_hash160 = BITBOX.Crypto.hash160(script)

console.log(p2sh_hash160)

// encode hash160 as P2SH output
let scriptPubKey = BITBOX.Script.scriptHash.output.encode(p2sh_hash160)

console.log(scriptPubKey)

// derive address from P2SH output
let address = BITBOX.Address.fromOutputScript(scriptPubKey)

console.log(address)

// add output
transactionBuilder.addOutput(address, sendAmount);

// HDNode to keypair
let key = BITBOX.HDNode.toKeyPair(node);

// empty redeemScript var
let redeemScript

// sign input
transactionBuilder.sign(0, key, redeemScript, transactionBuilder.hashTypes.SIGHASH_ALL, originalAmount)

// build to hex
let hex = transactionBuilder.build().toHex()
console.log(hex)

// POST to BCH network
BITBOX.RawTransactions.sendRawTransaction(hex).then((result) => { console.log(result); }, (err) => { console.log(err); });