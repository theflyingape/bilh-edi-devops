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

export interface mirrorstatus {
  memberName: string
  currentRole: string
  currentStatus: string
  journalLatency: string
  databaseLatency: string
  journalTimeLatency: string
  databaseTimeLatency: string
  displayType: string
  displayStatus: string
}

export interface mirrorset {
  status: string
  instance: string
  systemMode: string
  memberStatus: string[]
  otherStatus: string[]
  mirrorStatus: mirrorstatus[]
  lastArchive: string
  lastBackup: string
}

const mirrorSet:Ref<{[key: string]: mirrorset}> = ref({ Dev:<mirrorset>{}, Test:<mirrorset>{}, Live:<mirrorset>{} })

export interface processes {
  Production:string
  File:number
  Net:number
  Queue:number
  Misc?:number
}

const processList:Ref<{[key: string]: processes}> = ref({ Dev:<processes>{}, Test:<processes>{}, Live:<processes>{} })

export interface filestat {
  fileName: string
  size: number
  permissions: string
  owner: string
  group: string
  modified: number
}

const fileStat:Ref<{[key: string]: filestat}> = ref({ Dev:<filestat>{}, Test:<filestat>{}, Live:<filestat>{} })

const HCIE: { [key:string]: string } = {
  Dev: "hciedev.laheyhealth.org",
  Test: "hcietst.laheyhealth.org",
  Live: "hcieprd.laheyhealth.org"
}

const ICON: {[key: string]: string} = {
  Dev: "i-vscode-icons-file-type-apib",
  Test: "i-vscode-icons-file-type-light-todo",
  Live: "i-vscode-icons-file-type-plsql-package"
}

const API: {[key: string]: string} = {
  Dev: "/api/hcie",
  Test: "/api/hcie",
  Live: "/api/hcie"
}

const credentials = ref({
  username: '',
  password: '',
  IRIStoken: <IRIStoken>{}
})

const user = ref(<User>{})
const dev = import.meta.dev || false

export default function useIrisTokens() {
  //  provision an IRIS REST JWT session off user authentication
  async function getSession(hcie: string, username: string, password: string): Promise<IRIStoken | null> {
    let IRIStoken = dev ? { access_token: 'access', refresh_token: 'refresh', sub: username, iat: 0, exp: -1 } : null
    if (IRIStoken) {
      set(user, {
        id: get(credentials).username,
        enabled: true,
        groups: ['sysadm', 'irisadm', 'irisdev'],
        roles: ['%Manager', '%Developer', '%Operator'],
        name: 'Devlin Tester',
        comment: 'TPM',
        loggedInAt: Date.now(),
        scope: []
      })
    }
    else {
      const auth = btoa(`${username}:${password}`)
      await fetch(`https://${HCIE[hcie]}${API[hcie]}/login`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}` }
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
    if (dev) return
    const jwt = tokens[hcie]
    if (jwt) {
      await fetch(`https://${HCIE[hcie]}${API[hcie]}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt.access_token}` }
      }).then(async (res) => {
        delete tokens[hcie]
      })
    }
  }

  async function refresh(hcie: string, jwt: IRIStoken) {
    if (dev) return
    if (jwt && jwt.exp) {
      const secs = jwt.exp - Date.now() / 1000
      if (secs > 2) return
    }

    await fetch(`https://${HCIE[hcie]}${API[hcie]}/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt.access_token}`,
        'Content-Type': 'application/json'
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

  async function endpoint(hcie: string, route: string, method:'GET'|'POST' = 'GET', send:object|undefined): Promise<any|null> {
    let payload = null
    let jwt = tokens[hcie]
    if (dev) return payload

    //  upon first invocation to another instance ...
    if (!jwt) {
      await getSession(hcie, get(credentials).username, get(credentials).password).then((login) => {
        if(login) {
          jwt = login
          tokens[hcie] = jwt
        }
      })
    }

    //  let's refresh access prior to invocation
    if (jwt) {
      await refresh(hcie, jwt).then(async () => {
        jwt = tokens[hcie]!
        await fetch(`https://${HCIE[hcie]}${API[hcie]}/${route}`, {
          method: method,
          headers: {
            Authorization: `Bearer ${jwt.access_token}`,
            'Content-Type': 'application/json'
          },
          body: send ? JSON.stringify(send) : undefined
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


  async function stat(hcie:string, fileName:string) {
    await endpoint(hcie, 'filestat', 'POST', { fileName: fileName }).then((result:filestat) => {
      fileStat.value[hcie] = result
    })
  }

  return { HCIE, ICON, mirrorSet, processList, fileStat, credentials, user, getSession, endSession, refresh, endpoint, stat }
}
