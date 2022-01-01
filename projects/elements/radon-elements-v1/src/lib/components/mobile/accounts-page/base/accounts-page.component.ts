import { Component, OnInit } from '@angular/core';
import { ComponentsControllerService } from '../../../../controllers/components-controller.service';

@Component({
  selector: 'radon-elems-v1-accounts-page',
  templateUrl: './accounts-page.component.html',
  styleUrls: ['./accounts-page.component.css']
})
export class AccountsPageComponent implements OnInit {

  constructor(private ComponentsController:ComponentsControllerService) { }

  ngOnInit(): void {
    //init page controller
    this.AccountsPageController.initPage();
  }


  /// CONTROLLERS ///
  //==========================
  
  public AccountsPageController = this.ComponentsController.AccountsPage;
  
  //==========================
  /// END CONTROLLERS ///


}
