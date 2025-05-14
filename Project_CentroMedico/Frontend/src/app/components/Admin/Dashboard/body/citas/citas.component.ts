import {
    AfterViewInit,
    Component,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ModalCreateComponent } from './modal-create/modal-create.component';

@Component({
    selector: 'app-citas',
    imports: [
        CommonModule,
        ModalCreateComponent,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
    ],
    templateUrl: './citas.component.html',
    styleUrls: ['./citas.component.css'],
})
export class CitasComponent implements OnInit, AfterViewInit {
    citasDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'contrato_id',
        'numero_de_cita',
        'paciente',
        'cliente',
        'dni_paciente',
        'medico',
        'fecha',
        'hora',
        'acciones',
    ];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private citaService: CitaService) {}

    ngOnInit(): void {
        this.getCitas();
    }

    ngAfterViewInit(): void {
        this.citasDataSource.paginator = this.paginator;
        this.citasDataSource.sort = this.sort;
    }

    getCitas() {
        this.citaService.getCitas().subscribe(
            (data) => {
                console.log('Citas: ', data);
                this.citasDataSource.data = data.citas;
            },
            (error) => console.error('Error al obtener las citas', error)
        );
    }
}
