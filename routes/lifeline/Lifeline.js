const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string

function Lineline(){
    this.interval=values.binance.candle_interval_milliseconds['_1h']
    this.position=0
    this.line=[]
    /** add item to end of queue */
    this.push=(object)=>{
        this.line.push(object)
    }
    /** add list to end of queue */
    this.pushAll=(list)=>{
        this.line=this.line.concat(list)
    }
    /** add item to start of queue and remove same item from queue if present */
    this.pushf=(object)=>{
        for(var i=this.position;i<this.line.length;i++){
            if(this.line[i].id==object.id){
                this.line.splice(i, 1)
                break
            }
        }
        /** add item to position */
        this.line.splice( this.position+1, 0, object );
        this.invalidate()
    }
    this.invalidate=()=>{
        const delay=this.interval/this.line.length
        var offset=delay
        console.log(`delay: ${delay}`)
        for(var i=this.position;i<this.line.length;i++){
            clearTimeout(this.line[i].timer) 
            this.line[i].timer=setTimeout(()=>{
                console.log(`invalidate : #${i} : ${this.line.length}:po${this.position}`)
                this.line[this.position].functionCallback(this.line[this.position].params)
                delete this.line[this.position] /** delete item without changing array position */
                this.position++
            }, offset)
            offset+=delay
        }
    }
}

module.exports=Lineline