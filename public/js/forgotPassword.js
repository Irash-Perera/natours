import axios from 'axios';
import { showAlert } from './alert';

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: {
        email
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Check your mail box.');
      window.setTimeout(() => {
        location.assign('/');
      },1500)
    }
  } catch (error) {
    showAlert('error', error.response.data.message)
  }
}