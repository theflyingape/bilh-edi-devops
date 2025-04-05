/**
 * Copyright (c) 2014, 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * Implements the attach method, that attaches the terminal to a WebSocket stream.
 * My fork to simply provide _private -> public access for more flexible use of it.
 */

import type { Terminal, IDisposable, ITerminalAddon } from '@xterm/xterm'

interface IAttachOptions {
  bidirectional?: boolean
}

export class AttachAddon implements ITerminalAddon {
  public socket: WebSocket
  private _bidirectional: boolean
  private _disposables: IDisposable[] = []

  constructor(socket: WebSocket, options?: IAttachOptions) {
    this.socket = socket
    // always set binary type to arraybuffer, we do not handle blobs
    this.socket.binaryType = 'arraybuffer'
    this._bidirectional = !(options && options.bidirectional === false)
  }

  public activate(terminal: Terminal): void {
    this._disposables.push(
      addSocketListener(this.socket, 'message', ev => {
        const data: ArrayBuffer | string = ev.data
        terminal.write(typeof data === 'string' ? data : new Uint8Array(data))
      })
    )

    if (this._bidirectional) {
      this._disposables.push(terminal.onData(data => this.sendData(data)))
      this._disposables.push(terminal.onBinary(data => this.sendBinary(data)))
    }

    this._disposables.push(addSocketListener(this.socket, 'close', () => this.dispose()))
    this._disposables.push(addSocketListener(this.socket, 'error', () => this.dispose()))
  }

  public dispose(): void {
    for (const d of this._disposables) {
      d.dispose()
    }
  }

  public sendData(data: string): void {
    if (!this.checkOpenSocket()) {
      return
    }
    this.socket.send(data)
  }

  public sendBinary(data: string): void {
    if (!this.checkOpenSocket()) {
      return
    }
    const buffer = new Uint8Array(data.length)
    for (let i = 0; i < data.length; ++i) {
      buffer[i] = data.charCodeAt(i) & 255
    }
    this.socket.send(buffer)
  }

  public checkOpenSocket(): boolean {
    switch (this.socket.readyState) {
      case WebSocket.OPEN:
        return true
      case WebSocket.CONNECTING:
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return false
      default:
        throw new Error('Unexpected socket state')
    }
  }
}

function addSocketListener<K extends keyof WebSocketEventMap>(socket: WebSocket, type: K, handler: (this: WebSocket, ev: WebSocketEventMap[K]) => any): IDisposable {
  socket.addEventListener(type, handler)
  return {
    dispose: () => {
      if (!handler) {
        // Already disposed
        return
      }
      socket.removeEventListener(type, handler)
    }
  }
}
