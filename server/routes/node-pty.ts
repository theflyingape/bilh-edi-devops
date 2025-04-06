//  spawn a new terminal session on host using
//  this client websocket connection attached as stdin/stdout
import { log } from '../syslog'
import pty from 'node-pty'
import { terminal, sessions } from '../terminal-sessions'
import url from 'url'

export default defineWebSocketHandler({
  open(peer) {
    const wsOpts = url.parse(peer.request.url, true).query
    const id = <string>wsOpts?.id || 'unknown'
    const profile = <string>wsOpts?.profile || 'localhost'
    const cfg = terminal[profile]

    log('LOG_DEBUG', `node-pty ${peer.id} open for ${id} on ${profile} - ${peer.request.url}`, cfg.loglevel)
    //  prepare server-side command arguments
    let params = [ ...cfg.params ]
    params.push(id)
    if (profile !== 'localhost') params.push(cfg.host)
    //  execute
    let spawn = pty.spawn(cfg.cmd, params, {
      name: cfg.pty?.term || 'xterm-256color',
      cols: cfg.pty?.cols || 80, rows: cfg.pty?.rows || 25,
      cwd: cfg.pty?.cwd || '.',
      env: cfg.pty?.env || process.env
    })

    const pid = peer.id || spawn.pid
    sessions[pid] = { profile: profile, term: spawn }
    const session = sessions[pid]
    log('LOG_DEBUG', `node-pty sessions[${pid}] = ${JSON.stringify(session)}`, cfg.loglevel)

    if (pid) {
      log('LOG_NOTICE', `node-pty ${pid} started PID #${sessions[pid].term.pid}: ${[cfg.cmd, ...cfg.params, id].join(" ")}`)

      session.term.onData((data) => {
        try {
          peer.send(data)
        } catch (ex) {
          log('LOG_ERROR', `node-pty ${pid} exception → browser: ${ex}`, cfg.loglevel)
        }
      })

      session.term.onExit((ev) => {
        log('LOG_NOTICE', `node-pty ${pid} exit ${ev.exitCode} from PID #${sessions[pid].term.pid}`)
        if (peer.websocket && peer.websocket.readyState != 3)
          peer.websocket.close!()
        else if (sessions[pid])
          delete sessions[pid]
      })
    }
    else {
      log('LOG_ERROR', `node-pty spawn failure to run: ${cfg.cmd} ${cfg.params.join(" ")}`, cfg.loglevel)
    }
  },

  message(peer, message) {
    const session = sessions[peer.id]
    const term = session.term
    const profile = session.profile
    const cfg = terminal[profile]
    //  allow for JSON "events" to passthru this pipe, in place of negotiating
    //  the WebSocket peer.id back to the client and using REST endpoint(s)
    let text = message.text()
    if (text.length > 30) {
      const start = text.indexOf('♥{')
      if (start >= 0) {
        const end = text.indexOf('}}', start + 2) + 1
        if (end > start) {
          try {
            term.write(text.substring(0, start - 1))
            const req = text.substring(start + 1, end + 1)
            text = text.substring(end + 1)
            const event = JSON.parse(req)
            if (event.resize) {
              log('LOG_DEBUG', `node-pty ${peer.id} ${req}`, cfg.loglevel)
              term.resize(event.resize.cols, event.resize.rows)
            }
          }
          catch(err) {
            log('LOG_ERROR', `node-pty ${peer.id} ${err}`, cfg.loglevel)
          }
        }
      }
    }
    term.write(text)
  },

  close(peer) {
    const session = sessions[peer.id]
    const term = session?.term
    const profile = session?.profile
    const cfg = terminal[profile]
    log('LOG_INFO', `node-pty ${peer.id} close`, cfg.loglevel)
    if (term)
      term.kill('SIGTERM')
    else
      delete sessions[peer.id]
  },

  error(peer, error) {
    const session = sessions[peer.id]
    const term = session.term
    const profile = session.profile
    const cfg = terminal[profile]
    log('LOG_ERROR', `node-pty ${peer.id} error: ${error}`, cfg.loglevel)
    if (term)
      term.kill('SIGTERM')
    else
      delete sessions[peer.id]
   },
})
