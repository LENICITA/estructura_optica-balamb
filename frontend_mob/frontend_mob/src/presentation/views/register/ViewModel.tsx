import React, { useState } from 'react';
import { RegisterAuthUseCase } from '../../../domain/useCases/auth/RegisterAuth';

const RegisterViewModel = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [values, setValues] = useState({
    name: '',
    lastname: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const onChange = (property: string, value: any) => {
    setValues({ ...values, [property]: value });
  };

  const resetForm = () => {
    setValues({
      name: '',
      lastname: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const isValidForm = (): boolean => {
    setErrorMessage('');
    if (values.name === '') {
      setErrorMessage('El nombre es requerido');
      return false;
    }
    if (values.lastname === '') {
      setErrorMessage('El apellido es requerido');
      return false;
    }
    if (values.email === '') {
      setErrorMessage('El correo es requerido');
      return false;
    }
    if (values.phone === '') {
      setErrorMessage('El teléfono es requerido');
      return false;
    }
    if (values.password === '') {
      setErrorMessage('La contraseña es requerida');
      return false;
    }
    if (values.confirmPassword === '') {
      setErrorMessage('La confirmación de contraseña es requerida');
      return false;
    }
    if (values.password !== values.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const register = async () => {
    if (isValidForm()) {
      try {
        const response = await RegisterAuthUseCase(values);
        console.log('Result: ' + JSON.stringify(response));
        resetForm();
      } catch (error) {
        setErrorMessage('Error al registrar. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return {
    ...values,
    onChange,
    register,
    errorMessage,
  };
};

export default RegisterViewModel;