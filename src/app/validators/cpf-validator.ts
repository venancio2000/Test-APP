import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CpfValidator {
  static validar(control: AbstractControl): ValidationErrors | null {
    const cpf = (control.value || '').replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      return { cpfInvalido: true };
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 >= 10) digito1 = 0;
    if (digito1 !== parseInt(cpf.charAt(9))) {
      return { cpfInvalido: true };
    }

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 >= 10) digito2 = 0;
    if (digito2 !== parseInt(cpf.charAt(10))) {
      return { cpfInvalido: true };
    }

    return null;
  }
}
