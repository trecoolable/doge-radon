import * as moment from "moment";
import { RadonClientControlsV1Service } from "projects/controls/radon-client-controls-v1/src/public-api";

export class TransactionInfoPageControllerService {

  constructor(private RadonClientControls:RadonClientControlsV1Service) {}


  /// CONTROLS ///
  //========================
  
  private AccountsControl = this.RadonClientControls.Accounts;
  private TransactionsControl = this.RadonClientControls.Transactions;
  
  //========================
  /// END CONTROLS ///
  
  
  
  
  /// PAGE ///
  //========================

  //txid
  public txid = '';

  //transaction item
  public tx_item:any = null;
  
  public async initPage(){
    let self = this;
    console.log(self.txid)
    //init account
    await self.initAccount();
    //set account obj
    let account_obj = self.account_item.getAccountInfo();
    //set account addresses
    let account_addresses = [account_obj.sending_address.pub_key, account_obj.receiving_address.pub_key]
    //set txid
    self.tx_info.txid = self.txid;
    //set transaction item
    self.tx_item = await self.TransactionsControl.getTransactionItem(self.txid);
    //check if has info
    if(self.tx_item.created_id) {
      //has existing

    } else {
      //does not have existing, fetch raw tx info
      let rawOp = await self.tx_item.getRawTx();
      //got raw transaction, set raw
      let raw = rawOp.data.tx;
      //set not archived
      self.tx_info.memo = 'This transaction is not archived.';
      //set created
      self.tx_info.created_string = moment(raw.time * 1000).format('MMM DD, YYYY - HH:mm');
      //set inputs
      let inputs = raw.inputs;
      //set info inputs
      self.tx_info.inputs = inputs;
      //set outputs
      let outputs = raw.outputs;
      //set info outputs
      self.tx_info.outputs = outputs;
      //check if is sending
      let is_sending = (inputs.filter(item => { return (account_addresses.indexOf(item.address) != -1)}).length);
      //check if is receiving
      let is_receving = (outputs.filter(item => { return (account_addresses.indexOf(item.address) != -1)}).length);
      //set direction
      if(is_sending && !is_receving) self.tx_info.direction = 'sent';
      if(!is_sending && is_receving) self.tx_info.direction = 'received';
      if(is_sending && is_receving) self.tx_info.direction = 'recycled';
      //check if is sending
      if(self.tx_info.direction == 'sent') {

        console.log(inputs)
      } else if(self.tx_info.direction == 'received') {
        //set received amounts
        let received_amount = outputs.filter(item => { return (account_addresses.indexOf(item.address) != -1) }).reduce((acc, a) => { return acc + parseFloat(Number(a.value).toFixed(4)) }, 0);
        //set amount
        self.tx_info.amount = received_amount;
        console.log('outputs')
        console.log(outputs)
      } else {

      }

      console.log(raw);
    }
    //get transaction info
  }
  
  //========================
  /// END PAGE ///





  /// ACCOUNT ///
  //====================

  //account id
  public account_id = '';

  //account item
  public account_item:any = null;
  
  /*
  * @Params:  none
  * @Does:    sets first fetch to false
  *           fetches recent accounts
  */
  public async initAccount(){
    let self = this;
    //set account item
    self.account_item = await self.AccountsControl.getAccountItem(self.account_id);
  }
  //end initPage()
  
  //====================
  /// END ACCOUNT ///
  





  /// TRANSACTION ///
  //========================

  //tx info
  public tx_info = {
    txid: '',
    direction: '',
    memo: '',
    inputs: [],
    outputs: [],
    amount: 0,
    created_string: '',
  }

  //========================
  /// END TRANSACTION ///


}
