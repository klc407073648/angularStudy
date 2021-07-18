import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  showHeroes = true;
  showConfig = true;
  showDownloader = true;
  showUploader = true;
  showSearch = true;
  showNavMenu = true;

  toggleHeroes() { this.showHeroes = !this.showHeroes; }
  toggleConfig() { this.showConfig = !this.showConfig; }
  toggleDownloader() { this.showDownloader = !this.showDownloader; }
  toggleUploader() { this.showUploader = !this.showUploader; }
  toggleSearch() { this.showSearch = !this.showSearch; }
  toggleNavMenu() { this.showNavMenu = !this.showNavMenu; }
 }
