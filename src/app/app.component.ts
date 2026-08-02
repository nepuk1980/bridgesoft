// import { LayoutComponent } from './layout/layout.component';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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
