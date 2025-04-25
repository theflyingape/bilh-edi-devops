//  IRIS sessions: client-side handling from %SYS.TokenAuth provisioning
import { get, set } from '@vueuse/core'

export interface IRIStoken {
  access_token: string
  refresh_token: string
  sub: string
  iat: number
  exp: number
}

export interface User {
  id: string,
  enabled: boolean,
  groups?: string[],
  roles?: string[],
  name?: string,
  comment?: string,
  loggedInAt?: number,
  scope: Array<'guest' | 'user' | 'analyst' | 'developer' | 'admin' | 'systems'>
}

//  keep tokens by HCIE endpoint
interface tokens {
  [key: string]: IRIStoken
}

let tokens: tokens = {}

enum HCIE {
  Dev = "hciedev.laheyhealth.org/api/hcie",
  Test = "hcietst.laheyhealth.org/api/hcie",
  Live = "hcieprd.laheyhealth.org/api/hcie"
}

const credentials = ref({
  username: '',
  password: '',
  IRIStoken: <IRIStoken>{}
})

const user = ref(<User>{})

export default function useIrisTokens() {

  //  provision an IRIS REST JWT session off user authentication
  async function getSession(hcie: string, username: string, password: string): Promise<IRIStoken | null> {
    const dev = import.meta.dev || false
    let IRIStoken = dev ? { access_token: 'access', refresh_token: 'refresh', sub: username, iat: 0, exp: -1 } : null
    if (IRIStoken) {
      set(user, {
        id: get(credentials).username,
        enabled: true,
        groups: ['irisadm', 'irisdev', 'sysadm'],
        roles: ['%Developer', '%Operator'],
        name: 'Devlin Tester',
        comment: 'TPM',
        loggedInAt: Date.now(),
        scope: []
      })
    }
    else {
      //          mode: 'no-cors', 'x-ISC_CORS': 'true'

      const auth = btoa(`${username}:${password}`)
      await fetch(`https://${hcie}/login`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
        }
      }).then(async (res) => {
        try {
          await res.json().then(async (t) => {
            tokens[hcie] = t
            IRIStoken = t
          })
        }
        catch (err) {
          console.error(err)
        }
      })
    }
    return IRIStoken
  }

  //  bye-bye
  async function endSession(hcie: string) {
    const jwt = tokens[hcie]
    if (jwt) {
      await fetch(`https://${hcie}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt.access_token}`,
          mode: 'no-cors', 'x-ISC_CORS': 'true',
        }
      }).then(async (res) => {
        delete tokens[hcie]
      })
    }
  }

  async function refresh(hcie: string, jwt: IRIStoken) {
    await fetch(`https://${hcie}/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt.access_token}`,
        mode: 'no-cors', 'x-ISC_CORS': 'true',
        'Content-Type': 'application/json',
      }, body: JSON.stringify(jwt)
    }).then(async (res) => {
      try {
        await res.json().then(async (jwt) => {
          tokens[hcie] = jwt
        })
      }
      catch (err) {
        console.error(err)
      }
    })
  }

  async function endpoint(hcie: string, route: string, method = 'GET'): Promise<any | null> {
    let jwt = tokens[hcie]
    let payload = null
    //  let's refresh access prior to invocation
    if (jwt) {
      await refresh(hcie, jwt).then(async () => {
        jwt = tokens[hcie]!
        await fetch(`https://${hcie}/${route}`, {
          method: method,
          headers: {
            Authorization: `Bearer ${jwt.access_token}`,
            mode: 'no-cors', 'x-ISC_CORS': 'true',
            'Content-Type': 'application/json'
          }
        }).then(async (res) => {
          try {
            await res.json().then(async (js) => {
              payload = js
            })
          }
          catch (err) {
            console.error(err)
          }
        })
      })
    }
    return payload
  }

  return { HCIE, credentials, user, getSession, endSession, refresh, endpoint }
}
