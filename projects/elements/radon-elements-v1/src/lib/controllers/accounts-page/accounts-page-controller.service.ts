import { RadonClientControlsV1Service } from "projects/controls/radon-client-controls-v1/src/public-api";

export class AccountsPageControllerService {

  constructor(private RadonClientControls:RadonClientControlsV1Service) { }

  /// CONTROLS ///
  //========================
  
  private AccountsControl = this.RadonClientControls.Accounts;
  
  //========================
  /// END CONTROLS ///





  /// ACCOUNTS ///
  //========================
  
  //accounts list
  public accounts:any = [];

  //first fetch
  public first_fetch = true;

  /*
  * @Params:  none
  * @Does:    sets first fetch to false
  *           fetches recent accounts
  */
  public async initPage(){
    let self = this;
    //check if is first fetch
    if(!self.first_fetch) return;
    //set first fetch
    self.first_fetch = false;
    //fetch accounts
    let fetchOp = await self.AccountsControl.fetchAccounts(15,0);
    //set accounts
    self.accounts = fetchOp.data.accounts;
  }
  //end initPage()



  /*
  * @Params:  none
  * @Does:    generates new account and adds to accounts
  */
  public async createAccount(){
    let self = this;
    //create account
    let createOp:any = await self.AccountsControl.generateAccount('New Account ' + Math.round(Date.now() / (5 * 1000)));
    //created account, set account
    let account = createOp.data.info;
    //add to accounts
    self.accounts.push(account);
  }
  //end createAccount()
  
  //========================
  /// END ACCOUNTS ///

}
