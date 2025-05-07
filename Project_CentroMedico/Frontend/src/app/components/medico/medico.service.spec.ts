import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from '@jest/globals';

import { MedicoService } from '../../services/Medico/medico.service';

describe('MedicoService', () => {
  let service: MedicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
