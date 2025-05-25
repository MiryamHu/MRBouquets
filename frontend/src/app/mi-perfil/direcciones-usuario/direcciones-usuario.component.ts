import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DireccionesService, Direccion } from '../../services/direcciones.service';

@Component({
  selector: 'app-direcciones-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './direcciones-usuario.component.html',
  styleUrl: './direcciones-usuario.component.css'
})
export class DireccionesUsuarioComponent implements OnInit{
  direcciones: Direccion[] = [];
  nuevaDireccion = {} as Omit<Direccion, 'id' | 'usuario_id'>;
  mostrarFormDireccion = false;
  loadingDirecciones = false;
  errorDirecciones: string | null = null;
  isBrowser = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private direccionesService: DireccionesService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cargarDirecciones();
    }
  }

  cargarDirecciones(): void {
    this.loadingDirecciones = true;
    this.direccionesService.getDirecciones().subscribe({
      next: ds => {
        this.direcciones = ds;
        this.loadingDirecciones = false;
      },
      error: () => {
        this.errorDirecciones = 'No se pudieron cargar las direcciones.';
        this.loadingDirecciones = false;
      }
    });
  }

  guardarDireccion(): void {
    this.direccionesService
      .addDireccion(this.nuevaDireccion)
      .subscribe(() => {
        this.nuevaDireccion = {} as any;
        this.mostrarFormDireccion = false;
        this.cargarDirecciones();
      });
  }

  eliminarDireccion(id: number): void {
    if (!confirm('¿Eliminar dirección?')) { return; }
    this.direccionesService.deleteDireccion(id).subscribe({
      next: () => {
        this.direcciones = this.direcciones.filter(d => d.id !== id);
      },
      error: () => alert('No se pudo eliminar')
    });
  }
}
