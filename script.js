// Classe para validação de CPF
class CPFValidator {
    static validate(cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let digit1 = 11 - (sum % 11);
        if (digit1 >= 10) digit1 = 0;
        if (digit1 !== parseInt(cpf.charAt(9))) return false;
        
        // Validação do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        let digit2 = 11 - (sum % 11);
        if (digit2 >= 10) digit2 = 0;
        if (digit2 !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }
    
    static format(cpf) {
        // Remove caracteres não numéricos
        cpf = cpf.replace(/\D/g, '');
        
        // Aplica a máscara
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}

// Classe para validação de senha
class PasswordValidator {
    static validate(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
        
        const isValid = Object.values(requirements).every(req => req);
        
        return { isValid, requirements };
    }
}

// Classe principal do formulário
class FormValidator {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.cpfInput = document.getElementById('cpf');
        this.passwordInput = document.getElementById('password');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.eyeIcon = document.getElementById('eyeIcon');
        this.submitBtn = document.getElementById('submitBtn');
        this.successMessage = document.getElementById('success-message');
        
        this.isValidCPF = false;
        this.isValidPassword = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupPasswordRequirements();
    }
    
    setupEventListeners() {
        // Validação em tempo real do CPF
        this.cpfInput.addEventListener('input', (e) => {
            this.handleCPFInput(e);
        });
        
        this.cpfInput.addEventListener('blur', () => {
            this.validateCPF();
        });
        
        // Validação em tempo real da senha
        this.passwordInput.addEventListener('input', () => {
            this.validatePassword();
        });
        
        this.passwordInput.addEventListener('focus', () => {
            this.showPasswordRequirements();
        });
        
        this.passwordInput.addEventListener('blur', () => {
            this.hidePasswordRequirements();
        });
        
        // Toggle de visibilidade da senha
        this.togglePasswordBtn.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });
        
        // Submit do formulário
        this.form.addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });
    }
    
    handleCPFInput(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Limita a 11 dígitos
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        // Aplica a máscara
        if (value.length > 0) {
            value = CPFValidator.format(value);
        }
        
        e.target.value = value;
        
        // Validação em tempo real
        if (value.length === 14) { // CPF completo com máscara
            this.validateCPF();
        } else {
            this.clearCPFValidation();
        }
    }
    
    validateCPF() {
        const cpf = this.cpfInput.value;
        const errorElement = document.getElementById('cpf-error');
        
        if (!cpf) {
            this.showError(errorElement, 'CPF é obrigatório');
            this.setInputState(this.cpfInput, 'invalid');
            this.isValidCPF = false;
        } else if (!CPFValidator.validate(cpf)) {
            this.showError(errorElement, 'CPF inválido');
            this.setInputState(this.cpfInput, 'invalid');
            this.isValidCPF = false;
            this.addShakeAnimation(this.cpfInput);
        } else {
            this.hideError(errorElement);
            this.setInputState(this.cpfInput, 'valid');
            this.isValidCPF = true;
        }
        
        this.updateSubmitButton();
    }
    
    clearCPFValidation() {
        const errorElement = document.getElementById('cpf-error');
        this.hideError(errorElement);
        this.setInputState(this.cpfInput, '');
        this.isValidCPF = false;
        this.updateSubmitButton();
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        const errorElement = document.getElementById('password-error');
        const validation = PasswordValidator.validate(password);
        
        if (!password) {
            this.showError(errorElement, 'Senha é obrigatória');
            this.setInputState(this.passwordInput, 'invalid');
            this.isValidPassword = false;
        } else if (!validation.isValid) {
            this.showError(errorElement, 'Senha não atende aos requisitos');
            this.setInputState(this.passwordInput, 'invalid');
            this.isValidPassword = false;
        } else {
            this.hideError(errorElement);
            this.setInputState(this.passwordInput, 'valid');
            this.isValidPassword = true;
        }
        
        this.updatePasswordRequirements(validation.requirements);
        this.updateSubmitButton();
    }
    
    setupPasswordRequirements() {
        this.passwordRequirements = document.querySelector('.password-requirements');
    }
    
    showPasswordRequirements() {
        this.passwordRequirements.classList.add('show');
    }
    
    hidePasswordRequirements() {
        if (!this.passwordInput.value) {
            this.passwordRequirements.classList.remove('show');
        }
    }
    
    updatePasswordRequirements(requirements) {
        const reqElements = {
            length: document.getElementById('length-req'),
            uppercase: document.getElementById('uppercase-req'),
            lowercase: document.getElementById('lowercase-req'),
            number: document.getElementById('number-req'),
            special: document.getElementById('special-req')
        };
        
        Object.keys(requirements).forEach(key => {
            const element = reqElements[key];
            if (element) {
                if (requirements[key]) {
                    element.classList.add('valid');
                } else {
                    element.classList.remove('valid');
                }
            }
        });
    }
    
    togglePasswordVisibility() {
        const isPassword = this.passwordInput.type === 'password';
        
        this.passwordInput.type = isPassword ? 'text' : 'password';
        this.eyeIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        
        // Mantém o foco no input
        this.passwordInput.focus();
    }
    
    setInputState(input, state) {
        input.classList.remove('valid', 'invalid');
        if (state) {
            input.classList.add(state);
        }
    }
    
    showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
    }
    
    hideError(element) {
        element.textContent = '';
        element.classList.remove('show');
    }
    
    addShakeAnimation(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    updateSubmitButton() {
        if (this.isValidCPF && this.isValidPassword) {
            this.submitBtn.disabled = false;
        } else {
            this.submitBtn.disabled = true;
        }
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Validação final
        this.validateCPF();
        this.validatePassword();
        
        if (this.isValidCPF && this.isValidPassword) {
            this.simulateLogin();
        }
    }
    
    simulateLogin() {
        // Adiciona estado de carregamento
        this.submitBtn.classList.add('loading');
        this.submitBtn.textContent = 'Entrando...';
        
        // Simula uma requisição
        setTimeout(() => {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
            
            // Mostra mensagem de sucesso
            this.successMessage.classList.add('show');
            
            // Limpa o formulário após 3 segundos
            setTimeout(() => {
                this.resetForm();
            }, 3000);
        }, 2000);
    }
    
    resetForm() {
        this.form.reset();
        this.successMessage.classList.remove('show');
        this.passwordRequirements.classList.remove('show');
        
        // Limpa estados de validação
        this.setInputState(this.cpfInput, '');
        this.setInputState(this.passwordInput, '');
        
        // Limpa mensagens de erro
        this.hideError(document.getElementById('cpf-error'));
        this.hideError(document.getElementById('password-error'));
        
        // Reset das variáveis de validação
        this.isValidCPF = false;
        this.isValidPassword = false;
        this.updateSubmitButton();
        
        // Limpa requisitos da senha
        const reqElements = document.querySelectorAll('.password-requirements li');
        reqElements.forEach(el => el.classList.remove('valid'));
    }
}

// Inicializa o formulário quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new FormValidator();
});

// Previne o comportamento padrão do formulário em caso de erro
window.addEventListener('error', (e) => {
    console.error('Erro na aplicação:', e.error);
});