let BITBOXCli = require('bitbox-cli/lib/bitbox-cli').default;

const BITBOX = new BITBOXCli({
  restURL: 'https://trest.bitcoin.com/v1/'
})

let inputString = Buffer.from("りんご");

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

// derive the HDNode
let node = BITBOX.HDNode.derivePath(account, "432/123");

// HDNode to cashAddress
let cashAddress = BITBOX.HDNode.toCashAddress(node);

// create instance of Transaction Builder class
let transactionBuilder = new BITBOX.TransactionBuilder('testnet');

// set original amount, txid and vout
let originalAmount = 87613;
let txid = 'c5b31ca1655d79a2eb739ff181215bd8280531302b5560cb1cbff0febad4e73e';
let vout = 0;

// add input
transactionBuilder.addInput(txid, vout);

// set fee and send amount
let fee = 250;
let sendAmount = originalAmount - fee;

// add output
transactionBuilder.addOutput(cashAddress, sendAmount);


// expire 1537628717 2018-09-23 AM 0:05
let script = BITBOX.Script.encode([
    // answer sigA pubkeyA

    // 時間検証
    Buffer.from('1537628717', 'ascii'),
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


// encode locking script
let encodedScript = BITBOX.Script.encode(script);

// HDNode to keypair
let keyPair = BITBOX.HDNode.toKeyPair(node);

// set hash type
let hashType = 0xc1;

// call buildIncomplete
let tx = transactionBuilder.transaction.buildIncomplete()

// create sighash
let sigHash = tx.hashForWitnessV0(0, encodedScript, originalAmount, hashType)

// create hostSig
let hostSig = keyPair.sign(sigHash).toScriptSignature(hashType)

// create unlocking script
let script2 = [
    hostSig,
    Buffer.from(inputString),
    encodedScript.length,
];

// concat scripts together
let children = script2.concat(script);

// encode scripts
let encodedScript2 = BITBOX.Script.encode(children);

// set input script
tx.setInputScript(0, encodedScript2)

// to hex
let hex = tx.toHex()
console.log(hex)

// POST to BCH network
BITBOX.RawTransactions.sendRawTransaction(hex).then((result) => { console.log(result); }, (err) => { console.log(err); });