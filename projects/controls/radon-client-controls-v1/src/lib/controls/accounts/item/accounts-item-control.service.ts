import { AccountInfoInterface } from "../../../interfaces/account-info/account-info-interface";

declare var BitcoreDoge:any;
declare var BIP39:any;
declare var Buffer:any;
declare var CoinKey:any;
declare var CoinInfo:any;
declare var Crypto:any;


export class AccountsItemControlService {

  constructor(public account_id = '', private ControlImports) { }

  /// REQUEST SHOOTER ///
  //===========================
  
  private RadonRequestShooter = this.ControlImports.RadonRequestShooter;
  
  //===========================
  /// REQUEST SHOOTER ///




  /// SOCHAIN ///
  //========================
  
  private Sochain = this.ControlImports.Sochain;
  
  //========================
  /// END SOCHAIN ///





  /// INFO ///
  //======================
  
  //name
  public name = '';
  
  //created
  public created = 0;

  //phrase chain
  public phrase_chain = '';

  //settings
  public settings = {
    static_receiving: true,
    sending_iterator: 0
  }

  //past addresses
  public past_addresses:{priv_key:string, type:string}[] = [];

  

  /*
  * @Params:  name
  * @Does:    inits account
  * @Return:  success
  */
  public async initNewAccount(name:string){
    let self = this;
    //set name
    self.name = name;
    //does not have existing phrase chain, generate new phrases
    let base_phrases = (BIP39.generateMnemonic()).split(' ');
    //set 0th sending iterator
    let sending_iterator_phrase = self.sending_iterator_mappings[0][Math.floor(Math.random() * ((self.sending_iterator_mappings[0].length - 1) - 0 + 1) + 0)];
    //set phrase chain
    let phrase_chain = [...base_phrases, sending_iterator_phrase].join(' ');
    //set phrase chain
    self.phrase_chain = phrase_chain;
    //generate sending address
    let sendingCreateOp = await self.generateKeys(phrase_chain);
    //set sending address
    self.sending_address.priv_key = sendingCreateOp.data.priv_key;
    self.sending_address.pub_key = sendingCreateOp.data.pub_key;
    //generate receiving address
    let receivingCreateOp = await self.generateKeys(base_phrases.join(''));
    //set receiving address
    self.receiving_address.priv_key = receivingCreateOp.data.priv_key;
    self.receiving_address.pub_key = receivingCreateOp.data.pub_key;
    //set date created
    self.created = Date.now();
    //return with success
    return reply(true, 'initialized');
  }
  //end initNewAccount()
  


  /*
  * @Params:  info
  * @Does:    inits data into address info
  * @Return:  success
  */
  public initExistingAccount(info:AccountInfoInterface){
    let self = this;
    //set account id
    self.account_id = info.account_id;
    //set name
    self.name = info.name;
    //set phrase chain
    self.phrase_chain = info.phrase_chain;
    //set settings
    self.settings.static_receiving = info.settings.static_receiving;
    self.settings.sending_iterator = info.settings.sending_iterator
    //set sending address
    self.sending_address.priv_key = info.sending_address.priv_key;
    self.sending_address.pub_key = info.sending_address.pub_key;
    //set receiving address
    self.receiving_address.priv_key = info.receiving_address.priv_key;
    self.receiving_address.pub_key = info.receiving_address.pub_key;
    //set created
    self.created = Number(info.created);
    //return success
    return reply(true, 'initialized');
  }
  //end initExistingAccount()



  /*
  * @Params:  none
  * @Does:    creates account info
  * @Return:  account_obj
  */
  public getAccountInfo(): AccountInfoInterface{
    let self = this;
    //create account obj
    let account_obj:AccountInfoInterface = {
      account_id: self.account_id,
      name: self.name,
      phrase_chain: self.phrase_chain,
      settings: {
          static_receiving: self.settings.static_receiving,
          sending_iterator: self.settings.sending_iterator
      },
      sending_address: {
          priv_key: self.sending_address.priv_key,
          pub_key: self.sending_address.pub_key
        },
        receiving_address: {
          priv_key: self.receiving_address.priv_key,
          pub_key: self.receiving_address.pub_key
      },
      created: self.created
    }
    //return with obj
    return account_obj
  }
  //return getAccountInfo()


