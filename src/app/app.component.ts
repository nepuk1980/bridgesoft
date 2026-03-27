import { LayoutComponent } from './layout/layout.component';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'bridgesoft';
  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.login().subscribe({
      error: (err) => console.error('Login failed', err),
    });
  }
}
