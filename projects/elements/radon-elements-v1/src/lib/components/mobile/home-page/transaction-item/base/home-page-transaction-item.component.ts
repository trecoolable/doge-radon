import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { RadonClientControlsV1Service } from 'projects/controls/radon-client-controls-v1/src/public-api';
import { ComponentsControllerService } from 'projects/elements/radon-elements-v1/src/lib/controllers/components-controller.service';

@Component({
  selector: 'radon-elems-v1-home-page-transaction-item',
  templateUrl: './home-page-transaction-item.component.html',
  styleUrls: ['./home-page-transaction-item.component.css']
})
export class HomePageTransactionItemComponent implements OnInit {

  constructor(private ComponentController:ComponentsControllerService, private RadonClientControls:RadonClientControlsV1Service) { }

  ngOnInit(): void {
    //init tx
    this.initTx();
  }

  /// CONTROLS ///
  //========================
  
  public AccountsControl = this.RadonClientControls.Accounts;
  public TransactionsControl = this.RadonClientControls.Transactions;
  
  //========================
  /// END CONTROLS ///




  /// ACCOUNT ///
  //====================

  //account id
  @Input() account_id = '';

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




  /// TX ///
  //====================
  
  @Input() txid = '';

  public tx_item:any = null;

  public tx_info = {
    txid: '',
    direction: '',
    amount: 0,
    memo: '',
    created_string: ''
  }
  

  private async initTx(){
    let self = this;
    //init account
    await self.initAccount();
    //set account obj
    let account_obj = self.account_item.getAccountInfo();
    //set account addresses
    let account_addresses = [account_obj.sending_address.pub_key, account_obj.receiving_address.pub_key]
    //set tx item
    self.tx_item = await self.TransactionsControl.getTransactionItem(self.txid);
    //get transaction obj
    let tx_obj = self.tx_item.getTxObj();
    //set txid
    self.tx_info.txid = self.txid;
    //check if has created id
    if(tx_obj.created_id) {

    } else {
      //does not have created id, get raw transaction
      let rawOp = await self.tx_item.getRawTx();
      //set tx
      let tx = rawOp.data.tx;
      //get output addresses
      let output_addresses = tx.outputs.map(item => { return item.address });
      //get input addresses
      let input_addresses = tx.inputs.map(item => { return item.address });
      //check if is sending
      let is_sending = (input_addresses.filter(item => { return (account_addresses.indexOf(item) != -1)}).length);
      //check if is receiving
      let is_receving = (output_addresses.filter(item => { return (account_addresses.indexOf(item) != -1)}).length);
      //set direction
      if(is_sending && !is_receving) self.tx_info.direction = 'sent';
      if(!is_sending && is_receving) self.tx_info.direction = 'received';
      if(is_sending && is_receving) self.tx_info.direction = 'recycled';
      //set memo
      self.tx_info.memo = self.tx_info.direction + ' a transaction';
      //check if is sending
      if(self.tx_info.direction == 'sent') {

        console.log(tx.inputs)
      } else if(self.tx_info.direction == 'received') {
        //set received amounts
        let received_amount = tx.outputs.filter(item => { return (account_addresses.indexOf(item.address) != -1) }).reduce((acc, a) => { return acc + parseFloat(Number(a.value).toFixed(4)) }, 0);
        //set amount
        self.tx_info.amount = received_amount.toFixed(4);
      } else {

      }
      //set created date
      self.tx_info.created_string = moment(tx.time * 1000).format('MMM DD, YYYY - HH:mm');
      console.log(tx)
    }
  }



  public openTxPage() {
    let self = this;
    //set account
    self.ComponentController.TransactionInfoPage.account_id = self.account_id;
    //set transaction id
    self.ComponentController.TransactionInfoPage.txid = self.txid;
    //set page
    self.ComponentController.display_page = 'tx_info';

  }
  
  //====================
  /// END TX ///

}
