import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent
  implements OnInit, OnDestroy {

  currentTime = '';

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {

    this.updateTime();

    this.timer = setInterval(
      () => this.updateTime(),
      1000
    );
  }

  ngOnDestroy(): void {

    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private updateTime(): void {

    this.currentTime =
      new Date().toLocaleTimeString(
        'fr-FR'
      );
  }
}