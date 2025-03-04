
let unsub

module.exports = function(RED) {
  function FirebaseAdmin(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    if(config.cred){
      let c = RED.nodes.getNode(config.cred)
      this.admin = c.admin
    }

    const cb = (res)=>{
      console.log('firestore query result '+res)
      console.dir(res)
      let val = res.docs.map((d)=>{return d.data()})
      console.log('val='+val)
      node.send({payload:val})
    }

    node.on('input', function(msg) {
      console.log('firestore-query got input')
      console.dir(msg.payload)
      if(msg && msg.payload){
        const path = msg.payload.path
        if(unsub){
          unsub()
        }
        let ref = this.admin.firestore().collection(path)

        let dir = msg.payload.orderDirection ? msg.payload.orderDirection : 'desc'

        if(msg.payload.orderBy){
          console.log('orderBy dir = '+dir)
          ref = ref.orderBy(msg.payload.orderBy, dir)
        }
        if(msg.payload.limit){
          ref = ref.limit(msg.payload.limit)
        }
        if(msg.payload.startAt){
          console.log('startAt '+msg.payload.startAt)
          ref = ref.startAt(msg.payload.startAt)
        }
        if(msg.payload.endAt){
          console.log('endAt '+msg.payload.endAt)
          ref = ref.endAt(msg.payload.endAt)
        }

        // Decorate with queries
        if(msg.payload.queries && msg.payload.queries.length > 0){
          console.log('found queries')
          msg.payload.queries.forEach((query)=>{
            console.dir(query)
            ref = ref.where(query[0], query[1], query[2])
          })
        }

        console.log('finished firetore query is')
        console.dir(ref)

        unsub = ref.onSnapshot(cb)

      }
    }.bind(this));


  }
  RED.nodes.registerType("firestore-query", FirebaseAdmin);
}