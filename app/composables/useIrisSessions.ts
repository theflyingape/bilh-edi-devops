//  IRIS sessions: client-side handling from %SYS.TokenAuth provisioning
import { get, set } from '@vueuse/core'
import infrastructure from '~/assets/infrastructure.json'

export type HCIE = keyof typeof infrastructure
const Instances = Object.keys(infrastructure)
const host = (hcie: HCIE) => hcie ? infrastructure[hcie].vip : 'localhost'
const hosts = (hcie: HCIE) => hcie ? infrastructure[hcie].hosts : []
const icon = (hcie: HCIE) => hcie ? infrastructure[hcie].icon : 'i-lucide-construction'
const instance = (hcie: HCIE) => hcie ? infrastructure[hcie].instance : ''
const API = '/api/hcie'

//  POST https://vip/api/hcie/[login|refresh]
export interface IRIStoken {
  access_token: string
  refresh_token: string
  sub: string
  iat: number
  exp: number
}
const credentials = ref({
  username: '',
  password: '',
  IRIStoken: <IRIStoken>{}
})
//  keep tokens by HCIE endpoint
const tokens = new Map<string, IRIStoken>()

//  GET|DELETE|UPDATE https://vip/api/hcie/account/[@|:id]
export interface Account {
  [key: string]: {
    id: string
    groups: string[]
    name: string
    enabled: boolean
    namespace: string
    admin: boolean
    analyst: boolean
    sysadm: boolean
    shell: boolean
    comment: string
    lastlogin: string
  }
}
const Accounts: Ref<{ [key: string]: Account }>
  = ref({ Live: <Account>{}, Test: <Account>{}, Dev: <Account>{} })

//  GET https://vip/api/hcie/user/:id
export interface User {
  id: string
  enabled: boolean
  groups?: string[]
  roles?: string[]
  name?: string
  comment?: string
  loggedInAt?: number
  scope: Array<'guest' | 'associate' | 'user' | 'analyst' | 'developer' | 'admin' | 'systems'>
}
const user = ref(<User>{})

//  GET https://vip/api/hcie/status
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
const mirrorSet: Ref<{ [key: string]: mirrorset }>
  = ref({ Live: <mirrorset>{}, Test: <mirrorset>{}, Dev: <mirrorset>{} })

//  GET https://vip/api/hcie/productions
export interface production {
  status?: string
  instance?: string
  systemMode?: string
  productions: string[]
}
const Productions: Map<HCIE, production> = new Map()

//  GET https://vip/api/hcie/processes
export interface processes {
  Production: string
  File: number
  Net: number
  Queue: number
  Misc?: number
}
const processList: Ref<{ [key: string]: processes }>
  = ref({ Live: <processes>{}, Test: <processes>{}, Dev: <processes>{} })

export interface fastfetch {
  type: string
  result?: [object]
  error?: string
}

//  POST https://vip/api/hcie/filestat
//  content: { "fileName": "/path/to/filename.ext" }
export interface filestat {
  size: number
  permissions: string
  owner: string
  group: string
  modified: number
  fileName: string
  type: string
}
const fileStat: Ref<{ [key: string]: filestat }>
  = ref({ Live: <filestat>{}, Test: <filestat>{}, Dev: <filestat>{} })

const pending: Ref<{ [key: string]: number }>
  = ref({ Dev: 0, Test: 0, Live: 0 })

