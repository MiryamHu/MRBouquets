import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import Headroom from 'headroom.js';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements AfterViewInit{
  @Input() auth: any;
  @Input() userName: string = '';
  @Output() logoutEvent = new EventEmitter<void>();

  logout() {
    this.logoutEvent.emit();
  }

  @ViewChild('headerTop', { static: false }) headerTop!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    const headroom = new Headroom(this.headerTop.nativeElement, {
      tolerance: { up: 5, down: 5 },
      offset: 50,
      classes: {
        pinned: 'header--pinned',
        unpinned: 'header--unpinned'
      }
    });
    headroom.init();
  }
  
  
}

