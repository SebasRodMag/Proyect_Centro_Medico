import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { MedicoGuard } from './medico.guard';

describe('medicoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => MedicoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
