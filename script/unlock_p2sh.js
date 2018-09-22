const BITBOXCli = require('bitbox-cli/lib/bitbox-cli').default;
const BITBOX = new BITBOXCli({
    restURL: 'https://trest.bitcoin.com/v1/'
})


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
console.log("cashAddress");
console.log(cashAddress);

// create instance of Transaction Builder class
let transactionBuilder = new BITBOX.TransactionBuilder('testnet');

// set original amount, txid and vout
let originalAmount = 86847;
let txid = 'ae9af9ccc59f9d7f9cf8080ed1414e0ba963aea1200f15f9927747b23c08ca30';
let vout = 0;

// add input
transactionBuilder.addInput(txid, vout);

// set fee and send amount
let fee = 250;
let sendAmount = originalAmount - fee;

let answer_buffer = Buffer.from("A");

console.log(answer_buffer);

let answer_hash = BITBOX.Crypto.hash160(answer_buffer);

console.log(answer_hash);


// add output
transactionBuilder.addOutput(cashAddress, sendAmount);

let script = BITBOX.Script.encode([
    // answer sigA pubkeyA

    // 時間検証
    Buffer.from('1537628717'),
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
    Buffer.from(answer_hash),
    BITBOX.Script.opcodes.OP_EQUAL,
]);

// encode locking script
let encodedScript = BITBOX.Script.encode(script);

// HDNode to keypair
let keyPair = BITBOX.HDNode.toKeyPair(node);
console.log("keyPair");
console.log(keyPair);

// set hash type
let hashType = 0xc1;

// call buildIncomplete
let tx = transactionBuilder.transaction.buildIncomplete();

// create sighash
let sigHash = tx.hashForWitnessV0(0, encodedScript, originalAmount, hashType);

// create hostSig
let hostSig = keyPair.sign(sigHash).toScriptSignature(hashType);
console.log("hostSig");
console.log(hostSig);

// create unlocking script
let script2 = [
  answer_buffer,
  encodedScript.length
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
// 59c8960607a0cc4e3c8ce45d71ee1671e3d76d9b135de761ddac26360ac36302