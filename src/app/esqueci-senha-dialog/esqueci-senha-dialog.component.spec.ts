import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsqueciSenhaDialogComponent } from './esqueci-senha-dialog.component';

describe('EsqueciSenhaDialogComponent', () => {
  let component: EsqueciSenhaDialogComponent;
  let fixture: ComponentFixture<EsqueciSenhaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsqueciSenhaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsqueciSenhaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
