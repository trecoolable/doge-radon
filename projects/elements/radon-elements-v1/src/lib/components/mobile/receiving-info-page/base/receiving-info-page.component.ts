import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ComponentsControllerService } from '../../../../controllers/components-controller.service';

import * as QRious from 'qrious';


@Component({
  selector: 'radon-elems-v1-receiving-info-page',
  templateUrl: './receiving-info-page.component.html',
  styleUrls: ['./receiving-info-page.component.css']
})
export class ReceivingInfoPageComponent implements OnInit, AfterViewInit {

  constructor(private ComponentsController:ComponentsControllerService) { }

  ngOnInit(): void {
    //init page
    this.ReceivingInfoPageController.initPage();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      //render qr code
      this.renderQRCode();
    }, 200);
  }

  /// CONTROLLERS ///
  //===========================
  
  public ReceivingInfoPageController = this.ComponentsController.ReceivingInfoPage;

  //===========================
  /// END CONTROLLERS ///





  /// CANVAS ///
  //===================
  
  //canvas element
  @ViewChild('QRCodeCanvasElement') QRCodeCanvasElement;
  

  /*
  * @Params:  none
  * @Does:    renders qr code to canvas
  */
  private renderQRCode(){
    let self = this;
    //set address
    let address = self.ReceivingInfoPageController.receiving_info.address;
    console.log(address)
    //set canvas
    let canvas = this.QRCodeCanvasElement.nativeElement;
    //get parent
    let canvas_parent = canvas.parentElement;
    //generate code
    let qr = new QRious({
      element: canvas,
      size: canvas_parent.clientWidth,
      level: 'H',
      background: '#FFF',
      backgroundAlpha: 1,
      value: address
    });
  }
  //end renderQRCode()

  //===================
  /// END CANVAS ///



}
