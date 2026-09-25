// src/app/session-manager/session-manager.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SessionManagerService } from '../services/session-manager.service';

@Component({
  selector: 'app-session-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-manager.component.html',
  styleUrls: ['./session-manager.component.scss']
})
export class SessionManagerComponent implements OnInit, OnDestroy {
  showWarning = false;
  isRefreshing = false;
  private subs = new Subscription();

  constructor(private session: SessionManagerService) { }

  ngOnInit() {
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