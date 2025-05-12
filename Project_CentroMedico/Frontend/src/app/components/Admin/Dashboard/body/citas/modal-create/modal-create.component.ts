import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';

declare var $: any;

@Component({
    selector: 'app-modal-create',
    imports: [CommonModule, FormsModule, NgSelectModule],
    templateUrl: './modal-create.component.html',
    styleUrl: './modal-create.component.css',
})
export class ModalCreateComponent {
    isVisible = false;

    @Output() closed = new EventEmitter<void>();

    open() {
        this.isVisible = true;
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
    }

    selectedPacientes: string[] = [];
    pacientes = ['Mustard', 'Ketchup', 'Relish'];
}
