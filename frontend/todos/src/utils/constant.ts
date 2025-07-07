class Constant {
  static readonly BASE_URL = 'http://localhost:3000/api/v1'
  static readonly API_REQUEST_TIMEOUT = 10000
  static readonly API_REQUEST_HEADERS = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  static readonly API_REQUEST_RETRY = 3
  static readonly API_REQUEST_RETRY_DELAY = 1000

  //TODO API ENDPOINTS
  static readonly API_CREATE_TODO = '/todos'
  static readonly API_GET_PAGINATION_TODO = `/todos/get-page`
  static readonly API_GET_TODO_BY_ID = (id: string) => `/todos/get-by-id/${id}`
  static readonly API_UPDATE_TODO = (id: string) => `/todos/update/${id}`
  static readonly API_DELETE_TODO = (id: string) => `/todos/delete/${id}`
  static readonly API_DELETE_TODO_PERMANENTLY = (id: string) => `/todos/delete-permanently/${id}`
  static readonly API_RESTORE_TODO = (id: string) => `/todos/restore/${id}`
  static readonly API_ARCHIVE_TODO = (id: string) => `/todos/archive/${id}`
  static readonly API_UNARCHIVE_TODO = (id: string) => `/todos/unarchive/${id}`
  static readonly API_COMPLETE_TODO = (id: string) => `/todos/complete/${id}`
  static readonly API_UNCOMPLETE_TODO = (id: string) => `/todos/uncomplete/${id}`
}

export default Constant