export default function useIrisTokens() {
  //  provision a new IRIS REST JWT session off user authentication
  async function getSession(hcie: HCIE, username: string, password: string): Promise<IRIStoken | undefined> {
    let iToken: IRIStoken | undefined = useDevOps().dev
      ? {
          access_token: 'access',
          refresh_token: 'refresh',
          sub: username,
          iat: 0,
          exp: -1
        }
      : undefined
    if (iToken) {
      set(user, {
        id: get(credentials).username,
        enabled: true,
        groups: ['sysadm', 'irisadm', 'irisdev'],
        roles: ['%Manager', '%Developer', '%Operator'],
        name: 'Devlin Opster',
        comment: 'Master Inventor',
        loggedInAt: Date.now(),
        scope: []
      })
    } else {
      const auth = btoa(`${username}:${password}`)
      await fetch(`https://${host(hcie)}${API}/login`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}` }
      }).then(async (res) => {
        try {
          await res.json().then(async (t) => {
            tokens.set(hcie, t)
            iToken = tokens.get(hcie)
          })
        } catch (err) {
          console.error(err)
        }
      })
    }
    return iToken
  }

  //  bye-bye
  async function endSession(hcie: HCIE) {
    if (useDevOps().dev) return
    const jwt = tokens.get(hcie)
    if (jwt) {
      await fetch(`https://${host(hcie)}${API}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt.access_token}` }
      }).then(async (res) => {
        tokens.delete(hcie)
        console.info(res)
      })
    }
  }

  async function refresh(hcie: HCIE) {
    if (useDevOps().dev) return
    const jwt = tokens.get(hcie)
    if (jwt && jwt.exp) {
      const secs = jwt.exp - Date.now() / 1000
      if (secs > 2) return
    }

    await fetch(`https://${host(hcie)}${API}/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt?.access_token}`,
        'Content-Type': 'application/json'
      }, body: JSON.stringify(jwt)
    }).then(async (res) => {
      try {
        await res.json().then(async (jwt) => {
          tokens.set(hcie, jwt)
        })
      } catch (err) {
        console.error(err)
      }
    }).catch((err) => {
      console.error(err)
      tokens.delete(hcie)
    })
  }

  async function endpoint<T>(hcie: HCIE, route: string, method: 'GET' | 'POST' | 'DELETE' | 'UPDATE' = 'GET', send?: object): Promise<T | undefined> {
    if (useDevOps().dev) return
    let jwt = tokens.get(hcie)

    //  upon first invocation to another instance ...
    if (!jwt) {
      await getSession(hcie, get(credentials).username, get(credentials).password).then((login) => {
        if (login) {
          jwt = login
          tokens.set(hcie, jwt)
        }
      })
    }

    //  test access for refresh prior to invocation
    if (jwt) {
      await refresh(hcie).then(async () => {
        jwt = tokens.get(hcie)
        await fetch(`https://${host(hcie)}${API}/${route}`, {
          method: method,
          headers: {
            'Authorization': `Bearer ${jwt?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: send ? JSON.stringify(send) : undefined
        }).then(async (res) => {
          try {
            await res.json().then(async (js) => {
              return js as Promise<T>
            })
          } catch (err) {
            console.error(err)
          }
        }).catch((err) => {
          console.error(err)
        })
      })
    }
  }

  async function loadProductions(hcie: HCIE) {
    if (!Productions.get(hcie)?.productions) {
      if (process.env.NODE_ENV == 'development') {
        Productions.set(hcie, { productions: hcie == 'Dev' ? ['HSCUSTOM', 'TRAINING'] : hcie == 'Test' ? ['BILHPN', 'BILHSFTP'] : ['BILHHOSPITALS', 'BILHSFTP'] })
      } else {
        await endpoint(hcie, 'productions').then((status) => {
          Productions.set(hcie, <production>status)
        })
      }
    }
  }

  async function stat(hcie: HCIE, fileName: string) {
    fileStat.value[hcie] = <filestat>{}
    await endpoint(hcie, 'filestat', 'POST', { fileName: fileName }).then((result) => {
      fileStat.value[hcie] = <filestat>result
    }).catch((err) => {
      console.error(hcie, fileName, err)
    })
  }

  return {
    Accounts,
    credentials,
    endpoint,
    endSession,
    fileStat,
    getSession,
    host,
    hosts,
    icon,
    infrastructure,
    instance,
    Instances,
    loadProductions,
    mirrorSet,
    pending,
    processList,
    Productions,
    refresh,
    stat,
    user
  }
}
