//  start a new terminal session on host in preparation for a client websocket connection into node-pty
import { ITerminalOptions } from '@xterm/xterm'
import pty from 'node-pty'
import { IPty } from 'node-pty'

interface client {
  [key: string]: {
    options: ITerminalOptions
    bgColor: string
    cols?: number
    scrollback: 1000
    fontFamily: string
    theme: {
      foreground: string
      background: string
    }
  }
}

interface config {
  [key: string]: {
    host: string
    cmd: string
    params: string[]
    loglevel?: string | number
    pty?: {
      term: string
      cols: number
      rows: number
      cwd: string
      env: {}
    }
  }
}

interface session extends IPty {
  spawn?: any
  startup?: string
}

interface sessions {
  [key: string]: session
}

import profiles from '~/assets/terminals.json'
let terminal: config = Object.assign(profiles)
let sessions: sessions = {}

export default defineWebSocketHandler({
  open(peer) {
    const profile = 'localhost'
    console.log('WS open: ', peer.id, peer.request.url)
    let term = pty.spawn(terminal[profile].cmd, terminal[profile].params, {
      name: terminal[profile].pty?.term || 'xterm256-color',
      cols: terminal[profile].pty?.cols || 80, rows: terminal[profile].pty?.rows || 25,
      cwd: terminal[profile].pty?.cwd || __dirname,
      env: terminal[profile].pty?.env || process.env
    })
    const pid = peer.id || term.pid

    if (pid) {
      //syslog.note(`Started app PID: ${pid} CLIENT: ${process.env.SSH_CLIENT} (${rows}x${cols})`)
      console.log(`Started terminal PID: ${pid} as ${terminal[profile].cmd} ${terminal[profile].params}`)
      sessions[pid] = term
      //  app → browser client
      term.onData((data) => {
        //let msg = message(term, data, false)
        try {
          peer.send(data)
        } catch (ex) {
          console.error(`?FATAL ACTIVE app session ${pid} pty → ws error:`, ex)
          console.error(data)
        }
      })

      //  app shutdown
      term.onExit(() => {
        console.log(`Exit session ${pid}`)
        // Clean things up
      })
    }
    else {
      //syslog.warn(`Failed to spawn app request for CLIENT: ${process.env.SSH_CLIENT} (${rows}x${cols})`)
      console.error(`Failed to spawn the ${profile} terminal request`)
    }

    /*
    .on('connection', (browser, req) => {
        let term = sessions[peer.id]
        term.spawn.dispose()
        if (term.startup) browser.send(term.startup)

        //  app → browser client
        term.onData((data) => {
            let msg = message(term, data, false)
            try {
                browser.send(new TextDecoder().decode(msg))
            } catch (ex) {
                if (term.pid) {
                    console.error(`?FATAL ACTIVE app session ${term.pid} pty → ws error:`, ex.message)
                    console.error(msg)
                    db.unlock(term.pid)
                    browser.close()
                }
            }
        })

        //  app shutdown
        term.onExit(() => {
            console.log(`Exit PLAYER session ${term.pid} for remote host: ${term.client}`)
            // Clean things up
            delete broadcasts[term.pid]
            delete sessions[term.pid]
            pid = 0
            browser.close()
        })

        //  browser client → app
        browser.on('message', (msg) => {
            try {
                term.write(msg)
            } catch (ex) {
                if (term.pid) {
                    console.error(`?FATAL ACTIVE browser session ${term.pid} ws → pty error:`, ex.message)
                    db.unlock(term.pid)
                    browser.close()
                }
            }
        })

        browser.on('close', () => {
            //  did user close browser with an open app?
            if (pid > 1) try {
                term.destroy()   // process.kill(pid, 1)
                console.warn(`Forced close PLAYER session ${term.pid} from remote host: ${term.client}`)
            } catch (ex) {
                console.error(`?FATAL browser close event ${term.pid}: ${ex}`)
            }
        })
    */
  },
  message(peer, message) {
    //console.log('WS message: ', peer.id, message, message.text())
    let term: IPty = sessions[peer.id]
    term.write(message.text())
    /*
    if (message.text().includes("ping")) {
        peer.send({ user: "server", message: "pong" });
    } else {
        const msg = {
        user: peer.toString(),
        message: message.toString(),
        };
        peer.send(msg); // echo
        peer.publish("chat", msg);
    }
    */
  },
  close(peer) {
    console.log('WS close: ', peer.id)
  },
  error(peer, error) {
    console.error('WS error: ', peer.id, error)
  },
})
