//  IRIS sessions: client-side handling from %SYS.TokenAuth provisioning
import { get, set } from '@vueuse/core'

export interface IRIStoken {
  access_token: string
  refresh_token: string
  sub: string
  iat: number
  exp: number
}

export interface Account {
  [key: string]: {
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
  = ref({ Dev: <Account>{}, Test: <Account>{}, Live: <Account>{} })

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

//  keep tokens by HCIE endpoint
const tokens = new Map<string, IRIStoken>()

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

const mirrorSet: Ref<{ [key: string]: mirrorset }>
  = ref({ Dev: <mirrorset>{}, Test: <mirrorset>{}, Live: <mirrorset>{} })

export interface processes {
  Production: string
  File: number
  Net: number
  Queue: number
  Misc?: number
}

const processList: Ref<{ [key: string]: processes }>
  = ref({ Dev: <processes>{}, Test: <processes>{}, Live: <processes>{} })

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
  = ref({ Dev: <filestat>{}, Test: <filestat>{}, Live: <filestat>{} })

const API: { [key: string]: string }
  = { Dev: '/api/hcie', Test: '/api/hcie', Live: '/api/hcie' }

const HCIE: { [key: string]: string }
  = { Dev: 'hciedev.laheyhealth.org', Test: 'hcietst.laheyhealth.org', Live: 'hcieprd.laheyhealth.org' }

const ICON: { [key: string]: string } = {
  Dev: 'i-vscode-icons-file-type-apib',
  Test: 'i-vscode-icons-file-type-light-todo',
  Live: 'i-vscode-icons-file-type-plsql-package'
}

export interface production {
  status?: string
  instance?: string
  systemMode?: string
  productions: string[]
}
export type INSTANCE = 'localhost' | 'Dev' | 'Test' | 'Live'
const Instances: INSTANCE[] = [process.env.NODE_ENV == 'development' ? 'localhost' : 'Dev', 'Test', 'Live']
const InstanceDefault: INSTANCE = process.env.NODE_ENV == 'development' ? 'localhost' : 'Test'
const Productions: Map<INSTANCE, production> = new Map()

const credentials = ref({
  username: '',
  password: '',
  IRIStoken: <IRIStoken>{}
})

const pending: Ref<{ [key: string]: number }>
  = ref({ Dev: 0, Test: 0, Live: 0 })

const user = ref(<User>{})
const dev = import.meta.dev || false

export default function useIrisTokens() {
  //  provision a new IRIS REST JWT session off user authentication
  async function getSession(hcie: string, username: string, password: string): Promise<IRIStoken | undefined> {
    let iToken: IRIStoken | undefined = dev
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
      await fetch(`https://${HCIE[hcie]}${API[hcie]}/login`, {
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
  async function endSession(hcie: string) {
    if (dev) return
    const jwt = tokens.get(hcie)
    if (jwt) {
      await fetch(`https://${HCIE[hcie]}${API[hcie]}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt.access_token}` }
      }).then(async (res) => {
        tokens.delete(hcie)
        console.info(res)
      })
    }
  }

  async function refresh(hcie: string) {
    if (dev) return
    const jwt = tokens.get(hcie)
    if (jwt && jwt.exp) {
      const secs = jwt.exp - Date.now() / 1000
      if (secs > 2) return
    }

    await fetch(`https://${HCIE[hcie]}${API[hcie]}/refresh`, {
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

  async function endpoint(hcie: string, route: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', send?: object): Promise<unknown | null> {
    let payload = null
    let jwt = tokens.get(hcie)
    if (dev) return payload

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
        await fetch(`https://${HCIE[hcie]}${API[hcie]}/${route}`, {
          method: method,
          headers: {
            'Authorization': `Bearer ${jwt?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: send ? JSON.stringify(send) : undefined
        }).then(async (res) => {
          try {
            await res.json().then(async (js) => {
              payload = js
            })
          } catch (err) {
            console.error(err)
          }
        }).catch((err) => {
          console.error(err)
        })
      })
    }
    return payload
  }

  async function loadProductions(hcie: INSTANCE) {
    if (!Productions.get(hcie)?.productions) {
      if (process.env.NODE_ENV == 'development') {
        Productions.set(hcie, { productions: hcie == 'localhost' ? ['HSCUSTOM', 'TRAINING'] : hcie == 'Test' ? ['BILHPN', 'BILHSFTP'] : ['BILHHOSPITALS', 'BILHSFTP'] })
      } else {
        await endpoint(hcie, 'productions').then((status) => {
          Productions.set(hcie, <production>status)
        })
      }
    }
  }

  async function stat(hcie: string, fileName: string) {
    fileStat.value[hcie] = <filestat>{}
    await endpoint(hcie, 'filestat', 'POST', { fileName: fileName }).then((result) => {
      fileStat.value[hcie] = <filestat>result
    }).catch((err) => {
      console.error(err)
    })
  }

  return { HCIE, ICON, Productions, Instances, InstanceDefault, pending, Accounts, mirrorSet, processList, fileStat, loadProductions, credentials, user, getSession, endSession, refresh, endpoint, stat }
}
