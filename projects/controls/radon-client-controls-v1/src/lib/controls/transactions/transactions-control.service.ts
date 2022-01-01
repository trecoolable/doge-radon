import Dexie from "dexie";
import { ArchivedTransactionInfo } from "../../interfaces/archived-transaction/archived-transaction-info";
import { TransactionsItemControlService } from "./item/transactions-item-control.service";

export class TransactionsControlService {

  constructor(private ControlImports) {
    //init db
    this.initTxsDB();
  }




  /// TRANSACTIONS DB ///
  //===========================
  
  //transactions db
  public TxsDB:any = new Dexie('TxsArchiveDB');


  /*
  * @Params:  none
  * @Does:    inits txs db and sets txs table
  */
  private async initTxsDB(){
    let self = this;
    try {
      //init accounts db with columns
      self.TxsDB.version(2).stores({
        txs_archive_table: '++created_id, txid, tx'
      });
      // self.AccountsDB['accounts_table'].clear();
    } catch(error) {
      console.error(error);
    }
  }
  //end initAccountsDB()
  
  //===========================
  /// END TRANSACTIONS DB ///




  

  /// TX ITEMS ///
  //=======================

  //transaction items
  private tx_items:TransactionsItemControlService[] = [];

  public async getTransactionItem(txid) {
    let self = this;
    //get index of item
    let idx = self.tx_items.map(item => { return item.txid }).indexOf(txid);
    //check if has item
    if(idx != -1) return self.tx_items[idx];
    //fetch tx item
    let arr = await self.TxsDB['txs_archive_table'].where('txid').equals(txid).limit(1).toArray();
    //set info
    let info = (arr.length) ? arr[0].tx : null;
    //got item, create tx item
    let tx = new TransactionsItemControlService(txid, self.ControlImports);
    //set existing
    if(info != null) tx.initExistingTx(info);
    //add to accounts array
    self.tx_items.push(tx);
    //return with tx item
    return tx;
  }


  //=======================
  /// END TX ITEMS ///



  


  /// FETCHING ///
  //=======================
  
  /*
  * @Params:  size, last
  * @Does:    fetches archived transactions
  * @Return:  txs
  */
 public async fetchTransactions(size = 15, last = (Date.now() + 500)){
   let self = this;
   //fetch accounts
    let fetch_arr = await self.TxsDB['txs_archive_table'].where('created_id').below(last).reverse().limit(size).toArray();
    //return with accounts
    return reply(true, 'got txs', {txs: fetch_arr.map(item => {return {...item.tx}})});
  }
  //end fetchTransactions()
  
  //=======================
  /// END FETCHING ///


  




  /// ARCHIVING ///
  //=========================

  /*
  * @Params:  tx_obj
  * @Does:    adds transaction to archived transactions
  * @Return:  {tx}
  */
  public async archiveTransaction(tx_obj:ArchivedTransactionInfo){
    //set txid
    let txid = tx_obj.txid;
    let self = this;
    //generate created id
    let created_id = await self.generateCreatedId(tx_obj.created);
    //set created id
    tx_obj.created_id = created_id;
    //insert to transactions
    let insertOp = await self.TxsDB['txs_archive_table'].put({created_id, txid, tx_obj});
    //return inserted
    return reply(true, 'inserted', {tx: tx_obj});
  }
  //end archiveTransaction()



  /*
  * @Params:  created
  * @Does:    generates nonce for created_id
  *           iterates if created_id already exsits
  * @Return:  created_id
  */
  private async generateCreatedId(created) {
    let self = this;
    //set blank created id
    let created_id = created;
    //iterate to set id
    for(let i = 0; i < 5 && created_id == created; i++) {
      //created nonce
      let created_nonce = ((Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000) / 10000);
      //check if has existing
      let arr = await self.TxsDB['txs_archive_table'].where('created_id').equals(created + created_nonce).limit(1).toArray();
      //check if has existing
      if(!arr.length) created_nonce = created + created_nonce;
    }
    //return with created id
    return created_id;
  }
  //end generateCreatedId()

  //=========================
  /// END ARCHIVING ///





  /// SENDING ///
  //========================
  
  
  
  //========================
  /// END SENDING ///

}

function reply(s,m,d = {},e = null){return {success:s, message:m, data:d, error:e}}