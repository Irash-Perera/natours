import axios from 'axios';
import { showAlert } from './alert';

export const passwordReset = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${token}`,
      data: {
        password,
        passwordConfirm
      }
    })

    if (res.data.status === 'success') {
      showAlert('success', 'Password changed successfully');
      window.setTimeout(() => {
        location.assign('/me')
      },1500)
    }

  }catch (err) {
    showAlert('error','Something went wrong! Please try again.')
}
}