const db = require('../database')
const connection = require('../connection')
const presenter = require('./presenter')
const id = require('../constants').id
const values = require('../constants').values
const string = require('../constants').string
const pythoninvoker=require('../../routes/pythoninvoker')

module.exports={
    insertHistory(type,from,to,exchange,toTime,callback){
        presenter.getHistory(type,from,to,exchange,null,toTime,(status,data)=>{
                if(status==values.status.ok){
                    var notMore=data[data.length-1][id.cryptocompare.close]==0 &&  data[data.length-1][id.cryptocompare.open]==0 &&  data[data.length-1][id.cryptocompare.high]==0 &&  data[data.length-1][id.cryptocompare.low]==0
                    if(notMore){
                        callback(values.status.error,'no more data in cc')
                        return
                    } 
                    db.insertMany(id.database.cc.history_from_to_type(from,to,type),data,(status,message)=>{
                        console.log(message)
                        notMore=data[data.length-1][id.cryptocompare.close]==0 &&  data[data.length-1][id.cryptocompare.open]==0 &&  data[data.length-1][id.cryptocompare.high]==0 &&  data[data.length-1][id.cryptocompare.low]==0
                        
                        
                        if(notMore){
                            callback(status,`${message} start time: ${data[0][id.database.cc.time]} no more data exists!!`)
                        }else{
                            callback(status,message+' start time: '+data[0][id.database.cc.time] )
                        }
                    })
                }else{
                    callback(status,data)
                }
                
            }
        )
    },
    
}