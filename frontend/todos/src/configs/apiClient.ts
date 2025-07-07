import axios from 'axios'
import Constant from '@/utils/constant'

const apiClient = axios.create({
  baseURL: Constant.BASE_URL,
  timeout: Constant.API_REQUEST_TIMEOUT,
  headers: Constant.API_REQUEST_HEADERS,
})

export default apiClient
