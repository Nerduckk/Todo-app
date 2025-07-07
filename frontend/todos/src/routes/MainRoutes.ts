import FullLayout from '@/layouts/full/FullLayout.vue'

const MainRoutes = {
  path: '/main',
  redirect: '/main',
  component: FullLayout,
  children: [
    {
      name: 'home',
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      name: 'todo.archive',
      path: '/todo/archive',
      component: () => import('@/views/ArchiveView.vue'),
    },
    {
      name: 'todo.delete',
      path: '/todo/delete',
      component: () => import('@/views/DeleteView.vue'),
    },
    {
      name: 'todo.view',
      path: '/todo/view/:todoId',
      component: () => import('@/views/TodoDetailView.vue'),
      props: true,
    },
    {
      name: 'todo.edit',
      path: '/todo/edit/:todoId',
      component: () => import('@/views/EditTodoView.vue'),
      props: true,
    },
  ],
}

export default MainRoutes
