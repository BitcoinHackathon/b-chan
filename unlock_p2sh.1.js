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

// derive HDNode
let node = BITBOX.HDNode.derivePath(account, "432/123");

// create instance of Transaction Builder class
let transactionBuilder = new BITBOX.TransactionBuilder();

// set original amount, txid and vout
let originalAmount = 1000;
let txid = 'c6c1c36ddfa69f377b9f1ed4e6fbed7647e2b6e781a2b5eb6540304548d81210';
let vout = 0;

// add input
transactionBuilder.addInput(txid, vout);

// set fee and send amount
let fee = 250;
let sendAmount = originalAmount - fee;

// THIS IS QUIZ ANSWER
const answer = 'A';
const hashed_answer = BITBOX.Crypto.hash160(answer);

const user_answer = 'B';

// expire 1537628717 2018-09-23 AM 0:05
let script = BITBOX.Script.encode([
    // クイズ検証
    Buffer.from('1537628717', 'ascii'),
    BITBOX.Script.opcodes.OP_CHECKLOCKTIMEVERIFY,
    BITBOX.Script.opcodes.OP_DROP,
    BITBOX.Script.opcodes.OP_DUP,
    BITBOX.Script.opcodes.OP_HASH160,
    BITBOX.Script.opcodes.OP_PUBKEYHASH,
    BITBOX.Script.opcodes.OP_EQUALVERIFY,
    BITBOX.Script.opcodes.OP_CHECKSIGVERIFY,

    // ここからクイズの検証をする
    BITBOX.Script.opcodes.OP_PUSHDATA1,
    Buffer.from(hashed_answer, 'ascii'),
    BITBOX.Script.opcodes.OP_PUSHDATA1,
    Buffer.from(user_answer, 'ascii'),
    BITBOX.Script.opcodes.OP_HASH160,
    BITBOX.Script.opcodes.OP_EQUAL,
]);

// hash160 script buffer
let p2sh_hash160 = BITBOX.Crypto.hash160(script);

// encode hash160 as P2SH output
let scriptPubKey = BITBOX.Script.scriptHash.output.encode(p2sh_hash160);
console.log(scriptPubKey)

// derive address from P2SH output
// 
let address = BITBOX.Address.fromOutputScript(scriptPubKey);

// add output
transactionBuilder.addOutput(address, sendAmount);

// HDNode to keypair
let key = BITBOX.HDNode.toKeyPair(node);

// empty redeemScript var
let redeemScript;

// sign input
transactionBuilder.sign(0, key, redeemScript, transactionBuilder.hashTypes.SIGHASH_ALL, originalAmount)

// build to hex
let hex = transactionBuilder.build().toHex()
console.log(hex)

// POST to BCH network
BITBOX.RawTransactions.sendRawTransaction(hex).then((result) => { console.log(result); }, (err) => { console.log(err); });
// 901dc9549555e4a7e821c3504883eabe14d808e6e321c06666904b6ba68aca6d