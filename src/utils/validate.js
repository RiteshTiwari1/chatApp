export const checkValidate = (email, password) => {
    let regexEmail = new RegExp('^[\\w.-]+@([\\w-]+\\.)+[\\w-]{2,4}$');
    let regexPassword = new RegExp('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$');

    const isEmailValid = regexEmail.test(email);
    const isPasswordValid = regexPassword.test(password);

    if (!isEmailValid && !isPasswordValid) {
        return "Email and Password are not valid";
    }

    if (!isEmailValid) {
        return "Email is not valid";
    }

    if (!isPasswordValid) {
        return "Password is not valid";
    }

    return null;
};
