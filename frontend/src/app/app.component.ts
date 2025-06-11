// src/app/app.component.ts
import {
  Component,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  RouterOutlet,
  Router
} from '@angular/router';

import {
  MatSidenavModule,
  MatSidenav
} from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';

import { CarritoComponent }  from './carrito/carrito.component';
import { CarritoService } from './services/carrito.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,      // para <router-outlet>
    MatSidenavModule,  // para <mat-sidenav-container> y MatSidenav
    MatButtonModule,   // para mat-button, mat-raised-button
    CarritoComponent   // <app-carrito> con su @Input() minimal
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('cartDrawer') drawer!: MatSidenav;

  constructor(
    private router: Router,
    private cartService: CarritoService
  ) {}

  ngAfterViewInit() {
    this.cartService.toggleSidenav.subscribe(action => {
      if (action === 'open')  this.drawer.open();
      if (action === 'close') this.drawer.close();
    });
  }

  goToCart() {
    this.drawer.close();
    this.router.navigate(['/carrito']);
  }
}
