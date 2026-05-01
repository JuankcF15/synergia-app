import api from '../api';

export async function getUserInfo() {
  try {
    const res = await api.get('api/profile/');
    return res.data;
  } catch (err) {
    return null;
  }
}
