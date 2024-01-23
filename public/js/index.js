import '@babel/polyfill';
import axios from 'axios';
import { login,logout} from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { passwordReset } from './passwordReset';
import { signup } from './signup';
import { forgotPassword } from './forgotPassword';
import { bookTour } from './stripe';
import { submitReview } from './review';

//DOM ELEMNETS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userSettings = document.querySelector('.form-user-settings');
const resetPasswordForm = document.querySelector('.form--reset');
const signupForm = document.querySelector('.form--signup');
const forgotPasswordFrom = document.querySelector('.form--forgotPassword')
const bookBtn = document.getElementById('book-tour')
const bookAgainBtn = document.querySelector('.book-again-btn')
const reviewForm = document.querySelector('.form--reviewForm')
const starGroup = document.querySelector('.star-group')

// Add this at the beginning of your index.js file or in a separate script file
document.addEventListener('DOMContentLoaded', function() {
  // Set the initial scroll position to the top of the page
  window.scrollTo(0, 0);
});


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

if (forgotPasswordFrom) {
  forgotPasswordFrom.addEventListener('submit', e => {
    e.preventDefault();
    document.querySelector('.btn--forgot--password').textContent = 'Sending recovery mail...'
    const email = document.getElementById('email').value;
    forgotPassword(email);
  })
  document.querySelector('.btn--forgot--password').textContent = 'Next'
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

    // console.log(form)

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

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...'
    const { tourId } = e.target.dataset;
    bookTour(tourId)
  })
}

if (bookAgainBtn) {
  bookAgainBtn.addEventListener('click', e => {
    window.setTimeout(() => {
      location.assign('/')
    }, 0)
  })
}

if (reviewForm) {
  let rating;
  reviewForm.addEventListener('submit', async e => {
    e.preventDefault();
    const review = document.getElementById('_review').value;
    if (starGroup) {
      starGroup.addEventListener('click', e => {
        rating = e.target.value;
        console.log(review, rating)
      })
    }
    await submitReview(review, rating);
  })
  
}

