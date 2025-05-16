import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CitaService } from '../../../../../../services/Cita-Service/cita.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-modal-edit',
    standalone: true,
    templateUrl: './modal-edit.component.html',
    styleUrls: ['./modal-edit.component.css'],
    imports: [FormsModule],
})
export class ModalEditComponent implements OnInit {
    @Input() citaSeleccionada: any;
    @Input() horariosDisponibles: string[] = [];

    citaModificada: any;

    constructor(
        public activeModal: NgbActiveModal,
        private citaService: CitaService
    ) { }

    ngOnInit(): void {
        this.citaModificada = { ...this.citaSeleccionada };
    }

    guardar(): void {
    this.citaService.actualizarCita(this.citaModificada.id, this.citaModificada).subscribe({
        next: () => this.activeModal.close('guardado'),
        error: (err) => {
            console.error('Error al actualizar cita', err);
            this.activeModal.dismiss('error');
        }
    });
}

    cancelar(): void {
        this.activeModal.dismiss();
    }
}
