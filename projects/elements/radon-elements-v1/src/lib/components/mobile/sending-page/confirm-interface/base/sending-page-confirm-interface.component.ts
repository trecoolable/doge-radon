import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentsControllerService } from 'projects/elements/radon-elements-v1/src/lib/controllers/components-controller.service';

@Component({
  selector: 'radon-elems-v1-sending-page-confirm-interface',
  templateUrl: './sending-page-confirm-interface.component.html',
  styleUrls: ['./sending-page-confirm-interface.component.css']
})
export class SendingPageConfirmInterfaceComponent implements OnInit {

  constructor(private ComponentsController:ComponentsControllerService) { }

  ngOnInit(): void {
    
  }

  /// CONTROLLERS ///
  //=========================
  
  public SendingPageController = this.ComponentsController.SendingPage;
  
  //=========================
  /// END CONTROLLERS ///





  /// NETWORK FEE ///
  //=======================

  //slider postition
  public slider_pos = {
    start: 0,
    offset: 0,
    percent: 20,
    active: false
  }
  

  /*
  * @Params:  event
  * @Does:    records start position of fee drag
  */
  public sliderStart(event) {
    let self = this;
    console.log('start')
    //set start
    self.slider_pos.start = event.screenY;
    console.log(event)
    //set active
    self.slider_pos.active = true;
  }
  //end handleSliderStart()



  /*
  * @Params:  event
  * @Does:    sets fee position by start diff 
  */
  public sliderMove(event){
    let self = this;
    //check if is active
    if(!self.slider_pos.active) return;
    //get difference from start
    let offset = self.slider_pos.start - event.screenY;
    console.log(event.screenY)
    
    //set pos offset
    self.slider_pos.offset = offset;
  }
  //end handleSliderMove()



  /*
  * @Params:  event
  * @Does:    records start position of fee drag
  */
  public sliderEnd(event) {
    let self = this;
    //set active
    self.slider_pos.active = false;
  }
  //end handleSliderEnd()
  
  //=======================
  /// END NETWORK FEE ///



}
