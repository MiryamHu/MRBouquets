import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { PerfilUsuarioService } from '../services/perfil.usuario.service';

export function validarPasswordActual(perfilService: PerfilUsuarioService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
        if (!control.value) {
        return of(null); // No error si está vacío (ajusta si quieres)
        }
        return of(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(value =>
            perfilService.verificarPasswordActual(value).pipe(
            map(res => (res.valido ? null : { passwordIncorrecta: true })),
            catchError(() => of(null))
            )
        )
        );
    };
}

