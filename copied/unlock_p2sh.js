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

// derive the HDNode
let node = BITBOX.HDNode.derivePath(account, "432/123");

// HDNode to cashAddress
let cashAddress = BITBOX.HDNode.toCashAddress(node);

// create instance of Transaction Builder class
let transactionBuilder = new BITBOX.TransactionBuilder('testnet');

// set original amount, txid and vout
let originalAmount = 82447;
let txid = 'f56c8b2d49ac78d80191b915610d34a6e0ef9e4ac939e2ca7d6b50c96b6567dc';
let vout = 0;

// add input
transactionBuilder.addInput(txid, vout);

// set fee and send amount
let fee = 250;
let sendAmount = originalAmount - fee;

// add output
transactionBuilder.addOutput(cashAddress, sendAmount);

let script = [
    BITBOX.Script.opcodes.OP_HASH160,
    Buffer.from(stringHash),
    BITBOX.Script.opcodes.OP_EQUAL
];

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
  Buffer.from(inputString),
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