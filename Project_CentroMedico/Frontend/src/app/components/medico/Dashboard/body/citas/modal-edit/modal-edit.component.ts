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
    templateUrl: './modal-edit.component.html',
    styleUrls: ['./modal-edit.component.css'],
})
export class ModalEditComponent {
    citaModificada: any;
    constructor(
        public dialogRef: MatDialogRef<ModalEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            cita: any;
            horariosDisponibles: string[];
        }
    ) { 
        this.citaModificada = { ...data.cita };
    }

    guardar(): void {
        this.dialogRef.close({ citaActualizada: this.citaModificada });
    }

    cancelar(): void {
        this.dialogRef.close();
    }
}
