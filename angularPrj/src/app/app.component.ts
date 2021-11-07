import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  showIndex = false;
  showHttpService = false;
  showNavMenu = false;

  toggleIndex() { this.showIndex = !this.showIndex; }
  toggleHttpService() { this.showHttpService = !this.showHttpService; }
  toggleNavMenu() { this.showNavMenu = !this.showNavMenu; }
 }
