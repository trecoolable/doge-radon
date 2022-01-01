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
  //==================
  
  //name
  public name = '';

  //created
  public created = 0;

  //seed chain
  public seed = '';


  /*
  * @Params:  none
  * @Does:    creates seed chain
  *           generates sending and receiving addresses
  *           saves account
  */
  public async initAccount(){
    let self = this;
    //set name
    self.name = 'Account ' + Math.round(Date.now() / 1000)
    //generate seed
    let seed = BIP39.generateMnemonic();
    //set seed
    self.seed = seed;
    //iterate to generate sending and receiving addresses
    for(let i = 0; i < 5; i++){
      //generate sending
      let sendingOp = await self.generateAddress('sending');
      //generate receiving
      let receivingOp = await self.generateAddress('receiving');
    }
    //set created
    self.created = Date.now();
    //save account
    self.saveAccount();
  }
  //end initAccount()



  /*
  * @Params:  data
  * @Does:    inits exsiting account from external accunt data
  */
  public initExisting(data){

  }
  //end initExsiting()


  
  /*
  * @Params:  none
  * @Does:    gets account info obj
  */
  public getAccountObj(){
    let self = this;
    //create obj
    let account = {
      account_id: self.account_id,
      name: self.name,
      seed: self.seed,
      created: self.created,
      addresses: self.addresses.map(item => {
        return {
          status: item.status,
          type: item.type,
          itr: item.itr
        }
      })
    };
    //return account
    return account;
  }
  //end getAccountObj()



  /*
  * @Params:  none
  * @Does:    calls external save account
  */
  public saveAccount(){
    console.log('saveAccount() not set');
  }
  //end saveAccount()
  
  //==================
  /// END INFO ///





  /// ADDRESSES ///
  //========================
  
  //addresses
  public addresses:{status:string, type: string, itr:number}[] = [];


  /*
  * @Params:  none
  * @Does:    generates sending or receiving address with account seed and iterator
  * @Return:  {address}
  */
  private async generateAddress(type) {
    let self = this;
    //get highest iterator
    let highest_itr = 0;
    //check if has addresses
    if(self.addresses.length) highest_itr = Math.max(...self.addresses.map(item => {return item.itr}));
    //set iterator
    let iterator = highest_itr + 1;
    //generate address with seed
    let seed = self.seed + type + (iterator + '');
    //generate hash
    let hash = Crypto.createHash('md5').update(seed).digest('hex');
    //create buffer
    let buff = new Buffer.alloc(32, hash);
    //generate keys
    let keys = new CoinKey(buff, CoinInfo('DOGE-TEST'));
    //set address
    let address = {
      status: 'available',
      type: type,
      itr: iterator
    }
    //push to address
    self.addresses.push(address);
    //return with address
    return reply(true, 'generated address', {address, pub_key: keys.publicAddress, priv_key: keys.privateWif});
  }
  //end generateAddress()



  /*
  * @Params:  none
  * @Does:    constructs address from seed, type, and itr
  * @Return:  {address: {pub_key, priv_key}}
  */
  private constructAddress(type, itr) {
    let self = this;
    //generate address with seed
    let seed = self.seed + type + (itr + '');
    //generate hash
    let hash = Crypto.createHash('md5').update(seed).digest('hex');
    //create buffer
    let buff = new Buffer.alloc(32, hash);
    //generate keys
    let keys = new CoinKey(buff, CoinInfo('DOGE-TEST'));
    //return address
    return reply(true, 'constructed address', {address: {pub_key: keys.privateWif, priv_key: keys.publicAddress}});
  }
  //end constructAddress()



  /*
  * @Params:  pub_key
  * @Does:    gets unspent transactions for address
  * @Return:  {txs}
  */
  private async getUnspent(pub_key) {
    let self = this;
    //get unspent
    let getOp = await self.Sochain.getUnspent(pub_key);
    //return transactions
    return reply(true, 'got unspent', {txs: getOp.data.txs});
  }
  //end getUnspent()

  
  //========================
  /// END ADDRESSES ///









  /// BALANCE ///
  //=========================

  public balance = {
    available: 0,
    pending: 0,
    updated: 0
  }
  
  /*
  * @Params:  none
  * @Does:    gets balance of available and pending addresses
  * @Return:  {available, pending}
  */
  public async getBalance(){
    let self = this;
    //set empty pending
    let pending = 0;
    //set empty available
    let available = 0;
    //check if updated within 5 seconds
    if(self.balance.updated > (Date.now() - (5 * 60000))) return reply(true, 'has balance', {available:self.balance.available, pending:self.balance.pending});
    //iterate through addresses
    for(let i = 0; i < self.addresses.length; i++) {
      //set address item
      let item = self.addresses[i];
      //construct address
      let constructOp:any = await self.constructAddress(item.type, item.itr);
      //set address
      let address = constructOp.data.address;
      //get unspent
      let unspentOp = await self.Sochain.getUnspent(address.pub_key);
      //got transactions
      let txs = unspentOp.data.txs;
      //iterate through unspent to get confirmed and unconfirmed
      for(let ii = 0; ii < txs.length; i++){
        //set tx item
        let tx_item = txs[ii];
        //add amount to balance
        (tx_item.confirmations >= 3) ? (available += parseFloat(tx_item.value)) : (pending += parseFloat(tx_item.value));
      }
    }
    //set balance
    self.balance.available = available;
    self.balance.pending = pending;
    self.balance.updated = Date.now();
    //return balance
    return reply(true, 'got balance', {available, pending});
  }
  //end getBalance()
  
  //=========================
  /// END BALANCE ///







  /// TRANSACTIONS ///
  //=============================
  
  /*
  * @Params:  amount, fee, recipient
  * @Does:    creates transaction
  * @Return:  {hex}
  */
  public async createTransaction(amount, fee, recipient){
    let self = this;
    //set satoshi multiplier
    let satoshi_mult = 100000000;
    //set available addresses
    let available_addresses:{address: {priv_key:string, pub_key:string}, balance: number, itr: number}[] = [];
    //set change
    let change_address:any = null;
    //iterate to get all unspent
    for(let i = 0; i < self.addresses.length; i++) {
      //set address item
      let item = self.addresses[i];
      //check if is available
      if(item.status == 'available') {
        //construct address
        let constructOp:any = await self.constructAddress(item.type, item.itr);
        //set address
        let address = constructOp.data.address;
        //get balance with at least 3 confirmations
        let balanceOp = await self.Sochain.getBalance(address.pub_key, 3);
        //check if has balance, add to available
        if(balanceOp.data.balance > 0) {
          //push available
          available_addresses.push({address: {priv_key: address.priv_key, pub_key: address.pub_key}, balance: balanceOp.data.balance, itr: i});
        } else {
          //address is unavailable, set change
          change_address = {address: {priv_key: address.priv_key, pub_key: address.pub_key}, balance: balanceOp.data.balance, itr: i};
        }
        //check if total available is greater or equal to amount
        if(available_addresses.reduce((acc, a) => { return acc + a.balance}, 0) >= amount + 5) i = self.addresses.length + 1;
      }
    }
    //check if has change address
    if(change_address == null) {
      //generate new change address
      let changeOp:any = await self.generateAddress('receiving');
      //set change
      change_address = {priv_key: changeOp.data.priv_key, pub_key: changeOp.data.pub_key};
    }
    //set empty transactions
    let utxs:any = [];
    //fetch transactions for each address
    for(let i = 0; i < available_addresses.length; i++){
      //set item
      let item = available_addresses[i];
      //fetch transactions
      let txOp:any = await self.Sochain.getUnspent(item.address.pub_key);
      //add transacitons to unspent
      utxs = [...utxs, ...txOp.data.txs];
    }
    //format utxs
    utxs = utxs.map(item => {
      return {
        txid: item.txid,
        vout: item.output_no,
        script: item.script_hex,
        amount: item.value
      }
    });
    //create initial transaction
    let tx = new BitcoreDoge.Transaction()
      .from(utxs)
      .to(recipient, amount * satoshi_mult)
      .fee(fee * satoshi_mult)
      .change(change_address.pub_key)
    //sign for each input address
    for(let i = 0; i < available_addresses.length; i++) {
      //set address
      let item = available_addresses[i];
      //sign with priv key
      tx = tx.sign(item.address.priv_key);
    }
    return reply(true, 'generated transaction', {hex: tx.toString()});
  }
  //end createTransaction()


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
  
  //=============================
  /// END TRANSACTIONS ///


}

function reply(s,m,d = {},e = null){return {success:s, message:m, data:d, error:e}}