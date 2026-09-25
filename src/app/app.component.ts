import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SessionManagerComponent } from './session-manager/session-manager.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SessionManagerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'bridgesoft';
}
