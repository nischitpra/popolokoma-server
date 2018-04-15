const id = require('../constants').id
const string = require('../constants').string
const values = require('../constants').values
const connection = require('../connection')
const db = require('../database')
const service = require('./service')


module.exports={
    
    getFullPriceHistory(type,from,to,callback){
        console.log(id.database.cc.history_from_to_type(from,to,type))
        db.findManySorted(id.database.cc.history_from_to_type(from,to,type),{},{[id.database.cc.time]:1},callback)
    },

    getHistory(type,from,to,exchange,fromTime,toTime,callback){
        if(fromTime==null){
            this.getOldHistory(type,from,to,exchange,toTime,callback)
        }else if(toTime==null){
            this.getNewHistory(type,from,to,exchange,fromTime,callback)
        }else{
            callback(values.status.error,[])
        }
        
    },
    getOldHistory(type,from,to,exchange,toTime,callback){
        connection.getHistory(id.cryptocompare.history[type],from,to,exchange,toTime,callback)
    },
    getNewHistory(_id,from,to,exchange,fromTime,callback){

    },


    getFavourites(from,to,exchange,callback){
        connection.getFavourites(from,to,exchange,callback)
    },
    getCoinList(callback){
        connection.getCoinList(callback)
    },
    getSubsList(from,to,callback){
        connection.getSocketScubscriptionList(from,to,callback)
    },

    getHistoryStartTime(key,callback){
        db.findManyLimited(key,{},{[id.database.cc.time]:1},1,(status,data)=>{
            data=data[0]
            if(status==values.status.ok && data!=undefined){
                console.log('previous records exists: '+data[id.database.cc.time])
                callback(status,data[id.database.cc.time])
            }else{
                console.log('fresh start')
                callback(status,Math.round(new Date().getTime()/1000))
            }
        })
    },
    updateCandleStick(from,to,interval,isNew,callback,lock_callback){
        if(isNew){
            db.findManyLimited(id.database.cc.history_from_to_type(from,to,interval),{},{[id.binance.id]:-1},1,(status,data)=>{
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
            db.findManyLimited(id.database.cc.history_from_to_type(from,to,interval),{},{[id.binance.id]:1},1,(status,data)=>{
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
        console.log(`db.${id.database.cc.history_from_to_type(from,to,interval)}.find(${JSON.stringify({[id.database.cc.id]:{$gte:fromTime,$lte:toTime}})}).sort(${JSON.stringify({[id.database.cc.id]:1})})`)
        db.findManySorted(id.database.cc.history_from_to_type(from,to,interval),{[id.database.cc.id]:{$gte:fromTime,$lte:toTime}},{[id.database.cc.id]:1},(status,data)=>{
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
    }
}