<<<<<<< HEAD
// recibir formato json de la api

import { useState } from "react";

const RegisterViewModel = () => {
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

const register = () => {
    console.log(JSON.stringify(values));
};

return {
    ...values,
    onChange,
    register
};
}

=======
// recibir formato json de la api

import { useState } from "react";

const RegisterViewModel = () => {
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

const register = () => {
    console.log(JSON.stringify(values));
};

return {
    ...values,
    onChange,
    register
};
}

>>>>>>> 14704220dfc7dc9865698d802e6a76148c36c471
export default RegisterViewModel;