import useUserLogins from './user-logins'

export default defineEventHandler(async (_ev) => {
  const { tokensByUser } = useUserLogins()
  const online = [...tokensByUser.keys()]
  const login = Array.from(tokensByUser.values(), id => id.login)
  return { users: online, logins: login }
})
