import { ElementRef } from "@angular/core";
import { RadonClientControlsV1Service } from "projects/controls/radon-client-controls-v1/src/public-api";

import QRCodeStyling from 'qr-code-styling';

export class ReceivingInfoPageControllerService {

  constructor(private RadonClientControls:RadonClientControlsV1Service) { }

  
  /// CONTROLS ///
  //========================
  
  private AccountsControl = this.RadonClientControls.Accounts;
  
  //========================
  /// END CONTROLS ///





  /// PAGE ///
  //===========================
  
  //account id
  public account_id = '';

  //account item
  public account_item:any = null;

  //qr code canvas element
  public qr_code_canvas:any = null;

  //receiving info
  public receiving_info = {
    address: ''
  };
  
  /*
  * @Params:  none
  * @Does:    sets account item
  *           sets receiving address
  *           generates qr code image
  */
  public async initPage(){
    let self = this;
    //set account item
    self.account_item = await self.AccountsControl.getAccountItem(self.account_id);
    //set receiving address
    let address = self.account_item.receiving_address.pub_key;
    //set info address
    self.receiving_info.address = address;
  }
  //end initPage()
  
  //===========================
  /// END PAGE ///


}
