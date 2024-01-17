import axios from 'axios';
import { showAlert } from './alert';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email, 
        password,
        passwordConfirm,
        role: 'user'
      }
    })

    console.log('Response:', res);

    if (res.data.status === 'success') {
      showAlert('success', 'Signed up succesfully');
      window.setTimeout(() => {
        location.assign('/')
      },1500)
    }

  } catch (error) {
    showAlert('error',error.response.data.message)
  }
}