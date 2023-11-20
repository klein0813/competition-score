import axios from 'axios';
import { HOST } from './utils/constant';

const instance = axios.create({
  baseURL: `${HOST}:3000/`,
  timeout: 10000,
  headers: {}
})

export async function getUser() {
  try {
    const response = await instance.get('singer');
    console.log(response);
    return response;
  } catch (error) {
    console.error(error);
  }
}

export async function getJudgeByName(name) {
  try {
    const response = await instance.get(`judge/find?name=${name}`);
    return response;
  } catch (error) {
    console.error(error);
  }
}

export async function getJudgeById(id) {
  try {
    const response = await instance.get(`judge/${id}`);
    return response;
  } catch (error) {
    console.error(error);
  }
}

export async function changeSinger(id) {
  try {
    const response = await instance.post(`singer/${id}`);
    return response;
  } catch (error) {
    console.error(error);
  }
}

