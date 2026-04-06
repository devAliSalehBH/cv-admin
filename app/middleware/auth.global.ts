export default defineNuxtRouteMiddleware((to) => {
  // const token = useCookie('token')
  // const localePath = useLocalePath()
  
  // const isAuthRoute = to.path.includes('/auth')

  // // If there's no token and user is trying to access a protected route
  // if (!token.value && !isAuthRoute) {
  //   return navigateTo(localePath('/auth/login'))
  // }
  
  // // If user is already logged in and tries to access an auth route
  // if (token.value && isAuthRoute) {
  //   return navigateTo(localePath('/'))
  // }
})
