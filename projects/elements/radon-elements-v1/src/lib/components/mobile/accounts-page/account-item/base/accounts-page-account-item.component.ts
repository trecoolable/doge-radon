import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { RadonClientControlsV1Service } from 'projects/controls/radon-client-controls-v1/src/public-api';
import { ComponentsControllerService } from 'projects/elements/radon-elements-v1/src/lib/controllers/components-controller.service';

@Component({
  selector: 'radon-elems-v1-accounts-page-account-item',
  templateUrl: './accounts-page-account-item.component.html',
  styleUrls: ['./accounts-page-account-item.component.css']
})
export class AccountsPageAccountItemComponent implements OnInit {

  constructor(private ComponentsController:ComponentsControllerService, private RadonClientControls:RadonClientControlsV1Service) { }

  ngOnInit(): void {
    //init account
    this.initAccountItem();
  }

  /// CONTROLS ///
  //============================
  
  public AccountsControl = this.RadonClientControls.Accounts;
  
  //============================
  /// END CONTROLS ///







  /// ITEM ///
  //==================
  
  @Input() index = 0;

  @Input() info_input:any = null;

  //account item
  public account_item:any = null;

  public account_info = {
    account_id: '',
    name: '',
    created_string: '',
    balance: {
      available: 0,
      pending: 0,
    },
  };
  

  private async initAccountItem() {
    let self = this;
    //set account id
    self.account_info.account_id = self.info_input.account_id;
    //set name
    self.account_info.name = self.info_input.name;
    //set created string
    self.account_info.created_string = moment(self.info_input.date_added).format('MMM DD, YYYY');
    //get account item control
    self.account_item = await self.AccountsControl.getAccountItem(self.info_input.account_id);
    //get balance
    let balanceOp = await self.account_item.getBalance();
    //set available balance
    self.account_info.balance.available = balanceOp.data.available;
    //set pending balance
    self.account_info.balance.pending = balanceOp.data.pending;
  }
  
  
  public openAccountPage(){
    let self = this;
    //set display page
    self.ComponentsController.display_page = 'home';
    //set account
    self.ComponentsController.HomePage.account_id = self.account_info.account_id;
  }

  //==================
  /// END ITEM ///


}
