//  IRIS sessions: client-side handling from %SYS.TokenAuth provisioning
enum HCIE {
  Dev = "hciedev.laheyhealth.org/api/hcie",
  Test = "hcietst.laheyhealth.org/api/hcie",
  Live = "hcieprd.laheyhealth.org/api/hcie"
}

interface token {
  access_token: string
  refresh_token: string
  sub: string
  iat: number
  exp: number
}

//  keep tokens by HCIE endpoint, sub
interface tokens {
  [key: string]: {
    [key: string]: token
  }
}

let tokens: tokens = {}
tokens[HCIE.Dev] = {}
tokens[HCIE.Test] = {}
tokens[HCIE.Live] = {}

export default function useIrisTokens() {

  //  retrieve IRIS REST JWT as user authentication
  async function login(hcie:HCIE, username:string, password:string): Promise<token|null> {
    let jwt = null
    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    await fetch(`https://${hcie}/login`, { method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        mode: 'no-cors',
      }
    }).then(async (res) => {
      try {
        await res.json().then(async (t) => {
          tokens[hcie][t.sub] = t
          jwt = t
        })
      }
      catch (err) {
        console.error(err)
      }
    })
    return jwt
  }

  //  bye-bye
  async function logout(hcie:HCIE, user:string) {
    let jwt = tokens[hcie][user]
    await fetch(`https://${hcie}/logout`, { method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt.access_token}`,
        mode: 'no-cors',
      }
    }).then(async (res) => {
      delete tokens[hcie][user]
    })
  }

  async function refresh(hcie:HCIE, jwt: token) {
    await fetch(`https://${hcie}/refresh`, { method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt.access_token}`,
        mode: 'no-cors',
      }, body: JSON.stringify(jwt)
    }).then(async (res) => {
      try {
        await res.json().then(async (jwt) => {
          tokens[hcie][jwt.sub] = jwt
        })
      }
      catch (err) {
        console.error(err)
      }
    })
  }

  async function endpoint(hcie:HCIE, user:string, route:string, method = 'GET'): Promise<object|null> {
    let jwt = tokens[hcie][user]
    let payload = null
    //  let's refresh access prior to invocation
    await refresh(hcie, jwt).then(async () => {
      jwt = tokens[hcie][user]
      await fetch(`https://${hcie}/${route}`, { method: method,
        headers: {
          Authorization: `Bearer ${jwt.access_token}`,
          mode: 'no-cors',
        }, body: JSON.stringify(jwt)
      }).then(async (res) => {
        try {
          await res.json().then(async (res) => {
            payload = res
          })
        }
        catch (err) {
          console.error(err)
        }
      })
    })
    return payload
  }

  return { HCIE, tokens, login, logout, refresh, endpoint }
}
