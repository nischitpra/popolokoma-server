const db = require('../database')
const connection = require('../connection')
const presenter = require('./presenter')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const pythoninvoker=require('../../routes/pythoninvoker')

module.exports={
    // insertHistory(type,from,to,exchange,toTime,callback){
    //     presenter.getHistory(type,from,to,exchange,null,toTime,(status,data)=>{
    //             if(status==values.status.ok){
    //                 var notMore=data[data.length-1][id.cryptocompare.close]==0 &&  data[data.length-1][id.cryptocompare.open]==0 &&  data[data.length-1][id.cryptocompare.high]==0 &&  data[data.length-1][id.cryptocompare.low]==0
    //                 if(notMore){
    //                     callback(values.status.error,'no more data in cc')
    //                     return
    //                 } 
    //                 db.insertMany(id.database.cc.history_from_to_type(from,to,type),data,(status,message)=>{
    //                     console.log(message)
    //                     notMore=data[data.length-1][id.cryptocompare.close]==0 &&  data[data.length-1][id.cryptocompare.open]==0 &&  data[data.length-1][id.cryptocompare.high]==0 &&  data[data.length-1][id.cryptocompare.low]==0
                        
                        
    //                     if(notMore){
    //                         callback(status,`${message} start time: ${data[0][id.database.cc.time]} no more data exists!!`)
    //                     }else{
    //                         callback(status,message+' start time: '+data[0][id.database.cc.time] )
    //                     }
    //                 })
    //             }else{
    //                 callback(status,data)
    //             }
    //         }
    //     )
    // },
    // updateHistory(type,from,to,exchange,callback){
    //     const toTime=new Date().getTime()
    //     presenter.getHistory(type,from,to,exchange,null,toTime,(status,data)=>{
    //         if(status==values.status.ok){
    //             db.findManyLimited(id.database.cc.history_from_to_type(from,to,type),{},{[id.database.cc.time]:-1},1,(status,data)=>{
    //                 if(status==values.status.ok){
    //                     const time=data[0][id.database.cc.time]
                        

    //                 }
    //             })
    //             db.insertMany(id.database.cc.history_from_to_type(from,to,type),data,(status,message)=>{
    //                 console.log(message)
    //                 notMore=data[data.length-1][id.cryptocompare.close]==0 &&  data[data.length-1][id.cryptocompare.open]==0 &&  data[data.length-1][id.cryptocompare.high]==0 &&  data[data.length-1][id.cryptocompare.low]==0
    //                 if(notMore){
    //                     callback(status,`${message} start time: ${data[0][id.database.cc.time]} no more data exists!!`)
    //                 }else{
    //                     callback(status,message+' start time: '+data[0][id.database.cc.time] )
    //                 }
    //             })
    //         }else{
    //             callback(status,data)
    //         }
    //     })
    // },
    get24HrTicker(from,to,callback){
        connection.get24HrTicker(from,to,(status,data)=>{
            callback(status,data)
        })
    },
    // updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback){
    //     connection.getCandleStick(from,to,interval,fromTime,toTime,(status,data)=>{
    //         if(status==values.status.ok&& data.length>0){
    //             console.log(`no of records in json : ${data.length}`)
    //             const collection=id.database.cc.history_from_to_type(from,to,interval)
    //             if (isNew){
    //                 console.log('inserting for new')
    //                 db.findManyLimited(collection,{},{[id.database.cc.id]:-1},1,(status,prevData)=>{
    //                     if(prevData.length==0){
    //                         this.saveHistoryDataset(collection,data,isNew,0,callback,lock_callback)
    //                     }else{
    //                         this.saveHistoryDataset(collection,data,isNew,prevData[0][id.database.cc.id],callback,lock_callback)
    //                     }
    //                 })
    //             }else{
    //                 console.log('inserting for old')
    //                 db.findManyLimited(collection,{},{[id.database.cc.id]:1},1,(status,prevData)=>{
    //                     if(prevData.length==0){
    //                         this.saveHistoryDataset(collection,data,isNew,new Date().getTime(),callback,lock_callback)
    //                     }else{
    //                         this.saveHistoryDataset(collection,data,isNew,prevData[0][id.database.cc.id],callback,lock_callback)
    //                     }
    //                 })
    //             }
    //         }else{
    //             console.log(`something is worng,, inside outer else`)
    //             lock_callback(false)
    //             callback(status,data)
    //         }
    //     })
    // },

    // saveHistoryDataset(key,data,isNew,entryTime,callback,lock_callback){
    //     console.log('saving dataset')
    //     var list=[]
    //     data.map(row=>{
    //         var ob={}
    //         var i=0
    //         ob[id.binance.id]=parseInt(row[i++])
    //         ob[id.binance.open]=parseFloat(row[i++])
    //         ob[id.binance.high]=parseFloat(row[i++])
    //         ob[id.binance.low]=parseFloat(row[i++])
    //         ob[id.binance.close]=parseFloat(row[i++])
    //         ob[id.binance.volume]=parseFloat(row[i++])
    //         ob[id.binance.close_time]=parseFloat(row[i++])
    //         ob[id.binance.quote_asset_volume]=parseFloat(row[i++])
    //         ob[id.binance.number_of_trades]=parseFloat(row[i++])
    //         ob[id.binance.taker_buy_base_asset_volume]=parseFloat(row[i++])
    //         ob[id.binance.taker_buy_quote_asset_volume]=parseFloat(row[i++])
    //         if(isNew){
    //             if(ob[id.binance.id]>entryTime){
    //                 list.push(ob)
    //             }
    //         }
    //         if(!isNew){
    //             if(ob[id.binance.id]<entryTime){
    //                 list.push(ob)
    //             }
    //         }
    //     })
    //     if(list.length>0){
    //         console.log('inserting into the database')
    //         db.insertMany(key,list,(status,message)=>{
    //             if(status==values.status.ok){
    //                 lock_callback(false)
    //                 callback(status,list)
    //             }else{
    //                 lock_callback(false)
    //                 callback(values.status.error,message)
    //             }
    //         })
    //     }else{
    //         console.log(string.database.insert.emptyList)
    //         lock_callback(false)
    //         callback(values.status.error,[])
    //     }
    // }
    updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback){
        connection.getCandleStick(from,to,interval,fromTime,toTime,(status,data)=>{
            if(status==values.status.ok&& data.length>0){
                console.log(`no of records in json : ${data.length}`)
                const collection=id.database.cc.history_from_to_type(from,to,interval)
                if (isNew){
                    console.log('inserting for new')
                    db.find(`select * from ${collection} order by _id desc limit 1`,(status,prevData)=>{
                        if(prevData.length==0){
                            this.saveHistoryDataset(collection,data,isNew,0,callback,lock_callback)
                        }else{
                            this.saveHistoryDataset(collection,data,isNew,prevData[0][id.database.cc.id],callback,lock_callback)
                        }
                    })
                }else{
                    console.log('inserting for old')
                    db.find(`select * from ${collection} order by _id asc limit 1`,(status,prevData)=>{
                        if(prevData.length==0){
                            this.saveHistoryDataset(collection,data,isNew,new Date().getTime(),callback,lock_callback)
                        }else{
                            this.saveHistoryDataset(collection,data,isNew,prevData[0][id.database.cc.id],callback,lock_callback)
                        }
                    })
                }
            }else{
                console.log(`something is worng,, inside outer else`)
                lock_callback(false)
                return callback(status,data)
            }
        })
    },

    saveHistoryDataset(tableName,data,isNew,entryTime,callback,lock_callback){
        console.log('saving dataset')
        var list=[]

        data.map(row=>{
            var ob={}
            var i=0
            for(var i in id.database.collection.keyList.history){
                ob[id.database.collection.keyList.history[i]]=parseFloat(row[i])
            }
            list.push(ob)
        })
        if(list.length>0){
            console.log('inserting into the database')
            db.insert(tableName,id.database.collection.keyList.history,list,(status,message)=>{
                if(status==values.status.ok){
                    lock_callback(false)
                    return callback(status,list)
                }else{
                    lock_callback(false)
                    return callback(values.status.error,message)
                }
            })
        }else{
            console.log(string.database.insert.emptyList)
            lock_callback(false)
            return callback(values.status.error,[])
        }
    }
}