import { Component, inject, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { DonutchartComponent } from '../charts/donutchart/donutchart.component';
import { NgIf } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ApiService } from '../../../services/api.service';
import { FilefolderpopupComponent } from '../filefolderpopup/filefolderpopup.component';
import { Observable } from 'rxjs';
import { NumberFormat } from 'xlsx-js-style';

interface ShareCard {
  title: string;
  reporttitle: string;
  value: string | number;
  file: boolean;
  fileicon: boolean;
  both?: boolean;
  icon: string;
  subtitle?: string;
  filedata?: string;
  folderdata?: string;
  totaldata?: string;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatCardModule, DonutchartComponent, NgIf, NgxSkeletonLoaderModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent implements OnInit {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() value!: string;
  @Input() filecount!: number;
  @Input() icon!: string;
  @Input() percentage!: number;
  @Input() chart: boolean = false;
  @Input() file: boolean = false;
  @Input() fileicon: boolean = false;
  @Input() static?: boolean = false;
  @Input() foldercount?: number;
  @Input() totalcount?: number;
  @Input() both?: boolean = false;
  @Input() filedata?: keyof ApiService;
  @Input() folderdata?: keyof ApiService;
  @Input() totaldata?: keyof ApiService;

  private dialog = inject(MatDialog);

  constructor(private api: ApiService) {}

  openShareDialog(card: ShareCard, apiMethod: keyof ApiService) {
    if (this.dialog.openDialogs.length > 0) return;

    const apiCall = this.api[apiMethod] as unknown as () => Observable<any>;

    if (!apiCall) {
      console.error(`API method ${String(apiMethod)} not found`);
      return;
    }

    apiCall.call(this.api).subscribe({
      next: (res: any) => {
        const folders = res?.content ?? res?.data ?? res ?? [];

        this.dialog.open(FilefolderpopupComponent, {
          width: '75rem',
          minWidth: '75rem',
          maxWidth: '100%',
          data: {
            ...card,
            folders,
          },
        });
      },
      error: (err) => {
        console.error('API Error:', err);
      },
    });
  }

  ngOnInit(): void {
    // const cardData: ShareCard = {
    //   title: 'Windows File Share',
    //   reporttitle: 'windows-file-share',
    //   value: '19',
    //   file: false,
    //   fileicon: false,
    //   icon: '/svg/folder.svg',
    //   subtitle: 'Windows File Share',
    // };
    // this.openShareDialog(cardData, 'getfilesharefiledetails');
  }
}
