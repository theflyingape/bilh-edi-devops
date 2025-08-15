// iris-native.d.ts
declare module '@intersystems/intersystems-iris-native' {
  export class Connection {
    static createConnection(options: ConnectionOptions): Promise<Connection>
    createIris(): Promise<Iris>
    close(): Promise<void>
    isClosed(): boolean
    isUsingSharedMemory(): boolean
    toString(): string
  }

  export class Iris {
    set(globalName: string, subscripts: any[], value: any): Promise<void>
    get(globalName: string, subscripts: any[]): Promise<any>
    // Add other methods you use from the Iris class
  }

  interface ConnectionOptions {
    host: string
    port: number
    username?: string
    password?: string
    namespace?: string
  }
}
