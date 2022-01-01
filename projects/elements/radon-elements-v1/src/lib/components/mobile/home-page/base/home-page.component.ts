import { Component, OnInit } from '@angular/core';
import { ComponentsControllerService } from '../../../../controllers/components-controller.service';

@Component({
  selector: 'radon-elems-v1-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor(private ComponentsController:ComponentsControllerService) { }

  ngOnInit(): void {
    //init home page
    this.HomePageController.initPage();
  }

  /// CONTROLLERS ///
  //=======================
  
  public HomePageController = this.ComponentsController.HomePage;
  
  //=======================
  /// END CONTROLLERS ///



  

  /// SENDING ///
  //====================
  
  public openSendingPage(){
    let self = this;
    //set sending page
    self.ComponentsController.display_page = 'sending';
  }


  public openReceivingPage(){
    let self = this;
    //ser receiving account
    self.ComponentsController.ReceivingInfoPage.account_id = self.HomePageController.account_id;
    //set sending page
    self.ComponentsController.display_page = 'receiving_info';
  }
  
  //====================
  /// END SENDING ///


}
