//  server api
import pty from 'node-pty'

export default defineWebSocketHandler({
    open(peer) {
        console.log('WS open: ', peer.id)
    },
    close(peer) {
        console.log('WS close: ', peer.id)
    },
    error(peer, error) {
        console.error('WS error: ', peer.id, error)
    },
})
