import { Component, Input, OnInit } from '@angular/core';
import { RadonClientControlsV1Service } from 'projects/controls/radon-client-controls-v1/src/public-api';
import { ComponentsControllerService } from '../../../../controllers/components-controller.service';

@Component({
  selector: 'radon-elems-v1-sending-page',
  templateUrl: './sending-page.component.html',
  styleUrls: ['./sending-page.component.css']
})
export class SendingPageComponent implements OnInit {

  constructor(private ComponentsController:ComponentsControllerService) { }

  ngOnInit(): void {
    //set account
    this.SendingPageController.account_id = this.ComponentsController.HomePage.account_id;
    //init sending page
    this.SendingPageController.initPage();
  }

  /// CONTROLLERS ///
  //=========================
  
  public SendingPageController = this.ComponentsController.SendingPage;
  
  //=========================
  /// END CONTROLLERS ///


}