  private async generatePhraseChain(seed, iterator) {
    let self = this;
    //set empty base phrases
    let base_phrases = [];
    //check if has base phrases
    if(seed != '') {
      //has seed, parse base phrases
      let parseOp:any = await self.parsePhraseChain(seed);
      //set base phrases
      base_phrases = parseOp.data.base_phrases;
    } else {
      //does not have seed, generate base phrases
      base_phrases = (BIP39.generateMnemonic()).split(' ');
    }
    //set empty iterator phrases
    let iterator_phrases:any = [];
    //set iterator number string
    let iterator_num_string = iterator + '';
    //iterathe through num string to set iterator phrases
    for(let i = 0; i < iterator_num_string.length; i++){
      //set iterator phrase
      let itr_phrase = self.sending_iterator_mappings[iterator_num_string[i]][Math.floor(Math.random() * ((self.sending_iterator_mappings[iterator_num_string[i]].length - 1) - 0 + 1) + 0)];
      //push to iterator phrases
      iterator_phrases.push(itr_phrase);
    }
    //create phrase chain
    let phrase_chain = [...base_phrases, ...iterator_phrases].join(' ');
    //return phrase chain
    return reply(true, 'generated phrase chain', {phrase_chain});
  }




  private async parsePhraseChain(phrase_chain){
    let self = this;
    //parse phrases
    let phrases = phrase_chain.split(' ');
    //set base phrases
    let base_phrases = phrases.slice(0, 12);
    //set iterator
    let iterator_phrases = phrases.slice(12);
    //get iterator integers
    let iterator_ints = iterator_phrases.map(item => {
        //set value
        let value = -1;
        //iterate to get value
        for(let i = 0; i < 10 && value == -1; i++) {
            //check if index of word is not -1
            if(self.sending_iterator_mappings[i].indexOf(item) != -1) value = i;
        }
        //return with value
        return value;
    });
    //set iterator value
    let iterator_value = Number(iterator_ints.join(''));
    //return with phrase chain info
    return reply(true, 'parsed phrase chain', {base_phrases, iterator_phrases, iterator_value});
  }


  
  private async generateAddresses(phrase_chain){
    let self = this;
    //parse phrase chain
    let parseOp:any = await self.parsePhraseChain(phrase_chain);
    //set base phrases
    let base_phrases = parseOp.data.base_phrases;
    //set iterator phrases
    let iterator_phrases = parseOp.data.iterator_phrases;
    //generate receiving address
    let sendingCreateOp = await self.generateKeys(phrase_chain);
    //set sending keys
    let sending_address = {
      priv_key: sendingCreateOp.data.priv_key,
      pub_key: sendingCreateOp.data.pub_key,
    }
    //generate receiving address
    let receivingCreateOp = await self.generateKeys(base_phrases.join(' '));
    //set receiving keys
    let receiving_address = {
      priv_key: receivingCreateOp.data.priv_key,
      pub_key: receivingCreateOp.data.pub_key,
    }
    //return addresses
    return reply(true, 'generated addresses', {sending_address, receiving_address});
  }


  //======================
  /// END INFO ///








  /// BALANCE ///
  //======================
  
  //total balance
  public balance = 0;


