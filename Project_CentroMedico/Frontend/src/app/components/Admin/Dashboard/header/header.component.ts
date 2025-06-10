import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterLink],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
    userName: string = '';
    userRol: string = '';
    fechaActual = new Date();
    horaActual: string = '';
    private authSubscription!: Subscription;
    private timer!: ReturnType<typeof setInterval>;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.fechaActual = new Date();
        this.updateClock();
        this.timer = setInterval(() => this.updateClock(), 1000);

        this.authSubscription = this.authService.authState$.subscribe((isLoggedIn: boolean) => {
            if (isLoggedIn) {
                this.userName = sessionStorage.getItem('name') || '';
                this.userRol = this.authService.getRol();
            } else {
                this.userName = '';
                this.userRol = '';
            }
        });

        // Si ya está logueado, coger el nombre del usuario y el rol
        if (this.authService.isLoggedIn()) {
            this.userName = sessionStorage.getItem('name') || '';
            this.userRol = this.authService.getRol();
        }
    }

    private updateClock() {
        this.horaActual = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }

    logout() {
        this.authService.logout();
    }

    ngOnDestroy(): void {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}
