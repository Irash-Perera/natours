import axios from 'axios';
import { showAlert } from './alert';


export const submitReview = async (review, rating) => {
  const tour = document.querySelector('.login-form').getAttribute('data-tour-id');
  const user = document.querySelector('.login-form').getAttribute('data-user-id');
  const tourSlug = document.querySelector('.login-form').getAttribute('data-tour-slug')
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/reviews',
      data: {
        review,
        rating,
        tour,
        user
      }
    })

    if (res.data.status === 'success') {
      showAlert('success', 'Thank you for your review!');
      window.setTimeout(()=> {
        location.assign(`/tour/${tourSlug}`)
      })
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}