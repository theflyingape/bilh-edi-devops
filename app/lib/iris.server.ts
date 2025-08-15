// import { createConnection, Connection, IRIS, IRISList, IRISObject, IRISGlobalNode } from '@intersystems/intersystems-iris-native'
import { Connection, Iris } from '@intersystems/intersystems-iris-native'

export async function openInstance(host: string, username: string, password: string, ns = 'HSCUSTOM') {
  try {
    const connection = await Connection.createConnection({
      host: host, port: 1972, username: username, password: password, namespace: ns
    })
    const iris = connection.createIris()
    return iris
  } catch (err) {
    console.error(err, `for ${host} (${ns})`)
    return null
  }
}
