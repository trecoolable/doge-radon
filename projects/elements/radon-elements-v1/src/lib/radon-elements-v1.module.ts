import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';


import { MobileInterfaceComponent } from './components/mobile/interface/base/mobile-interface.component';
import { MobileSlidePageComponent } from './components/mobile/slide-page/base/mobile-slide-page.component';
import { AccountsPageComponent } from './components/mobile/accounts-page/base/accounts-page.component';
import { AccountsPageAccountItemComponent } from './components/mobile/accounts-page/account-item/base/accounts-page-account-item.component';
import { HomePageComponent } from './components/mobile/home-page/base/home-page.component';
import { HomePageTopBarComponent } from './components/mobile/home-page/top-bar/base/home-page-top-bar.component';
import { HomePageTransactionItemComponent } from './components/mobile/home-page/transaction-item/base/home-page-transaction-item.component';
import { TransactionInfoPageComponent } from './components/mobile/transaction-info-page/base/transaction-info-page.component';
import { SendingPageComponent } from './components/mobile/sending-page/base/sending-page.component';
import { SendingPageAmountInterfaceComponent } from './components/mobile/sending-page/amount-interface/base/sending-page-amount-interface.component';
import { SendingPageDetailsInterfaceComponent } from './components/mobile/sending-page/details-interface/base/sending-page-details-interface.component';
import { SendingPageConfirmInterfaceComponent } from './components/mobile/sending-page/confirm-interface/base/sending-page-confirm-interface.component';
import { ReceivingInfoPageComponent } from './components/mobile/receiving-info-page/base/receiving-info-page.component';



@NgModule({
  declarations: [
    MobileInterfaceComponent,
    MobileSlidePageComponent,
    AccountsPageComponent,
    AccountsPageAccountItemComponent,
    HomePageComponent,
    HomePageTopBarComponent,
    HomePageTransactionItemComponent,
    TransactionInfoPageComponent,
    SendingPageComponent,
    SendingPageAmountInterfaceComponent,
    SendingPageDetailsInterfaceComponent,
    SendingPageConfirmInterfaceComponent,
    ReceivingInfoPageComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule
  ],
  exports: [
    MobileInterfaceComponent
  ]
})
export class RadonElementsV1Module { }
