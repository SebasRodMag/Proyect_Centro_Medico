import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RefreshService {
    private _refreshCitas$ = new Subject<void>();
    private _refreshPacientes = new Subject<void>();

    get refreshCitas$(): Observable<void> {
        return this._refreshCitas$.asObservable();
    }

    triggerRefreshCitas(): void {
        this._refreshCitas$.next();
    }

    get refreshPacientes$(): Observable<void> { 
    return this._refreshPacientes.asObservable();
    }

    triggerRefreshPacientes(): void { 
    }
}
