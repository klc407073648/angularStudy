import { AbstractControl, ValidationErrors } from "@angular/forms";

// 密码必须包含：大写字母、小写字母、数字、特殊字符，且长度 >= 8
export function passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null; // 允许空值由 required 处理
  
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValidLength = value.length >= 8;
  
    const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isValidLength;
  
    return !passwordValid ? { 
      passwordStrength: {
        message: 'validation.passwordStrength',
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
        isValidLength
      }
    } : null;
  }

  // 用户名只能包含字母、数字、下划线，长度 3-20
export function usernameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
  
    const isValidFormat = /^[a-zA-Z0-9_]+$/.test(value);
    const isValidLength = value.length >= 3 && value.length <= 20;
  
    if (!isValidFormat) {
      return { 
        invalidChars: {
          message: 'validation.usernameInvalidChars'
        }
      };
    }
    if (!isValidLength) {
      return { 
        invalidLength: {
          message: 'validation.usernameInvalidLength'
        }
      };
    }
  
    return null;
  }