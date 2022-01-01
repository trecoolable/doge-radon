import { Component, OnInit } from '@angular/core';
import { RadonClientControlsV1Service } from 'projects/controls/radon-client-controls-v1/src/public-api';
import { ComponentsControllerService } from '../../../../controllers/components-controller.service';

@Component({
  selector: 'radon-elems-v1-mobile-interface',
  templateUrl: './mobile-interface.component.html',
  styleUrls: ['./mobile-interface.component.css']
})
export class MobileInterfaceComponent implements OnInit {

  constructor(public ComponentsController:ComponentsControllerService) { }

  ngOnInit(): void {
  }

}
