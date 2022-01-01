import { partition } from "rxjs";
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


  public async initNewAccount(){
    let self = this;
    //set name
    self.name = 'Account ' + Math.round(Date.now() / 1000)
    //generate seed
    let seed = BIP39.generateMnemonic();
    //set seed
    self.seed = seed;
    //generate first partition
    let partitionOp:any = await self.generatePartition();
    //push partition into partitions
    self.partitions.push(partitionOp.data.partition);
    //save account
    self.saveAccount();
  }


  public async initExistingAccount(data){
    let self = this;
    //set account id
    self.account_id = data.account_id;
    //set name
    self.name = data.name;
    //set created
    self.created = data.created;
    //set seed
    self.seed = data.seed;
    //set pending transactions
    self.pending_txs = data.pending_txs;
    //init partitions
    let partitionsOp = await self.initPartitions(data.partitions);
    //get balance
    let balanceOp = await self.getBalance();
    //return with existing
    return reply(true, 'initialized account', {account: self.getAccountObj()});
  }


  public getAccountObj(){
    let self = this;
    //return account obj
    return {
      account_id: self.account_id,
      name: self.name,
      created: self.created,
      seed: self.seed,
      partitions: self.partitions,
      balance: self.balance,
      pending_txs: self.pending_txs,
    };
  }


  public async saveAccount(){
    let self = this;
    console.log(self.partitions)
    //get account obj
    let account_obj:any = self.getAccountObj();
    //map partitions to basic info
    account_obj.partitions = account_obj.partitions.map(item => {
      return {
        itr: item.itr,
        status: item.status,
        linked_tx: item.linked_tx,
      }
    });
    //save account obj to external
    await self.saveAccountExternal(account_obj);
  }


  public saveAccountExternal = async (account_obj) => {
    console.log('saveAccountExternal() not set');
  }


  //==================
  /// END INFO ///





  /// ADDRESSES ///
  //========================
  
  //partitions
  public partitions:{status:string,     //'', tx_spent, tx_change
                     pub_key:string,
                     priv_key:string, 
                     itr:number, 
                     available:number, 
                     pending:number, 
                     updated?:number, 
                     utxs?:any, 
                     stxs?:any,
                     linked_tx:string}[] = [];

  //partition count
  public partition_count = 5;


  private getPartitionItem(itr) {
    let self = this;
    //get index of itr
    let idx = self.partitions.map(item => { return item.itr }).indexOf(itr);
    //return partition
    return (idx != -1) ? self.partitions[idx] : null;
  }


  private deletePartitionItem(itr) {
    let self = this;
    //get index of itr
    let idx = self.partitions.map(item => { return item.itr }).indexOf(itr);
    //check if has idx, splice
    if(idx != -1) self.partitions.splice(idx, 1);
  }


  /*
  * @Params:  none
  * @Does:    gets info about partition
  *           does housekeeping if needed
  */
  private async initPartitions(partitions){
    let self = this;
    //set empty promise array
    let promises:any = [];
    //iterate through addresses to get info
    for(let i = 0; i < partitions.length; i++) {
      //push info into promises
      let op = getInfo(partitions[i]);
      //add to promises
      promises.push(op);
    }
    //get info for all partitions
    await Promise.all(promises);
    //get info function
    async function getInfo(partition) {
      console.log(partition)
      //get partition info
      let infoOp:any = await self.getPartitionInfo(partition.itr);
      //set info
      let info = infoOp.data.partition;
      //set existing partition data
      let keys = Object.keys(info)
      //iterate through keys to set info
      for(let i = 0; i < keys.length; i++) {
        let key = keys[i];
        //set key
        if(partition[key] != undefined) info[key] = partition[key];
      }
      //got info, add partition to partitions
      self.partitions.push(info);
    }
    console.log(self)
  }
  //end initPartitions()



  /*
  * @Params:  none
  * @Does:    generates sending or receiving address with account seed and iterator
  * @Return:  {address}
  */
  private async generatePartition() {
    let self = this;
    //get highest iterator
    let highest_itr = 0;
    //check if has partitions
    if(self.partitions.length) highest_itr = Math.max(...self.partitions.map(item => {return item.itr}));
    //set iterator
    let iterator = highest_itr + 1;
    //generate address with seed
    let seed = self.seed + (iterator + '');
    //generate hash
    let hash = Crypto.createHash('md5').update(seed).digest('hex');
    //create buffer
    let buff = new Buffer.alloc(32, hash);
    //generate keys
    let keys = new CoinKey(buff, CoinInfo('DOGE-TEST'));
    //set partition
    let partition = {
      status: '',
      pub_key: keys.publicAddress,
      priv_key: keys.privateWif,
      itr: iterator,
      utxs: [],
      stxs: [],
      available: 0,
      pending: 0
    };
    //return with address
    return reply(true, 'generated partition', {partition});
  }
  //end generatePartition()



  /*
  * @Params:  itr
  * @Does:    gets partition info
  * @Return:  {partition}
  */
  private async getPartitionInfo(itr){
    let self = this;
    //confirmation threshold
    let confirmation_threshold = 1;
    //set blank partition
    let partition = {
      status: '',
      pub_key: '',
      priv_key: '',
      itr: itr,
      utxs: [],
      stxs: [],
      available: 0,
      pending: 0,
      linked_tx: '',
    };
    //construct address
    let addressOp:any = await self.constructAddress(itr);
    //set public and priv key
    partition.pub_key = addressOp.data.pub_key;
    partition.priv_key = addressOp.data.priv_key;
    //constructed address, get unspent transactions
    let unspentOp = await self.Sochain.getUnspent(partition.pub_key);
    //set unspent txs
    let unspent = unspentOp.data.txs;
    //set utxs
    partition.utxs = unspent.map(item => {
      return {
        txid: item.txid,
        vout: item.output_no,
        script: item.script_hex,
        amount: parseFloat(item.value),
        confirmations: item.confirmations
      }
    });
    //set avaialble array
    let available_txs = unspent.filter(tx => { return (tx.confirmations >= confirmation_threshold)});
    //set pending
    let pending_txs = unspent.filter(tx => { return (tx.confirmations < confirmation_threshold)});
    //set available balance
    partition.available = available_txs.reduce((acc, tx) => { return acc + parseFloat(tx.value) }, 0);
    //set pending balance
    partition.pending = pending_txs.reduce((acc, tx) => { return acc + parseFloat(tx.value) }, 0);
    //constructed address, get unspent transactions
    let spentOp = await self.Sochain.getSpent(partition.pub_key);
    //set unspent txs
    let spent = spentOp.data.txs;
    //set spent
    partition.stxs = spent.map(item => {
      return {
        txid: item.txid,
        vout: item.output_no,
        script: item.script_hex,
        amount: parseFloat(item.value),
        confirmations: item.confirmations
      }
    });
    //get index of partition item
    let idx = self.partitions.map(item => {return item.itr}).indexOf(itr);
    //check if has partition, update info
    // if(idx != -1) {
    //   //update keys
    //   Object.keys(self.partitions[idx]).forEach(key => {
    //     //check if has info
    //     if(partition[key] != undefined) self.partitions[idx][key] = partition[key];
    //   });
    //   //set updated
    //   self.partitions[idx].updated = Date.now();
    // }
    //return partition
    return reply(true, 'got info', {partition});
  }
  //end getPartitionInfo()
  


  /*
  * @Params:  none
  * @Does:    constructs address from seed and itr
  * @Return:  {pub_key, priv_key}
  */
  private constructAddress(itr) {
    let self = this;
    //generate address with seed
    let seed = self.seed + (itr + '');
    //generate hash
    let hash = Crypto.createHash('md5').update(seed).digest('hex');
    //create buffer
    let buff = new Buffer.alloc(32, hash);
    //generate keys
    let keys = new CoinKey(buff, CoinInfo('DOGE-TEST'));
    //return address
    return reply(true, 'constructed address', {pub_key:keys.publicAddress, priv_key:keys.privateWif});
  }
  //end constructAddress()


  private clearSpent(){

  }

  //========================
  /// END ADDRESSES ///









  /// BALANCE ///
  //=========================

  //balance
  public balance = {available: 0, pending: 0, updated: 0};

  /*
  * @Params:  none
  * @Does:    gets partition info and utxos for all addresses
  *           sets available and pending based on confirmations
  */
  public async getBalance(){
    let self = this;
    //set available
    let available = 0;
    //set pending
    let pending = 0;
    //iterate through partitions to get utxos
    for(let i = 0; i < self.partitions.length; i++) {
      //set partition item
      let partition = self.partitions[i];
      //get partition info
      let partitionOp:any = await self.getPartitionInfo(partition.itr);
      //got partition info, set info
      let info = partitionOp.data.partition;
      //add to available
      available += info.available;
      //add to pending
      pending += info.pending;
    }
    //set available
    self.balance.available = available;
    //set pending
    self.balance.pending = pending;
    //return balance
    return reply(true, 'got balance', {available, pending})
  }
  //end getBalance()

  //=========================
  /// END BALANCE ///







  /// TRANSACTIONS ///
  //=============================

  //pending transactions
  public pending_txs: {txid: string}[] = [];
  
  public async createTransaction(amount, fee, recipient){
    let self = this;
    //set satoshi multiplier
    let satoshi_mult = 100000000;
    //get inputs
    let inputsOp:any = await self.txsGetInputPartitionsAndChange(amount + fee);
    console.log(inputsOp)
    //got inputs, set inputs
    let inputs = inputsOp.data.inputs;
    //set input utxs
    let utxs = inputsOp.data.utxs;
    //set change amount
    let change_amount = inputsOp.data.change_amount;
    //get available slots
    let available_count = self.partition_count - inputs.length;
    //generate change outputs
    let changeGenerateOp:any = await self.txsGenerateChangeOutputs(change_amount, available_count);
    //set change outputs
    let change_outputs = changeGenerateOp.data.outputs;
    //create transaction
    let tx = new BitcoreDoge.Transaction()
      .from(utxs)
      .to(recipient, amount * satoshi_mult)
      .fee(fee * satoshi_mult)
    //iterate through change outputs
    for(let i = 0; i < change_outputs.length; i++) {
      //set output
      let output = change_outputs[i];
      //add to or change
      tx = (change_outputs[i].amount != -1) ? (tx.to(output.partition.pub_key, output.amount * satoshi_mult)) : (tx.change(output.partition.pub_key));
    }
    //sign for each input key
    for(let i = 0; i < inputs.length; i++) {
      //set input
      let input = inputs[i];
      //set partition item
      let partition:any = self.getPartitionItem(input.itr);
      //check if has partition
      // if(!partition)
      //has partition, set status
      partition.status = 'input';
      //sign with priv key
      tx = tx.sign(partition.priv_key);
    }
    //save account
    self.saveAccount();
    console.log(tx)
    //broadcast transaction
    let broadcastOp:any = await self.broadcastTransaction(tx.toString());
    console.log(broadcastOp)
    //check if success
    if(!broadcastOp.success) {
      //did not broadcast, remove change partitions
      for(let i = 0; i < change_outputs.length; i++) {
        //set output
        let output = change_outputs[i];
        //delete partition
        self.deletePartitionItem(output.partition.itr);
      }
      //unset input statuses
      for(let i = 0; i < inputs.length; i++) {
        //set input
        let input = inputs[i];
        //set partition item
        let partition:any = self.getPartitionItem(input.itr);
        //check if has partition
        // if(!partition)
        //has partition, set status
        partition.status = '';
      }
      //save account
      self.saveAccount();
      console.log(self.partitions)
      //return error
      return reply(false, 'error sending transaction', {});
    } else {
      //sent transaction, set txid
      let txid = broadcastOp.data.txid;
      //iterate through inputs to set transaction link
       for(let i = 0; i < inputs.length; i++) {
        //set input
        let input = inputs[i];
        //set partition item
        let partition:any = self.getPartitionItem(input.itr);
        //check if has partition
        // if(!partition)
        //has partition, set status
        partition.linked_tx = txid;
      }
      //iterate through outputs to set transaction link
      for(let i = 0; i < change_outputs.length; i++) {
        //set output
        let output = change_outputs[i];
        //set partition item
        let partition:any = self.getPartitionItem(output.partition.itr);
        //check if has partition
        // if(!partition)
        //has partition, set status
        partition.linked_tx = txid;
      }
      //save account
      self.saveAccount();
      console.log(self.partitions)
      //return with txid
      return reply(true, 'generated transaction', {txid});
    }
  }


  private async txsGetInputPartitionsAndChange(amount_limit){
    let self = this;
    //set empty input partitions
    let inputs: {itr:number, priv_key:string, pub_key:string, utxs:any, available:number}[] = [];
    //promises for partition info
    let promises:any = [];
    //iterate through partitions to fetch info
    for(let i = 0; i < self.partitions.length; i++) {
      //set partition item
      let partition = self.partitions[i];
      //check if is input
      if(partition.status != 'input') {
        //add to promises
        promises.push(getInfo(partition));
        //check if is last or batch limit
        if((i % 3 == 0) || i == self.partitions.length - 1) {
          //perform promises
          await Promise.all(promises);
          //check if has up to amount
          if(inputs.reduce((acc, item) => { return acc + item.available }, 0) >= amount_limit) i = self.partitions.length + 1;
        }
      }
    }
    console.log(inputs)
    //order inputs from greatest to least
    inputs = inputs.sort((a, b) => { return (a.available - b.available)});
    //set final inputs
    let final_inputs: {itr:number, priv_key:string, pub_key:string, utxs:any, available:number}[] = [];
    //input amount
    let input_amount = 0;
    //iterate through inputs to only include necessary
    for(let i = 0; i < inputs.length && input_amount < amount_limit; i++) {
      //set input item
      let input = inputs[i];
      //add to input amount
      input_amount += input.available;
      //add item to final inputs
      final_inputs.push(input);
    }
    //get change amount
    let change_amount = input_amount - amount_limit;
    //get utxs
    let utxs = [...final_inputs.map(item => {
      return item.utxs
    })];
    //return with inputs and change
    return reply(true, 'got inputs and change', {inputs: final_inputs, change_amount, utxs});
    //partition info function
    async function getInfo(partition){
      //get info for partition
      let infoOp:any = await self.getPartitionInfo(partition.itr);
      //set info
      let info = infoOp.data.partition;
      //check has available
      if(info.available && !info.stxs.filter(tx => { return (tx.confirmations < 1)}).length) {
        //add to inputs
        inputs.push({
          itr: partition.itr,
          priv_key: info.priv_key,
          pub_key: info.pub_key,
          utxs: info.utxs,
          available: info.available
        });
      }
    }
  }


  private async txsGenerateChangeOutputs(change_amount, available_count) {
    let self = this;
    //set initial add count
    let add_count = available_count;
    //iterate from most additional to least to see if divides evenly
    for(let i = add_count; i > 0; i--) {
      //set add count
      add_count = i;
      //check if change can be divided with balance of at least 10
      if(Math.floor(change_amount / add_count) >= 10) i = -1;
    }
    //set empty outputs
    let outputs: {partition:any, amount:number}[] = [];
    //add count is equal to acceptable change amount, generate change
    for(let i = 0; i < add_count; i++) {
      //generate partition
      let partitionOp:any = await self.generatePartition();
      //set partition
      let partition = partitionOp.data.partition;
      //set change share
      let amount = (i < add_count - 1) ? (Math.floor(change_amount / add_count)) : -1;
      //add output
      outputs.push({partition, amount});
      //set status to change
      partition.status = 'change';
      //add to partitions
      self.partitions.push(partition);
    }
    //return with outputs
    return reply(true, 'got change outputs', {outputs});
  }



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
    return broadcastOp;
  }
  //end broadcastTransaction()


  //=============================
  /// END TRANSACTIONS ///


}

function reply(s,m,d = {},e = null){return {success:s, message:m, data:d, error:e}}