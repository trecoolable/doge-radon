import { Injectable } from '@angular/core';
import { AccountsControlService } from './controls/accounts/accounts-control.service';
import { TestbedControlService } from './controls/testbed/testbed-control.service';
import { TransactionsControlService } from './controls/transactions/transactions-control.service';
import { RequestShooterService } from './tools/request-shooter/request-shooter.service';
import { SochainToolService } from './tools/sochain/sochain-tool.service';

@Injectable({
  providedIn: 'root'
})
export class RadonClientControlsV1Service {

  constructor() { }



  /// CONTROL IMPORTS ///
  //=========================
  
  private ControlImports = {
    RadonRequestShooter: new RequestShooterService('http://localhost:5000', {}),
    Sochain: new SochainToolService()
  }
  
  //=========================
  /// END CONTROL IMPORTS ///



  /// ACCOUNTS ///
  //====================
  
  public Accounts = new AccountsControlService(this.ControlImports);
  
  //====================
  /// END ACCOUNTS ///



  /// TRANSACTIONS ///
  //====================
  
  public Transactions = new TransactionsControlService(this.ControlImports);
  
  //====================
  /// END TRANSACTIONS ///
  
  
  
  /// TESTBED ///
  //====================
  
  public Testbed = new TestbedControlService();
  
  //====================
  /// END TESTBED ///

}
