import { RadonClientControlsV1Service } from "projects/controls/radon-client-controls-v1/src/public-api";
import { ComponentsControllerService } from "../components-controller.service";

export class HomePageControllerService {

  constructor(private RadonClientControls:RadonClientControlsV1Service) { }


  /// CONTROLS ///
  //========================
  
  private AccountsControl = this.RadonClientControls.Accounts;
  private TransactionsControl = this.RadonClientControls.Transactions;
  
  //========================
  /// END CONTROLS ///





  /// PAGE ///
  //=======================
  
  /*
  * @Params:  none
  * @Does:    sets first fetch to false
  *           fetches recent accounts
  */
  public async initPage(){
    let self = this;
    //set account item
    self.account_item = await self.AccountsControl.getAccountItem(self.account_id);
    //check if is null
    if(self.account_item == null) return console.log('is null');
    //set account name
    self.account_info.name = self.account_item.name;
    //fetch account balance
    let balanceOp = await self.account_item.getBalance();
    //set balance
    self.account_info.balance.available = balanceOp.data.available;
    self.account_info.balance.pending = balanceOp.data.pending;
  }
  //end initPage()



  
  //=======================
  /// END PAGE ///





  
  /// ACCOUNT ///
  //========================

  //account id
  public account_id = '';

  //account item
  public account_item:any = null;

  //account info
  public account_info = {
    name: '',
    balance: {
      available: 0,
      pending: 0
    },
  }

  //========================
  /// END ACCOUNT ///






  /// TRANSACTIONS ///
  //=========================
  
  //transactions lists
  public display_txs:string[] = [];

  public sending_txs:string[] = [];
  public receiving_txs:string[] = [];
  public archived_txs:string[] = [];


  public async getReceivingTransactions(){
    let self = this;
    //get transactions
    let getOp = await self.account_item.getReceivingTransactions();
    //set transactions to list
    self.receiving_txs = [...self.receiving_txs, ...getOp.data.txs.map(item => {return item.txid})];
    //set display transactions
    self.display_txs = self.receiving_txs;
  }


  public async getSendingTransactions(){
    let self = this;
    //get transactions
    let getOp = await self.account_item.getSendingTransactions();
    //set transactions to list
    self.sending_txs = [...self.sending_txs, ...getOp.data.txs.map(item => {return item.txid})];
    //set display transactions
    self.display_txs = self.sending_txs;
  }


  public async getArchivedTransactions(){
    let self = this;
    //get transactions
    let getOp:any = await self.TransactionsControl.fetchTransactions(15,0);
    //set transactions to list
    self.archived_txs = [...self.archived_txs, ...getOp.data.txs.map(item => {return item.txid})];
    //set display transactions
    self.display_txs = self.archived_txs;
  }
  
  //=========================
  /// END TRANSACTIONS ///




}
