import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-edit-cita-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule
        // importa más módulos si usas select, input, etc.
    ],
    template: `
    <h2 mat-dialog-title>Editar Cita</h2>
    <mat-dialog-content>
        <p><strong>Paciente:</strong> {{ data.cita.nombrePaciente }}</p>

        <label>Hora:
        <select [(ngModel)]="data.cita.hora">
          <option *ngFor="let hora of data.horariosDisponibles" [value]="hora">{{ hora }}</option>
        </select>
        </label>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button (click)="cancelar()">Cancelar</button>
        <button mat-flat-button color="primary" (click)="guardar()">Guardar</button>
    </mat-dialog-actions>
    `,
})
export class ModalEditComponent {
    constructor(
        public dialogRef: MatDialogRef<ModalEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            cita: any;
            horariosDisponibles: string[];
        }
    ) { }

    guardar(): void {
        this.dialogRef.close({ citaActualizada: this.data.cita });
    }

    cancelar(): void {
        this.dialogRef.close();
    }
}
