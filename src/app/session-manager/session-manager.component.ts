import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { SessionManagerService } from '../services/session-manager.service';

@Component({
  selector: 'app-session-manager',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './session-manager.component.html',
  styleUrls: ['./session-manager.component.css']
})
export class SessionManagerComponent implements OnInit, OnDestroy {
  showWarning = false;
  isRefreshing = false;
  private subs = new Subscription();
  private session = inject(SessionManagerService);

  ngOnInit() {
    this.session.start();

    this.subs.add(
      this.session.showWarning$.subscribe(v => this.showWarning = v)
    );
    this.subs.add(
      this.session.isRefreshing$.subscribe(v => this.isRefreshing = v)
    );
  }

  staySignedIn() {
    this.session.staySignedIn();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
