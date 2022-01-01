import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentsControllerService } from 'projects/elements/radon-elements-v1/src/lib/controllers/components-controller.service';

@Component({
  selector: 'radon-elems-v1-sending-page-details-interface',
  templateUrl: './sending-page-details-interface.component.html',
  styleUrls: ['./sending-page-details-interface.component.css']
})
export class SendingPageDetailsInterfaceComponent implements OnInit {

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

  //max fee
  public max_fee = 7;

  //min fee
  public min_fee = 1;
  
  //network fee slider
  @ViewChild('FeeSliderElement') FeeSliderElement;
  
  //network fee slider dot
  @ViewChild('FeeDotElement') FeeDotElement;

  //network fee percent postition
  public fee_pos = {
    start: 0,
    diff: 0,
    bar_width: 0,
    percent: 20,
    active: false
  }
  

  /*
  * @Params:  event
  * @Does:    records start position of fee drag
  */
  public sliderStart(event) {
    let self = this;
    //get size of bar
    self.fee_pos.bar_width = self.FeeSliderElement.nativeElement.clientWidth;
    //set start
    self.fee_pos.start = event.offsetX;
    //set active
    self.fee_pos.active = true;
  }
  //end handleSliderStart()



  /*
  * @Params:  event
  * @Does:    sets fee position by start diff 
  */
  public sliderMove(event){
    let self = this;
    //check if is active
    if(!self.fee_pos.active) return;
    //set dot width
    let dot_width = self.FeeDotElement.nativeElement.clientWidth;
    //get difference from start
    let diff = (event.clientX - self.fee_pos.start) - Math.round(dot_width * 2);
    //check if is 0
    if(self.fee_pos.diff <= 0 && diff <= 0) diff = 0;
    //check if is at end
    if(diff >= (self.fee_pos.bar_width - (dot_width * 1.5))) diff = (self.fee_pos.bar_width - (dot_width * 1.5));
    //set pos diff
    self.fee_pos.diff = diff;
    //get percent of difference
    self.fee_pos.percent = Number((self.fee_pos.diff / self.fee_pos.bar_width * 100));
    //set fee amount
    self.SendingPageController.fee_input.value = parseFloat((self.max_fee * (self.fee_pos.percent / 100)).toFixed(4));
  }
  //end handleSliderMove()



  /*
  * @Params:  event
  * @Does:    records start position of fee drag
  */
  public sliderEnd(event) {
    let self = this;
    //set active
    self.fee_pos.active = false;
  }
  //end handleSliderEnd()
  
  //=======================
  /// END NETWORK FEE ///
  

  
  
  //// EDIT ///
  //=======================
  
  public editAmount(){
    let self = this;
    //set display stage
    self.SendingPageController.display_stage = 'amount';
  }

  //=======================
  //// END EDIT ///
  


  
  
  /// NEXT ///
  //=======================
  
  public async next(){
    let self = this;
    //generate transaction
    let createOp = await self.SendingPageController.submit();
    //set display stage
    // self.SendingPageController.display_stage = 'confirm';
  }
  
  //=======================
  /// END NEXT ///

}