  /*
  * @Params:  none
  * @Does:    gets balance in receiving address and sending address
  * @Return:  {balance, sending, receiving}
  */
  public async getBalance(){
    let self = this;
    //get sending balance
    let sendingBalanceOp = await self.Sochain.getBalance(self.sending_address.pub_key);
    //set sending balance
    let sending = parseFloat(Number(sendingBalanceOp.data.balance).toFixed(4));
    //get receiving balance
    let receivingBalanceOp = await self.Sochain.getBalance(self.receiving_address.pub_key);
    //set receiving balance
    let receiving = parseFloat(Number(receivingBalanceOp.data.balance).toFixed(4));
    //set balance
    let balance = parseFloat(Number(sending + receiving).toFixed(4))
    //return balance
    return reply(true, 'got balance', {balance, sending, receiving});
  }
  //end getBalance()


  //======================
  /// END BALANCE ///
  






  /// ADDRESSES ///
  //===========================
  
  //10 available addresses
  //available addrsses contain doge and empty available can be used as change
  //change addresses are used from available, sent to pending when used
  //used is removed after transaction is confirmed and stored for up to 30 days
  private sending_addresses = {
    available: [],
    pending: [],
    used: [],
  };


  //raw chain transactions
  //checked to update sending addresses when transactions complete
  private transactions = {

  }
  
  //===========================
  /// END ADDRESSES ///







  


  /// SENDING ///
  //======================
  
  //sending address
  public sending_address = {
    pub_key: '',
    priv_key: '',
  }

  //sending next address
  public sendng_next_address = {
    pub_key: '',
    priv_key: ''
  }


  /*
  * @Params:  amount, fee, receiver_address
  * @Does:    fetches sending unspent
  *           fetches receiving unspent
  *           adds unspent to utx array
  *           signs transaction with sending and receiving
  * @Return:  tx_hex
  */
  public async createSignedTransaction(amount, fee, receiver_address){
    let self = this;
    //satoshi multiplier
    let satoshi_mult = 100000000;
    //get sending unspent
    let sendingUnspentOp = await self.Sochain.getUnspent(self.sending_address.pub_key);
    //got unspent
    let sending_utxs = sendingUnspentOp.data.txs;
    //get receiving unspent
    let receivingUnspentOp = await self.Sochain.getUnspent(self.receiving_address.pub_key);
    //got unspent
    let receiving_utxs = receivingUnspentOp.data.txs;
    //set unspent
    let unspent = [...sending_utxs, ...receiving_utxs];
    //format unspent for bitcore
    unspent = unspent.map(item => {
      return {
        txid: item.txid,
        vout: item.output_no,
        script: item.script_hex,
        amount: item.value
      }
    });
    console.log(unspent)
    //parse current phrase chain
    let parseOp:any = await self.parsePhraseChain(self.phrase_chain);
    //set iterator
    let iterator = parseOp.data.iterator_value;
    //generate phrase chain
    let phraseChainOp:any = await self.generatePhraseChain(self.phrase_chain, (iterator + 1));
    //set new phrase chain
    let next_chain = phraseChainOp.data.phrase_chain;
    //generate next addresses
    let nextAddressesOp:any = await self.generateAddresses(next_chain);
    //set next receiving
    let next_receiving = nextAddressesOp.data.receiving_address;
    //set next sending
    let next_sending = nextAddressesOp.data.sending_address;
    //create transaction
    let tx = new BitcoreDoge.Transaction()
      .from(unspent)
      .to(receiver_address, amount * satoshi_mult)
      .fee(fee * satoshi_mult)
      .change(next_sending.pub_key)
      .sign(self.sending_address.priv_key)
      .sign(self.receiving_address.priv_key)
    console.log(tx);

    let broadastOp = await self.broadcastTransaction(tx.toString());
    console.log(broadastOp)

    return reply(true, 'generated transaction', {hex: tx.toString()});
  }
  //end createSignedTransaction()

  
  /*
  * @Params:  hex
  * @Does:    sends signed transaction hex
  * @Return:  {txid}
  */
  public async broadcastTransaction(hex:string){
    let self = this;
    //broadcast transaction
    let broadcastOp = await self.RadonRequestShooter.post('/broadcast_tx', {hex});
    console.log(broadcastOp);
  }
  //end broadcastTransaction()



  


