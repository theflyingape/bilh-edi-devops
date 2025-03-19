//  server api
export default defineWebSocketHandler({
    open(peer) {
        //console.log('WS open: ', peer)
    },
    close(peer) {
        //console.log('WS close: ', peer)
    },
    error(peer, error) {
        //console.error('WS error: ', peer, error)
    },
})
