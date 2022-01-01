declare var BitcoreDoge:any;
declare var Buffer:any;
declare var BIP39:any;
declare var CoinKey:any;
declare var CoinInfo:any;
declare var Crypto:any;

// import * as Crypto from 'crypto-browserify';


export class TestbedControlService {

  constructor() {
    this.run()
  }




  //test runner
  private run(){

    this.addressCreate();

    // this.txCreate();
    
  }



  private txCreate(){
    console.log(BitcoreDoge)

    console.log(Buffer)


    var priv_key = BitcoreDoge.PrivateKey('cevkkpahLE23YjgxreJKe7GXyu7w7FiaUQ48E2ApcR5xJcV1R6BL');
    console.log(priv_key)

    var utxo = {
      txid: 'e767b9cedb9a8ee62c7f6cd8c65f3b19b263d5e459df0cb4cb4a8a4cf627cdb7',
      vout: 1,
      address: 'nnFZZFHJsG1JPX3rCKs4XhGiyL23Raqqiy',
      script: '76a914c616f4abfcc54ab0355adb6e44d85e520fed666888ac',
      amount: 260.9415,
      network: 'testnet'
    }

    var transaction = new BitcoreDoge.Transaction()
      .from(utxo)
      .to('nqq5zXhPcSePCypQDkvBfc4pN7tQ5jcBtR', 5 * 100000000)
      .change('nnFZZFHJsG1JPX3rCKs4XhGiyL23Raqqiy')
      .fee(2 * 100000000)
      .sign(priv_key);

    console.log(transaction)
    console.log(transaction.toString())
    console.log(transaction)
    console.log(transaction.isFullySigned())
  }


  private addressCreate(){

    let base_phrases = (BIP39.generateMnemonic()).split(' ');

    console.log(base_phrases)


    let hash = Crypto.createHash('md5').update(base_phrases.join('')).digest('hex');
    console.log(hash)
    //create buffer with seed
    var buf = new Buffer.alloc(32, hash);
    //generate new key
    let keys = new CoinKey(buf, CoinInfo('DOGE-TEST'));
    console.log(keys.publicAddress)
    console.log(keys.privateWif)




  }
  

}
