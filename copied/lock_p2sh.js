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
let originalAmount = 88131;
let txid = 'b1dfb6d54bd0f5fd5e5eb420551816c4c39a0066a73f646c18a0e76b223a8ee8';
let vout = 0;

// add input
transactionBuilder.addInput(txid, vout);

// set fee and send amount
let fee = 1000;
let sendAmount = originalAmount - fee;

// expire 1537628717 2018-09-23 AM 0:05
let script = BITBOX.Script.encode([
    // answer sigA pubkeyA

    // 時間検証
    // Buffer.from('1537628717', 'ascii'),
    // 未来↓
    Buffer.from('1538660026', 'ascii'),
    BITBOX.Script.opcodes.OP_CHECKLOCKTIMEVERIFY,
    BITBOX.Script.opcodes.OP_DROP,
    BITBOX.Script.opcodes.OP_DUP,
    BITBOX.Script.opcodes.OP_HASH160,
    BITBOX.Script.opcodes.OP_PUBKEYHASH,
    BITBOX.Script.opcodes.OP_EQUALVERIFY,
    BITBOX.Script.opcodes.OP_CHECKSIGVERIFY,

    // sigA pubkeyA OP_HASH160 を消す
    BITBOX.Script.opcodes.OP_DROP,
    BITBOX.Script.opcodes.OP_DROP,

    // 一番下にanswerがあるはず
    // ここからクイズの検証をする
    BITBOX.Script.opcodes.OP_HASH160,
    Buffer.from(stringHash, 'ascii'),
    BITBOX.Script.opcodes.OP_EQUAL,
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