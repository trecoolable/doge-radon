import { Component, OnInit } from '@angular/core';
import { ComponentsControllerService } from 'projects/elements/radon-elements-v1/src/lib/controllers/components-controller.service';

@Component({
  selector: 'radon-elems-v1-sending-page-amount-interface',
  templateUrl: './sending-page-amount-interface.component.html',
  styleUrls: ['./sending-page-amount-interface.component.css']
})
export class SendingPageAmountInterfaceComponent implements OnInit {

  constructor(private ComponentsController:ComponentsControllerService) { }

  ngOnInit(): void {
  }

  /// CONTROLLERS ///
  //=========================
  
  public SendingPageController = this.ComponentsController.SendingPage;
  
  //=========================
  /// END CONTROLLERS ///







  /// NEXT ///
  //=======================
  
  public async next(){
    let self = this;
    //set display stage
    self.SendingPageController.display_stage = 'details';
  }
  
  //=======================
  /// END NEXT ///


}