  public async getSendingTransactions(){
    let self = this;
    //get transactions
    let fetchOp = await self.Sochain.getTransactions(self.sending_address.pub_key);
    //got transactions, return
    return reply(true, 'got transactions', {txs: fetchOp.data.txs});
  }

  
  private generateSendingAddress(){
    
  }
  
  //======================
  /// END SENDING ///

  
  



  


  /// RECEIVING ///
  //======================
  
  //receiving address
  public receiving_address = {
    pub_key: '',
    priv_key: '',
  }
  
  //receiving next address
  public receiving_next_address = {
    pub_key: '',
    priv_key: '',
  }


  public fetchReceivingUnspent(){

  }


  public async getReceivingTransactions(){
    let self = this;
    //get transactions
    let fetchOp = await self.Sochain.getTransactions(self.receiving_address.pub_key);
    //got transactions, return
    return reply(true, 'got transactions', {txs: fetchOp.data.txs});
  }
  
  //======================
  /// END RECEIVING ///





  

  
  /// TRANSACTIONS ///
  //======================
  
  //saved transactions - transactions known to wallet
  public saved_transactions = [];


  
  //======================
  /// END TRANSACTIONS ///
  
  
  
  
  
  
  /// HELPERS ///
  //======================
  
  //sending iterator words
  private sending_iterator_mappings = {
    0: ['food', 'check', 'shiver', 'inquiry', 'differ', 'essence', 'almost', 'bus', 'update', 'journey', 'arrest', 'business'],
    1: ['burst', 'embark', 'tomorrow', 'cherry', 'copy', 'sport', 'juice', 'gasp', 'describe', 'shine', 'burst', 'inhale'],
    2: ['trend', 'glue', 'bring', 'brain', 'gold', 'clog', 'rose', 'alert', 'harvest', 'ride', 'sphere'],
    3: ['balance', 'farm', 'trial', 'vibrant', 'van', 'dawn', 'rebuild', 'sugar', 'alarm', 'ensure', 'actor'],
    4: ['sample', 'cattle', 'genre', 'solution', 'book', 'cross', 'poverty', 'notice', 'kid', 'prepare', 'frozen', 'victory'],
    5: ['warfare', 'arch', 'crop', 'rhythm', 'gap', 'primary', 'crane', 'element', 'wrist', 'awesome', 'giant'],
    6: ['misery', 'solve', 'state', 'fall', 'pitch', 'pause', 'creek', 'result', 'gaze', 'knife', 'oil', 'hundred'],
    7: ['two', 'mom', 'loop', 'shop', 'gospel', 'stage', 'basic', 'physical', 'wine', 'blush', 'square', 'know'],
    8: ['cart', 'corn', 'admit', 'add', 'inject', 'aware', 'verify', 'galaxy', 'call', 'stove', 'pluck', 'local'],
    9: ['senior', 'laundry', 'skate', 'possible', 'develop', 'kiss', 'dry', 'critic', 'aspect', 'discover', 'point', 'weapon']
  }


  /*
  * @Params:  seed
  * @Does:    generates keys for address from seed
  * @Return:  keys
  */
  private async generateKeys(seed):Promise<any>{
    let self = this;
    //create seed hash
    let hash = Crypto.createHash('md5').update(seed).digest('hex');
    //create buffer
    let buff = Buffer.alloc(32, hash);
    //generate keys
    let keys = new CoinKey(buff, CoinInfo('DOGE-TEST'));
    //return with keys
    return reply(true, 'generated keys', {priv_key: keys.privateWif, pub_key: keys.publicAddress});
  }
  //end generateKeys()
  
  //======================
  /// END HELPERS ///
  

}

function reply(s,m,d = {},e = null){return {success:s, message:m, data:d, error:e}}