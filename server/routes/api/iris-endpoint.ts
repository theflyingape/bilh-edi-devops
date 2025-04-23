//  IRIS endpoint proxy
import { log } from '~/lib/syslog'
import url from 'url'
import useIrisTokens from './iris-sessions'

export default defineEventHandler(async (event)  => {
  const { endpoint } = useIrisTokens()
  log('LOG_NOTICE', `iris-endpoint ${event}`)
  const params = url.parse(event.path, true).query
  const hcie = <string>params?.hcie
  const username = <string>params?.username
  const route = <string>params?.route
  const method = <string>params?.method

  endpoint(hcie, username, route, method)
})
