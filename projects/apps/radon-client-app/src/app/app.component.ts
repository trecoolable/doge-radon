import { ViewEncapsulation } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  selector: 'radon-client-app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
    '../styles/common.css',
    '../styles/icons.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = '@apps/radon-client-app';
}
