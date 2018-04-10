const network = require('../constants').network
const id = require('../constants').id
const connection = require('../connection')
class CryptoSocket{
    constructor(from,to,client_socket){
        this.from=from
        this.to=to
        this.client_socket=client_socket
        this.isSubscribed=false
    }
    subscribe(){
        connection.getSocketScubscriptionList(this.from,this.to,(subsList)=>{
            console.log(subsList)
            this.subsList=subsList
            this.cc_socket = require('socket.io-client')(network.cryptocompareWebSocket);
            this.cc_socket.on('connect', ()=>{
              console.log('connection established with cryptocompare')
              this.cc_socket.emit('SubAdd',  { subs: this.subsList })
              this.isSubscribed=true
            });
            this.cc_socket.on('m', (trade)=>{
                this.client_socket.emit([id.cryptocompare.serverEvent],trade)
            })
            
          }
        )
    }
    unsubscribe(){
        console.log(`unsubs list: ${this.subsList}`)
        this.cc_socket.emit('SubRemove',  { subs: this.subsList })
    }
}

module.exports=CryptoSocket