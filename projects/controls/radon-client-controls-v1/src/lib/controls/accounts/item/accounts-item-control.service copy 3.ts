import { AccountsItemPartitionItemControlService } from "./partition-item/accounts-item-partition-item-control.service";

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
  //===================
  
  //name
  public name = '';

  //seed
  public seed = '';

  //created
  public created = 0;

  //stale threshold
  private stale_thresh = 10000;

  //confirm threshold
  private confirm_thresh = 1;


  /*
  * @Params:  none
  * @Does:    sets account name
  *           generates seed
  *           generates first receiving partition
  */
  public async initNewAccount(){
    let self = this;
    //set name
    self.name = 'Account ' + Math.round(Date.now() / 1000)
    //generate seed
    let seed = BIP39.generateMnemonic();
    //set seed
    self.seed = seed;
    //generate first partition
    let partitionOp:any = await self.generatePartition('receiving');
    //save account
    self.saveAccount();
  }
  //end initNewAccount()



  /*
  * @Params:  data
  * @Does:    sets existing account data
  */
  public setExisitingAccount(data) {
    let self = this;
    //set seed
    self.seed = data.seed;
    //set keys
    let keys = Object.keys(data);
    //iterate through keys to set partition
    for(let i = 0; i < keys.length; i++) {
      //set key
      let key = keys[i];
      switch(key) {
        case('name'): {
          self.name = data.name;
          break;
        }
        
        case('seed'): {
          self.seed = data.seed;
          break;
        }

        case('created'): {
          self.created = data.created;
          break;
        }

        case('partitions'): {
          self.partitions = [];
          for(let i = 0; i < data.partitions.length; i++) {
            let item = data.partitions[i];
            let partition = new AccountsItemPartitionItemControlService(self.seed, item.itr, self.ControlImports);
            partition.setExistingPartition(item);
            self.partitions.push(partition);
          }
          break;
        }

        case('pending_txs'): {
          self.pending_txs = data.pending_txs;
          break;
        }
      }
    }
    //unset pending inputs
    for(let i = 0; i < self.partitions.length; i++) {
      //set partition
      let partition = self.partitions[i];
      //check if is pending
      if(partition.status == 'pending_input') partition.status = '';
      //check if is pending change with no amount
      if(partition.status == 'pending_change') self.deletePartition(partition.itr);
    }
    //check pending transactions
    self.pending_txs.forEach(tx => {
      //check pending
      self.checkPendingTx(tx.txid);
      //check if is confirmed
      if(tx.confirmed) self.deletePendingTx(tx.txid);
    })
  }
  //end setExisitingAccount()


  public async saveAccount(){
    let self = this;
    //get account obj
    let account = self.getAccountObj();
    //save account
    let saveOp = await self.saveAccountExternal(account);
    //return saved
    return saveOp;
  }


  public saveAccountExternal = async (account) => { console.warn('saveAccountExternal() not set.'); }
  

  public getAccountObj(){
    let self = this;
    //set partitions
    let partitions:any = [];
    //iterate through partitions
    for(let i = 0; i < self.partitions.length; i++) partitions.push( self.partitions[i].getPartitionObj() );
    return {
      account_id: self.account_id,
      name: self.name,
      seed: self.seed,
      created: self.created,
      partitions: partitions,
      pending_txs: self.pending_txs
    };
  }

  //===================
  /// END INFO ///






  
  /// BALANCE ///
  //=========================

  //balance
  public balance = {available: 0, pending: 0, updated: 0};

  /*
  * @Params:  none
  * @Does:    gets partition info and utxos for all addresses
  *           sets available and pending based on confirmations
  */
  public async getBalance(force = false){
    let self = this;
    //check if has updated
    if(self.balance.updated > Date.now() - self.stale_thresh && !force) return reply(true, 'has balance', {available:self.balance.available, pending:self.balance.pending});
    //set available
    let available = 0;
    //set pending
    let pending = 0;
    //set error
    let error:any = null;
    //iterate through partitions to get balance
    for(let i = 0; i < self.partitions.length && !error; i++) {
      //set partition item
      let partition = self.partitions[i];
      //check if is in pending transaction
      if(self.pending_txs.filter(tx => { return (tx.partitions.map(part => { return part.itr }).indexOf(partition.itr) != -1)}).length) {
        //partition is in pending transaction, skip balance
        
      }

      //get balance
      let balanceOp:any = await partition.getBalance(force);
      //check if success
      if(!balanceOp.success) error = balanceOp;
      //add to available
      available += balanceOp.data.available;
      //add to pending
      pending += balanceOp.data.pending;
    }
    //check if has error
    if(error != null) return reply(false, 'could not get balance', {error});
    //set available
    self.balance.available = available;
    //set pending
    self.balance.pending = pending;
    //set updated
    self.balance.updated = Date.now()
    //save account
    self.saveAccount();
    //return balance
    return reply(true, 'got balance', {available, pending})
  }
  //end getBalance()

  //=========================
  /// END BALANCE ///








  /// PARTITIONS ///
  //======================
  
  //partitions
  public partitions:AccountsItemPartitionItemControlService[] = [];

  //partition limit
  public partition_limit = 7;


  private getPartition(itr) {
    let self = this;
    //get index of itr
    let idx = self.partitions.map(item => { return item.itr }).indexOf(itr);
    //return partition
    return (idx != -1) ? self.partitions[idx] : null;
  }


  private deletePartition(itr) {
    let self = this;
    //get index of itr
    let idx = self.partitions.map(item => { return item.itr }).indexOf(itr);
    //check if has idx, splice
    if(idx != -1) self.partitions.splice(idx, 1);
    //save account
    self.saveAccount();
  }


  /*
  * @Params:  status
  * @Does:    generates partition with status and next iterator
  *           pushes partition to partitions
  */
  private generatePartition(status = '') {
    let self = this;
    //get highest iterator
    let highest_itr = -1;
    //check if has partitions
    if(self.partitions.length) highest_itr = Math.max(...self.partitions.map(item => {return item.itr}));
    //set iterator
    let iterator = highest_itr + 1;
    //set partition
    let partition = new AccountsItemPartitionItemControlService(self.seed, iterator, self.ControlImports);
    //set status
    partition.status = status;
    //push partition
    self.partitions.push(partition);
    //save account
    self.saveAccount();
    //return with partition
    return reply(true, 'generated partition', {partition});
  }
  //end generatePartition()
  
  //======================
  /// END PARTITIONS ///









  /// TRANSACTIONS ///
  //========================


  public async sendTransaction(amount, fee, recipient){
    let self = this;
    //set null error
    let error:any = null;
    //set satoshi multiplier
    let satoshi_mult = 100000000;
    //update partitions
    let updateOp = await self.txUpdatePartitions();
    //check if error
    if(!updateOp.success) return updateOp;
    //get inputs
    let inputsOp:any = await self.txGetInputs(amount + fee);
    //check if success
    if(!inputsOp.success) return inputsOp;
    //set inputs
    let inputs = inputsOp.data.inputs;
    //set utxs
    let utxs = inputsOp.data.utxs;
    //set input amount
    let input_amount = inputs.reduce((acc, a) => { return acc + a.amount }, 0);
    //set change amount
    let change_amount = input_amount - (amount + fee);
    //get available change slots
    let available_change_slots = self.partition_limit - inputs.length;
    //generate change
    let changeOp:any = await self.txGenerateChangeOutputs(change_amount, available_change_slots);
    //check if success
    if(!changeOp.success) return changeOp;
    //set change outputs
    let change_outputs = changeOp.data.outputs;
    //set tx partitions
    let tx_partitions:{itr:number, amount:number}[] = [];
    //create transaction
    let tx = new BitcoreDoge.Transaction()
      .from(utxs)
      .to(recipient, amount * satoshi_mult)
      .fee(fee * satoshi_mult)
    //iterate through change outputs
    for(let i = 0; i < change_outputs.length && error == null; i++) {
      //set output
      let output = change_outputs[i];
      //set amount
      let change_amount = output.amount;
      //get partition
      let partition:any = self.getPartition(output.itr);
      //check if is null
      if(partition == null) error = reply(false, 'null change partition');
      //add change output
      tx = (change_amount != -1) ? (tx.to(partition.pub_key, change_amount * satoshi_mult)) : (tx.change(partition.pub_key));
      //add to tx partitions
      tx_partitions.push({itr:partition.itr, amount:change_amount});
    }
    //iterate through inputs
    for(let i = 0; i < inputs.length && error == null; i++) {
      //set input
      let input = inputs[i];
      //get partition
      let partition:any = self.getPartition(input.itr);
      //check if is null
      if(partition == null) error = reply(false, 'null input partition');
      //add change output
      tx = tx.sign(partition.priv_key);
      //add to tx partitions
      tx_partitions.push({itr:partition.itr, amount:(-1 * input.amount)});
    }
    //check if has error
    if(error) {
      //revert changes
      revertTxChanges();
      //return error
      return error;
    }
    //broadcast transaction
    // let broadacstOp = await self.Sochain.broadcastTransaction(tx.toString());
    let broadcastOp = await self.RadonRequestShooter.post('/broadcast_tx', {hex: tx.toString()});
    //check if success
    if(!broadcastOp.success) {
      //revert changes
      revertTxChanges();
      //return error
      return reply(false, 'error sending transaction', {error: broadcastOp});
    }
    //set txid
    let txid = broadcastOp.data.txid;
    //broadcasted transaction, set used inputs and change
    for(let i = 0; i < self.partitions.length; i++) {
      //set partition
      let partition = self.partitions[i];
      //check if is input
      if(partition.status == 'pending_input') {
        //set status
        partition.status = 'used_input';
        //set balance
        partition.balance.available = 0;
        partition.balance.pending = 0;
      }
      //check if is change
      if(partition.status == 'pending_change') {
        //set change output
        let change_output = change_outputs.filter(item => {return (item.itr == partition.itr)})[0];
        //set status
        partition.status = 'change';
        //set balance
        partition.balance.pending = (change_output.amount != -1) ? change_output.amount : 0;
      }
    }
    //save account
    self.saveAccount();
    //set available balance to minus amount and fee
    self.balance.available = self.balance.available - (amount + fee);
    //save account
    self.saveAccount();
    //add pending transaction
    self.addPendingTx(txid, tx_partitions);
    //save account
    self.saveAccount();
    //return sent
    return reply(true, 'sent transaction', {txid});

    function revertTxChanges(){
      //unset pending inputs
      for(let i = 0; i < self.partitions.length; i++) {
        //set partition
        let partition = self.partitions[i];
        //check if is pending
        if(partition.status == 'pending_input') partition.status = '';
        //check if is pending change with no amount
        if(partition.status == 'pending_change') self.deletePartition(partition.itr);
      }
    }
  }




  private async txUpdatePartitions(){
    let self = this;
    //set null error
    let error:any = null;
    //iterate through partitions to updated
    for(let i = 0; i < self.partitions.length && error == null; i++) {
      //set partition
      let partition = self.partitions[i];
      //check if is not input
      if(partition.status != 'used_input' && partition.status != 'pending_input') {
        //get updated balance
        let balanceOp = await partition.getBalance(true);
        //check if has error
        if(!balanceOp.success) error = balanceOp;
      }
    }
    //check if has error
    if(error != null) return reply(false, 'error updating partitions', {error});
    //return success
    return reply(true, 'updated partitions');
  }


  private txGetInputs(limit){
    let self = this;
    //set empty inputs
    let inputs:any = [];
    //set empty utxos
    let utxs:any = [];
    //set partitions sorted by available
    let partitions = self.partitions
                          .filter(item => { return item.status != 'used_input'})
                          .sort((a, b) => { return (a.balance.available - b.balance.available)});
    //set input amount
    let input_amount = 0;
    //iterate through partitions to fetch unspent
    for(let i = 0; i < partitions.length && input_amount < limit; i++) {
      //set partition
      let partition = partitions[i];
      //check if all utxs are confirmed
      if(!partition.unspent.txs.filter(tx => { return tx.confirmations < self.confirm_thresh }).length && partition.balance.available > 0) {
        //update partition as pending input
        partition.status = 'pending_input';
        //add to inputs
        inputs.push({itr:partition.itr, amount:partition.balance.available });
        //add utxs
        utxs = [...utxs, ...partition.unspent.txs];
        //add to input amount
        input_amount += partition.balance.available;
      }
    }
    //return outputs
    return reply(true, 'generated inputs', {inputs, utxs});
  }


  private async txGenerateChangeOutputs(amount, available_count) {
    let self = this;
    //set empty outputs
    let outputs:any = [];
    //check if has available
    if(available_count < 1) {
      //filter existing partitions with no status
      let partitions = self.partitions.filter(item => { return (item.status != 'used_input' && item.status != 'pending_input') });
      //check if has partitions
      if(partitions.length) {
        //has partitions, set partition
        let partition = partitions[0];
        //add to outputs
        outputs.push({itr: partition.itr, amount: amount});
      } else {
        //does not have partition, set to add one change
        available_count = 1;
      }
    }
    //set initial add count
    let count = available_count;
    //iterate from most additional to least to see if divides evenly
    for(let i = available_count; i > 0; i--) {
      //set add count
      count = i;
      //check if change can be divided with balance of at least 10
      if(Math.floor(amount / count) >= 10) i = -1;
    }
    
    //iterate to generate change partitions
    for(let i = 0; i < count; i++) {
      //generate partition
      let partitionOp:any = await self.generatePartition('pending_change');
      //set partition
      let partition = partitionOp.data.partition;
      //set change amount
      let share = (i < count - 1) ? Math.floor(amount / count) : -1;
      //push output
      outputs.push({itr: partition.itr, amount: share});
    }
    //return outputs
    return reply(true, 'generated outputs', {outputs});
  }
  
  //========================
  /// END TRANSACTIONS ///







  /// PENDING TRANSACTIONS ///
  //========================

  //pending transactions
  public pending_txs:{txid:string, partitions:{itr:number, amount:number}[], confirmed?:boolean}[] = [];


  private getPendingTx(txid) {
    let self = this;
    //get index
    let idx = self.pending_txs.map(item => { return item.txid }).indexOf(txid);
    //check if has index
    return (idx != -1) ? self.pending_txs[idx] : null;
  }


  private addPendingTx(txid, partitions) {
    let self = this;
    //add to pending txs
    self.pending_txs.push({txid, partitions});
    //save account
    self.saveAccount();
  }

  /*
  * @Params:  txid
  * @Does:    removes pending transaction
  */
  public deletePendingTx(txid){
    let self = this;
    //get index of pending
    let idx = self.pending_txs.map(item => { return item.txid }).indexOf(txid);
    //check if has tx, splice tx
    if(idx != -1) self.pending_txs.splice(idx, 1);
    //save account
    self.saveAccount();
  }
  //end deletePending()


  
  /*
  * @Params:  none
  * @Does:    checks confirmations for pending transactions
  *           if has confirmation threshold, removes inputs and sets change addresses to blank status
  *           removes pending transaction from pending
  *           saves account
  */
  public async checkPendingTx(txid) {
    let self = this;
    //set tx
    let pending_tx = self.getPendingTx(txid);
    //check if has tx
    if(pending_tx == null) return;
    //set partitions
    let partitions = pending_tx.partitions;
    //get transaction info
    let txOp:any = await self.Sochain.getTransaction(txid);
    //check if success
    if(!txOp.success) return txOp;
    //set transaction
    let tx = txOp.data.tx;
    //check confirmations
    if(tx.confirmations > self.confirm_thresh) {
      //has sufficient confirmations, remove input partitions
      for(let i = 0; i < partitions.length; i++) {
        //set itr
        let itr = partitions[i].itr;
        //set partition item
        let partition = self.getPartition(itr);
        //check if is input, delete
        if(partition != null && partition.status == 'used_input') self.deletePartition(itr);
      }
      //set confirmed
      pending_tx.confirmed = true;
    }
    //save account
    self.saveAccount();
  }
  //end checkPendingTx()
  
  //========================
  /// END PENDING TRANSACTIONS ///



}

function reply(s,m,d = {},e = null){return {success:s, message:m, data:d, error:e}}