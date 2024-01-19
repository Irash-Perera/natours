import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    const url = (type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe');

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Updated successfully.');
      window.setTimeout(() => {
        location.assign('/me');
      },1500)
    }

  } catch (error) {
    showAlert('error', error.response.data.message)
  }
}