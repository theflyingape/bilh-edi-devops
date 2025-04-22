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
    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    await fetch(`https://${hcie}/login`, {
      headers: {
        Authorization: `Basic ${auth}`,
        mode: 'no-cors',
      }
    }).then(async (res) => {
      try {
        await res.json().then(async (jwt) => {
          tokens[hcie][jwt.sub] = jwt
          return jwt
        })
      }
      catch (err) {
        console.error(err)
      }
    })
    return null
  }

  //  bye-bye
  async function logout(hcie:HCIE, jwt: token) {
    await fetch(`https://${hcie}/logout`, {
      headers: {
        Authorization: `Bearer ${jwt.access_token}`,
        mode: 'no-cors',
      }
    }).then(async (res) => {
    })
  }

  async function refresh(hcie:HCIE, jwt: token) {
    await fetch(`https://${hcie}/refresh`, {
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

  async function endpoint(hcie:HCIE, route:string, jwt: token) {
    //  let's refresh access prior to invocation
    await refresh(hcie, jwt).then(async () => {
      await fetch(`https://${hcie}/${route}`, {
        headers: {
          Authorization: `Bearer ${jwt.access_token}`,
          mode: 'no-cors',
        }, body: JSON.stringify(jwt)
      }).then(async (res) => {
        try {
          await res.json().then(async (res) => {
            
          })
        }
        catch (err) {
          console.error(err)
        }
      })
    })
  }

  return { HCIE, tokens, login, logout, refresh, endpoint }
}
