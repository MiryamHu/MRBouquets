// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,    // trae NgIf, NgFor, CurrencyPipe, etc.
    RouterModule,    // trae routerLink, routerLinkActive…
    RouterOutlet     // directiva <router-outlet>
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { }
