import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'radon-elems-v1-mobile-slide-page',
  templateUrl: './mobile-slide-page.component.html',
  styleUrls: ['./mobile-slide-page.component.css']
})
export class MobileSlidePageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }




  public slide_position:any = {
    start: 0,
    diff: 0,
    timeout: null,
    cancel_timeout: null
  };

  public slide_active = false;

  public startSlide(event:any) {
    let self = this;
    console.log(event)
    //check if is a touch event
    let pos = (event instanceof TouchEvent) ? event.targetTouches[0].clientY : event.clientY;
    //set slide active
    self.slide_active = true;
    //set slide start
    this.slide_position.start = pos;
    //set cancel timeout
    self.slide_position.cancel_timeout = setTimeout(() => {
      //end slide
      self.endSlide();
    }, 2000);
  }


  public moveSlide(event:any) {
    let self = this;
    //check if slide is active
    if(!self.slide_active) return;
    //check if is a touch event
    let pos = (event instanceof TouchEvent) ? event.targetTouches[0].clientY : event.clientY;
    //clear timeout
    window.clearTimeout(self.slide_position.timeout);
    //set slide position timeout
    self.slide_position.timeout = setTimeout(() => {
      //set slide position diff
      self.slide_position.diff = (self.slide_position.start - pos) * 1.32;
    }, 0);
  }


  public endSlide() {
    let self = this;
    //set slide active
    self.slide_active = false;
    //set diff to 0
    self.slide_position.diff = 0;
    //clear cancel timeout
    window.clearTimeout(self.slide_position.cancel_timeout);
  }

}
