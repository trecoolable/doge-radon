import { Injectable } from '@angular/core';
import { RadonClientControlsV1Service } from 'projects/controls/radon-client-controls-v1/src/public-api';
import { SendingPageComponent } from '../components/mobile/sending-page/base/sending-page.component';
import { AccountsPageControllerService } from './accounts-page/accounts-page-controller.service';
import { HomePageControllerService } from './home-page/home-page-controller.service';
import { ReceivingInfoPageControllerService } from './receiving-info-page/receiving-info-page-controller.service';
import { SendingPageControllerService } from './sending-page/sending-page-controller.service';
import { TransactionInfoPageControllerService } from './transaction-info-page/transaction-info-page-controller.service';

@Injectable({
  providedIn: 'root'
})
export class ComponentsControllerService {

  constructor(private RadonClientControls:RadonClientControlsV1Service) { }



  /// ACCOUNTS PAGE ///
  //============================
  
  public AccountsPage: AccountsPageControllerService = new AccountsPageControllerService(this.RadonClientControls);
  
  //============================
  /// END ACCOUNTS PAGE ///
  
  
  
  /// HOME PAGE ///
  //============================
  
  public HomePage: HomePageControllerService = new HomePageControllerService(this.RadonClientControls);
  
  //============================
  /// END HOME PAGE ///



  /// RECEIVING INFO ///
  //==========================
  
  public ReceivingInfoPage: ReceivingInfoPageControllerService = new ReceivingInfoPageControllerService(this.RadonClientControls);
  
  //==========================
  /// END RECEIVING INFO ///



  /// SENDING PAGE ///
  //=======================

  public SendingPage: SendingPageControllerService = new SendingPageControllerService(this.RadonClientControls);

  //=======================
  /// END SENDING PAGE ///



  /// TRANSACTION INFO ///
  //=============================
  
  public TransactionInfoPage: TransactionInfoPageControllerService = new TransactionInfoPageControllerService(this.RadonClientControls);
  
  //=============================
  /// END TRANSACTION INFO ///



  /// PAGES ///
  //=======================
  
  //display page
  public display_page = 'accounts';
  // public display_page = 'home';
  
  //=======================
  /// END PAGES ///



}
