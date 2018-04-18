const db = require('../database')
const connection = require('../connection')
const presenter = require('./presenter')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const pythoninvoker=require('../../routes/pythoninvoker')

module.exports={
    get24HrTicker(from,to,callback){
        connection.get24HrTicker(from,to,(status,data)=>{
            callback(status,data)
        })
    },
    updateCandleStick(from,to,interval,fromTime,toTime,isNew,callback,lock_callback){
        connection.getCandleStick(from,to,interval,fromTime,toTime,(status,data)=>{
            if(status==values.status.ok&& data.length>0){
                console.log(`no of records in json : ${data.length}`)
                const collection=id.database.cc.history_from_to_type(from,to,interval)
                if (isNew){
                    console.log('inserting for new')
                    db.find(`select * from ${collection} order by ${id.database.id} desc limit 1`,(status,prevData)=>{
                        if(prevData.length==0){
                            this.saveHistoryDataset(collection,data,isNew,0,callback,lock_callback)
                        }else{
                            this.saveHistoryDataset(collection,data,isNew,prevData[0][id.database.cc.id],callback,lock_callback)
                        }
                    })
                }else{
                    console.log('inserting for old')
                    db.find(`select * from ${collection} order by ${id.database.id} asc limit 1`,(status,prevData)=>{
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