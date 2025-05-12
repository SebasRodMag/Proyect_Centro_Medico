import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';

@Component({
  selector: 'app-citas',
  imports: [
    CommonModule, ModalCreateComponent
  ],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.css'
})
export class CitasComponent {
  citas: any = [];

  constructor(private citaService: CitaService) {}

  ngOnInit(): void {
    this.getCitas();
  }


  getCitas(){
    this.citaService.getCitas().subscribe(
      (data) => {
        console.log('Citas: ', data);
        this.citas = data.citas;
      },
      (error) => console.error('Error al obtener las citas', error)
    )
  }

}
