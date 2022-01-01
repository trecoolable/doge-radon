import Dexie, { Table } from 'dexie';
import { AccountsItemControlService } from './item/accounts-item-control.service copy 3';


export class AccountsControlService {

  constructor(private ControlImports) { 
    //init accounts
    this.initAccountsDB();
  }


  /// ACCOUNTS DB ///
  //=======================
  
  //accounts db
  private AccountsDB:any = new Dexie('AccountsDB');


  /*
  * @Params:  none
  * @Does:    inits accounts db and sets accounts table
  */
  private async initAccountsDB(){
    let self = this;
    try {
      //init accounts db with columns
      self.AccountsDB.version(1).stores({
        accounts_table: '++account_id, account'
      });
      // self.AccountsDB['accounts_table'].clear();
    } catch(error) {
      console.error(error);
    }
  }
  //end initAccountsDB()
  
  //=======================
  /// END ACCOUNTS DB ///






  /// ACCOUNT ITEMS ///
  //========================

  //account items
  private account_items:AccountsItemControlService[] = [];
  
  public async getAccountItem(account_id) {
    let self = this;
    //get index of item
    let idx = self.account_items.map(item => { return item.account_id }).indexOf(account_id);
    //check if has item
    if(idx != -1) return self.account_items[idx];
    //fetch account item
    let arr = await self.AccountsDB['accounts_table'].where('account_id').equals(account_id).limit(1).toArray();
    //check if has account
    if(!arr.length) return null;
    //set info
    let account_data = arr[0].account;
    //got item, create account item
    let account = new AccountsItemControlService(account_id, self.ControlImports);
    console.log(account)
    //set save account
    account.saveAccountExternal = async (account_obj) => {
      //update account
      let updateOp = await self.AccountsDB['accounts_table'].put({account_id: account.account_id, account: account_obj});
      //return updated
      return updateOp;
    };
    //set existing
    account.setExisitingAccount(account_data);
    //add to accounts array
    self.account_items.push(account);
    //return with account item
    return account;
  }
  
  //========================
  /// END ACCOUNT ITEMS ///






  /// FETCHING ///
  //=======================
  
  /*
  * @Params:  size, last
  * @Does:    fetches accounts
  * @Return:  accounts
  */
  public async fetchAccounts(size:number = 15, last:number = 0):Promise<any> {
    let self = this;
    //fetch accounts
    let fetch_arr = await self.AccountsDB['accounts_table'].where('account_id').above(last).limit(size).toArray();
    //return with accounts
    return reply(true, 'got accounts', {accounts: fetch_arr.map(item => {return {...item.account}})});
  }
  //end loadAccounts()
  
  //=======================
  /// END FETCHING ///







  /// CREATING ///
  //=======================
  
  /*
  * @Params:  none
  * @Does:    generates account and adds to db
  */
  public async generateAccount(name:string){
    let self = this;
    //create account item
    let account = new AccountsItemControlService((Date.now() + ''), self.ControlImports);
    //set save account
    account.saveAccountExternal = async (account_obj) => {
      //update account
      let updateOp = await self.AccountsDB['accounts_table'].put({account_id: account.account_id, account: account_obj});
      //return updated
      return updateOp;
    };
    //init new account
    let initOp = await account.initNewAccount();
    //insert account
    self.account_items.push(account);
    //get account obj
    let account_obj = account.getAccountObj();
    //return with account info
    return reply(true, 'generated account', {info: account_obj});
  }
  //end generateAccount()
  
  //=======================
  /// END CREATING ///







  /// DELETING ///
  //=======================

  /*
  * @Params:  account_id
  * @Does:    deletes account
  * @Return:  success
  */
  public async deleteAccount(account_id:string){
    let self = this;
    //delete account item
    let deleteOp = await self.AccountsDB['account_table'].delete(account_id);
    //return with success
    return reply(true, 'deleted account');
  }
  //end deleteAccount()
  
  //=======================
  /// END DELETING ///


}

function reply(s,m,d = {},e = null){return {success:s, message:m, data:d, error:e}}