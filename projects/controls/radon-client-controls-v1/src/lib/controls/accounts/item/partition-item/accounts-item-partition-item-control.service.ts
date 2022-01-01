declare var Buffer:any;
declare var CoinKey:any;
declare var CoinInfo:any;
declare var Crypto:any;


export class AccountsItemPartitionItemControlService {

  constructor(public seed:string, public itr:number, private ControlImports:any) {
    //generate keys
    this.generateKeys();
  }


  

  /// SOCHAIN ///
  //========================
  
  private Sochain = this.ControlImports.Sochain;
  
  //========================
  /// END SOCHAIN ///






  /// PARTITION ///
  //======================

  //status
  public status = '';

  //stale threshold
  private stale_thresh = 10000;

  //confirm threshold
  private confirm_thresh = 1;


  /*
  * @Params:  data
  * @Does:    sets existing data for partition
  *           checks if balance has been updated recently
  *           if not recent balance, gets balance
  *           if not balance success, uses recent balance and pending txs to figure balance
  *           if has unspent, sets unspent transactions
  *           if has spent, sets spent transactions
  */
  public setExistingPartition(data){
    let self = this;
    //set keys
    let keys = Object.keys(data);
    //iterate through keys to set partition
    for(let i = 0; i < keys.length; i++) {
      //set key
      let key = keys[i];
      switch(key) {
        case('status'): {
          self.status = data[key];
          break;
        }
        
        case('balance'): {
          self.balance.available = data.balance.available;
          self.balance.pending = data.balance.pending;
          self.balance.updated = data.balance.updated;
          break;
        }

        case('unspent'): {
          self.unspent.txs = data.unspent.txs;
          self.unspent.updated = data.unspent.updated;
          break;
        }

        case('spent'): {
          self.spent.txs = data.spent.txs;
          self.spent.updated = data.spent.updated;
          break;
        }
      }
    }
  }
  //end setExistingPartition()



  /*
  * @Params:  none
  * @Does:    generates partition obj to be saved
  */
  public getPartitionObj(){
    let self = this;
    return {
      itr: self.itr,
      status: self.status,
      balance: {
        available: self.balance.available,
        pending: self.balance.pending,
        updated: self.balance.updated,
      },
      unspent: {
        txs: self.unspent.txs,
        updated: self.unspent.updated
      },
      spent: {
        txs: self.spent.txs,
        updated: self.spent.updated
      }
    }
  }
  //end getPartitionObj()
  
  //======================
  /// END PARTITION ///





  /// KEYS ///
  //===================
  
  //keys
  public pub_key = '';
  public priv_key = '';

  /*
  * @Params:  none
  * @Does:    generates keys from seed and iterator
  */
  private generateKeys(){
    let self = this;
    //generate hash
    let hash = Crypto.createHash('md5').update(self.seed + (self.itr + '')).digest('hex');
    //create buffer
    let buff = new Buffer.alloc(32, hash);
    //generate keys
    let keys = new CoinKey(buff, CoinInfo('DOGE-TEST'));
    //set keys
    self.pub_key = keys.publicAddress;
    self.priv_key = keys.privateWif;
  }
  //end generateKeys()
  
  //===================
  /// END KEYS ///







  /// BALANCE ///
  //====================
  
  //balance obj
  public balance = {
    available: 0,
    pending: 0,
    updated: 0
  }


  /*
  * @Params:  force
  * @Does:    gets unspent transactions for address
  *           sets available from confirmed transactions
  *           sets pending from unconfirmed transactions
  */
  public async getBalance(force = false) {
    let self = this;
    //check if has updated
    if(self.balance.updated > Date.now() - self.stale_thresh && !force) return reply(true, 'has balance', {available:self.balance.available, pending:self.balance.pending});
    //get unspent
    let txsOp:any = await self.getUnspentTxs(force);
    //check if success
    if(!txsOp.success) return reply(false, 'could not get balance');
    //set transactions
    let txs = txsOp.data.txs;
    //set available
    let available = txs.filter(tx => { return (tx.confirmations >= self.confirm_thresh) }).reduce((acc, tx) => { return acc + parseFloat(tx.amount) }, 0);
    //set pending
    let pending = txs.filter(tx => { return (tx.confirmations < self.confirm_thresh) }).reduce((acc, tx) => { return acc + parseFloat(tx.amount) }, 0);
    //set balance
    self.balance.available = available;
    self.balance.pending = pending;
    self.balance.updated = Date.now();
    //return balance
    return reply(true, 'got balance', {available, pending});
  }
  //end getBalance()
  
  //====================
  /// END BALANCE ///






  /// TRANSACTIONS ///
  //=========================
  
  //unspent
  public unspent:any = {
    txs: [],
    updated: 0
  }
  
  //spent
  public spent:any = {
    txs: [],
    updated: 0
  }
  
  /*
  * @Params:  none
  * @Does:    gets unspent transactions for address
  * @Return:  txs
  */
  public async getUnspentTxs(force = false){
    let self = this;
    //check if has updated
    if(self.unspent.updated > Date.now() - self.stale_thresh && !force) return reply(true, 'has balance', {txs: self.unspent.txs});
    //does not have balance, get unspent transactions
    let txOp = await self.Sochain.getUnspent(self.pub_key);
    //check if got transactions
    if(!txOp.success) return reply(false, 'could not get unspent txs');
    //got transactions, set txs
    let txs = txOp.data.txs;
    //format transactions
    txs = txs.map(item => {
      return {
        txid: item.txid,
        vout: item.output_no,
        script: item.script_hex,
        amount: parseFloat(item.value),
        confirmations: item.confirmations
      }
    });
    //set utxs
    self.unspent.txs = txs;
    //set updated
    self.unspent.updated = Date.now();
    //return txs
    return reply(true, 'got unspent', {txs});
  }
  //end getUnspentTxs()
  


  /*
  * @Params:  none
  * @Does:    gets spent transactions for address
  * @Return:  txs
  */
  public async getSpentTxs(force = false){
    let self = this;
    //check if has updated
    if(self.spent.updated > Date.now() - self.stale_thresh && !force) return reply(true, 'has balance', {txs: self.spent.txs});
    //does not have balance, get spent transactions
    let txOp = await self.Sochain.getSpent(self.pub_key);
    //check if got transactions
    if(!txOp.success) return reply(false, 'could not get spent txs');
    //got transactions, set txs
    let txs = txOp.data.txs;
    //format transactions
    txs = txs.map(item => {
      return {
        txid: item.txid,
        vout: item.output_no,
        script: item.script_hex,
        amount: parseFloat(item.value),
        confirmations: item.confirmations
      }
    });
    //set utxs
    self.spent.txs = txs;
    //set updated
    self.spent.updated = Date.now();
    //return txs
    return reply(true, 'got spent', {txs});
  }
  //end getSpentTxs()

  //=========================
  /// END TRANSACTIONS ///

}

function reply(s,m,d = {},e = null){return {success:s, message:m, data:d, error:e}}