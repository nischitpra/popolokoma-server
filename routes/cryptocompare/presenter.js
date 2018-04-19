const id = require('../constants').id
const string = require('../constants').string
const values = require('../constants').values
const connection = require('../connection')
const db = require('../database')
const service = require('./service')


module.exports={
    updateCandleStick(from,to,interval,isNew,callback,lock_callback){
        if(isNew){
            db.find(`select * from ${id.database.cc.history_from_to_type(from,to,interval)} order by cast(_id as bigint) desc limit 1;`,(status,data)=>{
                if(status==values.status.ok){
                    if(data.length>0){
                        console.log('if is new')
                        const fromTime=data[0][id.binance.id]+1
                        const toTime=new Date().getTime()
                        service.updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback)
                    }else{
                        console.log('if is old')
                        const toTime=new Date().getTime()
                        const fromTime=toTime-values.binance.candle_interval_milliseconds[`_${interval}`]*500
                        service.updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback)
                    }
                }else{
                    lock_callback(false)
                    callback(status,data)
                }
            })
        }else{
            db.find(`select * from ${id.database.cc.history_from_to_type(from,to,interval)} order by cast(_id as bigint) asc limit 1;`,(status,data)=>{
                if(status==values.status.ok){
                    if(data.length>0){
                        console.log('if')
                        const toTime=data[0][id.binance.id]-1
                        const fromTime=toTime-values.binance.candle_interval_milliseconds[`_${interval}`]*500
                        service.updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback)
                    }else{
                        console.log('else')
                        const toTime=new Date().getTime()
                        const fromTime=toTime-values.binance.candle_interval_milliseconds[`_${interval}`]*500
                        service.updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback)
                    }
                }else{
                    lock_callback(false)
                    callback(status,data)
                }
            })
        }
    },
    getCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock,lock_callback){
        console.log(`isNew: ${isNew} from time: ${fromTime} totime: ${toTime} key: ${id.database.cc.history_from_to_type(from,to,interval)}`)
        db.find(`select * from ${id.database.cc.history_from_to_type(from,to,interval)} where cast(_id as bigint)>=${fromTime} and cast(_id as bigint)<=${toTime} order by cast(_id as bigint) asc;`,(status,data)=>{
            if(status==values.status.ok){
                console.log(`data length: ${data.length}`)
                if(data.length>0){
                    callback(status,data)
                }else{
                    if(!lock){
                        console.log(`no data found, updating candle stick`)
                        lock_callback(true)
                        this.updateCandleStick(from,to,interval,isNew,callback,lock_callback)
                    }else{
                        callback(values.status.error,string.functionLocked)
                    }
                }
            }else{
                callback(status,data)            
            }
        })
    },

}