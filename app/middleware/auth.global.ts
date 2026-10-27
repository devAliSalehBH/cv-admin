export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('token')
  const globalStore = useGlobalStore()
  const localePath = useLocalePath()

  // The store is set synchronously on login, the cookie may be written a tick later
  const isLoggedIn = !!(token.value || globalStore.authToken)
  const isAuthRoute = to.path.includes('/auth')

  // If there's no token and user is trying to access a protected route
  if (!isLoggedIn && !isAuthRoute) {
    return navigateTo(localePath('/auth/login'))
  }

  // If user is already logged in and tries to access an auth route
  if (isLoggedIn && isAuthRoute) {
    return navigateTo(localePath('/admins'))
  }
})
