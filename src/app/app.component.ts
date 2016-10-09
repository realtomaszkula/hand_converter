import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <ul class="nav nav-tabs nav-justified">
      <li role="presentation" routerLinkActive="active">
        <a routerLink="/">Multiple Hands</a>
      </li>
      <li role="presentation" routerLinkActive="active">
        <a routerLink="/single">Single Hand</a>
      </li>
    </ul>
    <router-outlet> <router-outlet>

`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
}
