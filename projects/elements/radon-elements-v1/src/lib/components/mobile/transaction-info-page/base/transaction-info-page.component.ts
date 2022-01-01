import { Component, OnInit } from '@angular/core';
import { ComponentsControllerService } from '../../../../controllers/components-controller.service';

@Component({
  selector: 'radon-elems-v1-transaction-info-page',
  templateUrl: './transaction-info-page.component.html',
  styleUrls: ['./transaction-info-page.component.css']
})
export class TransactionInfoPageComponent implements OnInit {

  constructor(private ComponentsController:ComponentsControllerService) { }

  ngOnInit(): void {
    //init page
    this.TxInfoPageController.initPage();
  }

  /// CONTROLLERS ///
  //======================
  
  public TxInfoPageController = this.ComponentsController.TransactionInfoPage;
  
  //======================
  /// END CONTROLLERS ///

}
