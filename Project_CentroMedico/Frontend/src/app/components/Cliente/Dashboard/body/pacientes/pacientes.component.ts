// src/app/pages/private/cliente/pacientes/pacientes.component.ts
import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { PacienteService } from '../../../../../services/Paciente-Service/paciente.service';
import { ModalEditComponent } from './modal-edit/modal-edit.component'; // Importa el nuevo modal
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../../../auth/auth.service';
import { RefreshService } from '../../../../../services/Comunicacion/refresh.service'; // Importa RefreshService
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2'; // Para las alertas de eliminación

@Component({
    selector: 'app-pacientes',
    templateUrl: './pacientes.component.html',
    // IMPORTANTE: Asegúrate de que el selector es correcto. Antes era 'ModalCreateComponent'
    imports: [ModalEditComponent, CommonModule, MatPaginator, MatTableModule, MatSort], 
    styleUrls: ['./pacientes.component.css'],
})
export class PacientesComponent implements OnInit, AfterViewInit, OnDestroy {
    pacientes: any[] = [];
    clienteId!: string;
    clienteNombre: string = '';
    rol_id!: string;
    showPacienteModal: boolean = false;
    currentPacienteForEdit: any | null = null;

    displayedColumns = [
        'id',
        'nombreCompleto',
        'dni',
        'email',
        'fechaNacimiento',
        'acciones',
    ];

    pacientesDataSource = new MatTableDataSource<any>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    
    // Referencia al nuevo modal de edición/creación de paciente
    @ViewChild('pacienteModal') pacienteModal!: ModalEditComponent; 

    private destroy$ = new Subject<void>(); // Para desuscribirse al destruir el componente

    constructor(
        private clienteService: ClienteService,
        private pacienteService: PacienteService,
        private route: ActivatedRoute, 
        private authService: AuthService,
        private refreshService: RefreshService // Inyecta RefreshService
    ) {}

    ngOnInit(): void {
        this.authService
            .me()
            .pipe(takeUntil(this.destroy$)) // Desuscripción segura
            .subscribe((response: { user: { rol_id: string, cliente_id?: string } }) => {
                this.rol_id = response.user.rol_id;
                let idParaGetPacientes: string;
                if (response.user.cliente_id) { 
                    idParaGetPacientes = response.user.cliente_id;
                    this.clienteId = response.user.cliente_id; // Almacenar el clienteId
                } else {
                    idParaGetPacientes = this.rol_id; 
                    this.clienteId = this.rol_id; // Almacenar el clienteId
                }
                this.getPacientes(idParaGetPacientes);
            }, error => {
                console.error('Error al obtener datos de usuario (authService.me()):', error);
                Swal.fire('Error', 'No se pudo obtener la información de su cuenta.', 'error');
            });

        // Suscribirse al evento de refresco de pacientes
        this.refreshService.refreshPacientes$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('Evento de refresco de pacientes recibido. Recargando tabla...');
                this.getPacientes(this.clienteId); // Recargar con el ID del cliente ya almacenado
            });
    }

    ngAfterViewInit(): void {
        this.pacientesDataSource.paginator = this.paginator;
        this.pacientesDataSource.sort = this.sort;
        
        // Configurar el acceso a los datos para el sorting de 'nombreCompleto'
        this.pacientesDataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'nombreCompleto': return item.apellidos + item.nombre; // Para ordenar por nombre completo
                default: return (item as any)[property]; // Asegura el tipo para el acceso a la propiedad
            }
        };
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getPacientes(idParam: string): void { 
        if (!idParam) { // Asegurarse de que el ID del cliente esté disponible
            console.warn('ID de cliente no disponible para cargar pacientes.');
            return;
        }
        this.clienteService.getPacientesDelCliente(idParam).subscribe(
            (data: any) => {
                if (Array.isArray(data)) {
                    this.pacientes = data;
                } else if (data && typeof data === 'object' && data.message) {
                    console.warn('API respondió con un mensaje:', data.message);
                    this.pacientes = []; 
                } else {
                    console.error('Formato de respuesta inesperado de la API de pacientes:', data);
                    this.pacientes = [];
                }
                this.pacientesDataSource.data = this.pacientes;
                console.log('Pacientes cargados y asignados a dataSource.data:', this.pacientesDataSource.data);
            },
            (error: any) => {
                console.error('Error al obtener los pacientes:', error);
                if (error.status === 200 && error.error && error.error.message && error.error.message.includes('No se encontraron pacientes')) {
                    console.warn('Backend indicó que no se encontraron pacientes para este cliente.');
                    this.pacientes = [];
                    this.pacientesDataSource.data = []; 
                } else {
                    Swal.fire('Error', 'No se pudieron cargar los pacientes. Por favor, inténtelo de nuevo más tarde.', 'error');
                }
            }
        );
    }

    // Método para abrir el modal en modo creación
    openCreatePacienteModal(): void {
        this.currentPacienteForEdit = null;
        this.showPacienteModal = true;
    }

    // Método para abrir el modal en modo edición
    openEditPacienteModal(paciente: any): void {
        this.currentPacienteForEdit = paciente;
        this.showPacienteModal = true;
    }

    onPacienteModalClosed(): void {
        this.showPacienteModal = false; // El padre oculta el modal
        this.currentPacienteForEdit = null; // Opcional: limpia el paciente de edición
    }

    onPacienteSaved(): void {
        this.showPacienteModal = false; // Oculta el modal después de guardar
        this.currentPacienteForEdit = null; // Limpia el paciente de edición
        this.getPacientes(this.clienteId); // Recarga la tabla de pacientes
        // También puedes usar this.refreshService.triggerRefreshPacientes();
    }
    
    // Método para manejar la búsqueda
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.pacientesDataSource.filter = filterValue.trim().toLowerCase();

        if (this.pacientesDataSource.paginator) {
            this.pacientesDataSource.paginator.firstPage();
        }
    }

    eliminarPaciente(pacienteId: number) {
        if (!this.clienteId) {
            Swal.fire('Error', 'No se pudo obtener el ID del cliente para realizar la eliminación.', 'error');
            console.error('Error: clienteId no está definido al intentar eliminar paciente.');
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto! El paciente se eliminará de forma permanente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Llama al método deletePaciente con AMBOS IDs
                this.pacienteService.deletePaciente(this.clienteId, pacienteId).subscribe({ // ¡CAMBIO AQUÍ!
                    next: () => {
                        Swal.fire(
                            '¡Eliminado!',
                            'El paciente ha sido eliminado correctamente.',
                            'success'
                        );
                        // Recarga la lista de pacientes después de la eliminación exitosa
                        this.getPacientes(this.clienteId); 
                    },
                    error: (err) => {
                        console.error('Error al eliminar paciente:', err);
                        let errorMessage = 'Hubo un error al eliminar el paciente.';
                        if (err.error && err.error.message) {
                            errorMessage = err.error.message;
                        } else if (err.status === 404) {
                            errorMessage = 'El paciente o el cliente no fueron encontrados.';
                        } else if (err.status === 403) {
                            errorMessage = 'No tienes permiso para eliminar este paciente.';
                        }
                        Swal.fire('Error', errorMessage, 'error');
                    }
                });
            }
        });
    }
}