import {Component, HostListener} from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  isPortrait: boolean = false;
  public IsPortrait() : boolean { return this.isPortrait; }

  constructor() {
    this.checkOrientation();
  }

  @HostListener('window:resize', [])
  checkOrientation() {
    this.isPortrait = window.innerHeight > window.innerWidth;
  }
}
