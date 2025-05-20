import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { UsuariosService } from '../../../../../services/Usuario-Service/usuarios.service';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ModalEditComponent } from './modal-edit/modal-edit.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        CommonModule,
        ModalCreateComponent,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
    ],
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
    usuarios: any[] = [];
    usuariosDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = ['id', 'email', 'rol', 'acciones'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private usuarioService: UsuariosService,
        private route: ActivatedRoute,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.getUsuarios();
    }

    getUsuarios() {
        this.usuarioService.getUsuarios().subscribe(
            (data: any[]) => {
                this.usuarios = data;
                this.usuariosDataSource.data = this.usuarios;
                this.usuariosDataSource.paginator = this.paginator;
                this.usuariosDataSource.sort = this.sort;
            },
            (error: any) => {
                console.error('Error al obtener los usuarios:', error);
            }
        );
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.usuariosDataSource.filter = filterValue.trim().toLowerCase();

        if (this.usuariosDataSource.paginator) {
            this.usuariosDataSource.paginator.firstPage();
        }
    }
    openEditRolModal(usuario: any): void {
        const dialogRef = this.dialog.open(ModalEditComponent, {
            width: '400px',
            data: { usuario },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.getUsuarios(); // refresca la tabla si hubo cambio
            }
        });
    }

    eliminarUsuario(usuario: any): void {
            Swal.fire({
                title: '¿Estás seguro?',
                text:
                    'Esta acción eliminará al médico: ' +
                    usuario.email,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    this.usuarioService.deleteUsuario(usuario.id).subscribe({
                        next: () => {
                            Swal.fire(
                                'Eliminado',
                                'El médico ha sido eliminado correctamente.',
                                'success'
                            );
                            this.usuarios = this.usuarios.filter(
                                (m) => m.id !== usuario.id
                            );
                            this.usuariosDataSource.data = this.usuarios;
                        },
                        error: (error:any) => {
                            Swal.fire(
                                'Error',
                                error.error?.message ||
                                    'No se pudo eliminar el médico.',
                                'error'
                            );
                        },
                    });
                }
            });
        }
}
