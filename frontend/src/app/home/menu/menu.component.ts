import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RamosService, Ocasion } from '../../services/ramos.service';
import Headroom from 'headroom.js';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements AfterViewInit {
  @Input() auth: any;
  @Input() userName: string = '';
  @Output() logoutEvent = new EventEmitter<void>();


  ocasiones: Ocasion[] = [];
  menuOcasionesAbierto = false;

  submenuAbierto = false;

  toggleSubmenu() {
  this.submenuAbierto = !this.submenuAbierto;
  }

  constructor(private ocasionesSvc: RamosService) {}

  logout() {
    this.logoutEvent.emit();
  }

  @ViewChild('headerTop', { static: false }) headerTop!: ElementRef<HTMLElement>;


  ngOnInit() {
    this.ocasionesSvc.getOcasiones().subscribe(
      data => this.ocasiones = data,
      err => console.error('Error al cargar ocasiones', err)
    );
  }

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

  @HostListener('document:click', ['$event'])
  onClickDocumento(event: MouseEvent) {
    const dentro = (event.target as HTMLElement).closest('.has-submenu');
    if (!dentro) {
      this.submenuAbierto = false;
    }
  }
}

