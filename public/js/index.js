import '@babel/polyfill';
import { login,logout} from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { passwordReset } from './passwordReset';
import { signup } from './signup';

//DOM ELEMNETS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userSettings = document.querySelector('.form-user-settings');
const resetPasswordForm = document.querySelector('.form--reset');
const signupForm = document.querySelector('.form--signup');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  })
}

if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    document.querySelector('.btn--create--account').textContent = 'Creating...'
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  })
  document.querySelector('.btn--create--account').textContent = 'Create new account'

}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', e => {
    e.preventDefault();
    const newPassword = document.getElementById('newpassword').value;
    const newPasswordConfirm = document.getElementById('newpasswordconfirm').value;
    const token = document.getElementById('token').value;
    passwordReset(newPassword, newPasswordConfirm, token)
  })
}


if (logoutBtn)
  logoutBtn.addEventListener('click', logout)

if (userDataForm) {
  userDataForm.addEventListener('submit', async e => {
    e.preventDefault();
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log(form)

    await updateSettings(form, 'data')
    window.setTimeout(() => {
      location.assign('/me')
    },0)
  })
}

if (userSettings) {
  userSettings.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save--password').textContent = 'Updating...'
    const passwordCurrent= document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm= document.getElementById('password-confirm').value;
    await updateSettings({passwordCurrent, password, passwordConfirm}, 'password')
  })
  document.querySelector('.btn--save--password').textContent = 'Save password'
  document.getElementById('password-current').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';


}