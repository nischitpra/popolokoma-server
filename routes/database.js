const network = require('./constants').network;
const id = require('./constants').id;
const values = require('./constants').values;
const string = require('./constants').string;
var MongoClient = require('mongodb').MongoClient;


module.exports={
    // updateHistory(key,hist,callback){
    //     MongoClient.connect(network.database,(err, db)=>{
    //         if (err) throw err;
    //         var dbo = db.db(id.database.name);
    //         dbo.collection(id.database.collection.history).update(
    //             {[id.database.cc.id]:key},
    //             {$push:{history: { $each: hist }}},
    //         (err,res)=>{
    //             if (err) {
    //                 callback(values.status.error,string.someWrong)
    //                 throw err;
    //             }else{
    //                 console.log(`${key} ${hist.length} rows pushed`);
    //                 db.close();
    //                 callback(values.status.ok,string.inserted(1))
    //             }
    //         });
    //     })
    // },
    // insertOne(collection,value,callback){
    //     MongoClient.connect(network.database,(err, db)=>{
    //         if (err) throw err;
    //         var dbo = db.db(id.database.name);
    //         dbo.collection(collection).insertOne(value, (err, res)=>{
    //             if (err) {
    //                 callback(values.status.error,string.someWrong)
    //                 throw err;
    //             }else{
    //                 console.log(`1 document inserted`);
    //                 db.close();
    //                 callback(values.status.ok,string.inserted(1))
    //             }
    //         });
    //     })
    // },
    // insertMany(collection,value,callback){
    //     MongoClient.connect(network.database,(err, db)=>{
    //         if (err) throw err;
    //         var dbo = db.db(id.database.name);
    //         dbo.collection(collection).insertMany(value, {ordered:false},(err, res)=>{
    //             if (err) {
    //                 callback(values.status.error,string.someWrong)
    //                 throw err;
    //             }else{
    //                 console.log(`${value.length} document inserted`);
    //                 db.close();
    //                 callback(values.status.ok,string.inserted(value.length))
    //             }
    //         });
    //     })
    // },

    // findOne(collection,query,callback){
    //     MongoClient.connect(network.database,(err, db)=>{
    //         if (err) throw err;
    //         var dbo = db.db(id.database.name);
    //         dbo.collection(collection).findOne(query,(err, result)=>{
    //             if (err) throw err;
    //             if(result!=null){
    //                 callback(values.status.ok,result)
    //             }else{
    //                 callback(values.status.error,result)
    //             }
    //             db.close();
    //         });
    //     });
    // },
    // findMany(collection,query,callback){
    //     MongoClient.connect(network.database,(err, db)=>{
    //         if (err) throw err;
    //         var dbo = db.db(id.database.name);
    //         dbo.collection(collection).find(query).toArray((err, result)=>{
    //             if (err){
    //                 callback(values.status.error,string.someWrong)
    //                 throw err;
    //             }
    //             callback(values.status.ok,result)
    //             db.close();
    //         });
    //     });
    // },
    // findManySorted(collection,query,sortQuery,callback){
    //     MongoClient.connect(network.database,(err, db)=>{
    //         if (err) throw err;
    //         var dbo = db.db(id.database.name);
    //         dbo.collection(collection).find(query).sort(sortQuery).toArray((err, result)=>{
    //             if (err){
    //                 callback(values.status.error,string.someWrong)
    //                 throw err;
    //             }

    //             console.log(`db.${collection}.find(${JSON.stringify(query)}).sort(${JSON.stringify(sortQuery)})`)
    //             callback(values.status.ok,result)
    //             db.close();
    //         });
    //     });
    // },
    // findManyLimited(collection,query,sortQuery,_limit,callback){
    //     MongoClient.connect(network.database,(err, db)=>{
    //         if (err) throw err;
    //         var dbo = db.db(id.database.name);
    //         dbo.collection(collection).find(query).sort(sortQuery).limit(_limit).toArray((err, result)=>{
    //             if (err){
    //                 callback(values.status.error,string.someWrong)
    //                 throw err;
    //             }
    //             callback(values.status.ok,result)
    //             db.close();
    //         });
    //     });
    // },
    // dropCollection(collection){
    //     MongoClient.connect(network.database, (err, db)=>{
    //         if (err) throw err;
    //         var dbo = db.db(id.database.name);
    //         dbo.collection(collection).drop((err, delOK)=>{
    //             if (err) throw err;
    //             if (delOK) console.log("Collection deleted");
    //             db.close();
    //         });
    //     });
    // },








    // for subscribe
    validateOtp(collection,key,otp,callback,mailerCallback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).findOne({[key]:otp},(err, result)=>{
                if (err) throw err;
                console.log(result)
                if(result!=null&& !result.isDeleted){
                    this.delete(id.database.collection.otp,{[key]:otp},undefined)
                    callback(id.mailer.subscribe.validationSuccess,mailerCallback)
                }else{
                    callback(id.mailer.subscribe.validationError,mailerCallback)
                }
                db.close();
            });
        });
    },
    delete(collection,query,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(collection).updateOne(query,{$set:{[id.database.isDeleted]:true}},(err, result)=>{
                if (err) throw err;
                console.log(result)
                if(callback!=undefined){
                    callback(values.status.ok,string.subscribe.unsubscribed)
                }
                db.close();
            });
        });
    },
    isSubscribed(email,from,to,mailerCallback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(id.database.collection.subscribed).findOne({[id.database.email]:email,[id.database.from]:from,[id.database.to]:to,[id.database.isDeleted]:false},(err, result)=>{
                if (err) throw err;
                console.log(result)
                if(result!=null && !result.isDeleted){
                    mailerCallback(values.status.ok,true)
                }else{
                    mailerCallback(values.status.ok,false)
                }
                db.close();
            });
        });
    },
    getGoodBadTweets(callback){
        this.find('select * from good_bad_tweets inner join tweets order by _id desc',callback)

        // MongoClient.connect(network.database,(err, db)=>{
        //     if (err) throw err;
        //     var dbo = db.db(id.database.name);
        //     dbo.collection(id.database.collection.goodBadTweets).aggregate([
        //         {$lookup:{from: id.database.collection.tweets,localField: id.twitter.tweet.id,foreignField: id.twitter.tweet.id,as: id.twitter.tweet.tweet}}
        //     ]).toArray((err, result)=>{
        //         if (err){
        //             callback(values.status.error,string.someWrong)
        //             throw err;
        //         }
        //         callback(values.status.ok,result)
        //         db.close();
        //     });
        // });
    },
    getGoodBadTweetsFew(count,callback){
        this.find(`select * from good_bad_tweets inner join tweets order by _id desc limit ${count}`,callback)
        // MongoClient.connect(network.database,(err, db)=>{
        //     if (err) throw err;
        //     var dbo = db.db(id.database.name);
        //     dbo.collection(id.database.collection.goodBadTweets).aggregate([
        //             {$lookup:{
        //                 from: id.database.collection.tweets,
        //                 localField: id.twitter.tweet.id,
        //                 foreignField: id.twitter.tweet.id,
        //                 as: id.twitter.tweet.tweet,
        //             }},
        //             {$sort:{[id.twitter.tweet.timestamp]: -1}},
        //             {$limit:count}, 
        //     ]).toArray((err, result)=>{
        //         if (err){
        //             callback(values.status.error,string.someWrong)
        //             throw err;
        //         }
        //         callback(values.status.ok,result)
        //         db.close();
        //     });
        // });
    },

    getHistoryStartTime(key,callback){
        MongoClient.connect(network.database,(err, db)=>{
            if (err) throw err;
            var dbo = db.db(id.database.name);
            dbo.collection(id.database.collection.history).aggregate([
                {$match:{[id.database.cc.id]:key}},
                {$unwind:`$${id.database.cc.history}`},
                {$sort:{[`${id.database.cc.history}.${id.database.cc.time}`]:1}},
                {$limit:1}
            ]).toArray((err, result)=>{
                if (err){
                    callback(values.status.error,string.someWrong)
                    throw err;
                }
                const his=result[id.database.cc.history]
                if(his==undefined){
                    callback(values.status.error,-1)
                }else{
                    callback(values.status.ok,his[id.database.cc.time])
                }
                db.close();
            });
        });
    },

    createCandleStickTable(name,callback){
        const pg = require('pg');
        const client = new pg.Client(network.database);
        client.connect();
        const query = client.query(
        `create table if not exists ${name} (
            _id char(13), 
            open varchar(13), 
            high varchar(13), 
            low varchar(13), 
            close varchar(13), 
            volume varchar(15), 
            close_time varchar(13), 
            quote_asset_volume varchar(13), 
            number_of_trades varchar(10), 
            taker_buy_base_asset_volume varchar(13), 
            taker_buy_quote_asset_volume varchar(13), 
            primary key(_id)
        ) ;`)
        query.on('end', () => { 
            client.end()
            return callback(values.status.ok,string.database.create.table(name))
        })
    },
    createGoodbadTable(callback){
        const pg = require('pg');
        const client = new pg.Client(network.database);
        client.connect();
        const query = client.query(
        `create table if not exists ${id.database.collection.goodBadTweets} (
            _id varchar(24),
            category char(1),
            probability varchar(8),
            timestamp varchar(13),
            primary key(_id)
        );`)
        query.on('end', () => { 
            client.end()
            return callback(values.status.ok,string.database.create.table(id.database.collection.goodBadTweets))
        })
    },
    createSentimentTrendTable(callback){
        const pg = require('pg');
        const client = new pg.Client(network.database);
        client.connect();
        const query = client.query(
        `create table if not exists ${id.database.collection.sentimentTrend} (
            _id varchar(24),
            close varchar(13),
            high varchar(13),
            low varchar(13),
            open varchar(13),
            time varchar(13),
            primary key(_id)
        ) ;`)
        query.on('end', () => { 
            client.end()
            return callback(values.status.ok,string.database.create.table(id.database.collection.sentimentTrend))
        })
    },
    createTweetsTable(callback){
        const pg = require('pg');
        const client = new pg.Client(network.database);
        client.connect();
        const query = client.query(
        `create table if not exists ${id.database.collection.tweets} (
            _id SERIAL PRIMARY KEY,
            created_at char(32),
            id_str varchar(20),
            text text,
            name varchar(120),
            screen_name varchar(120),
            profile_image_url text,
            timestamp_ms varchar(13)
        );`)
        query.on('end', () => { 
            client.end()
            return callback(values.status.ok,string.database.create.table(id.database.collection.tweets))
        })
    },

    insert(tableName,keys,_values,callback){
        const pg = require('pg');
        const client = new pg.Client(network.database);
        client.connect();
        
        var columnName=``
        for(var i in keys){
            columnName+=`${keys[i]},`
        }
        columnName=columnName.substring(0,columnName.length-1)// remove last comma
        columnName=`(${columnName})`


        var valueString=``
        for(var j in _values){
            var insertString=``
            for(var i in keys){
                insertString+=`'${_values[j][keys[i]]}',`
            }
            insertString=insertString.substring(0,insertString.length-1)// remove last comma
            insertString=`(${insertString}),`
            valueString+=insertString
        }
        valueString=valueString.substring(0,valueString.length-1) // remove last comma

        const finalQ=`insert into ${tableName} ${columnName} values ${valueString};`
        console.log(finalQ)


        const query = client.query(finalQ)
        query.on('end', () => { 
            client.end()
            return callback(values.status.ok,string.database.insert.values(_values.length))
        })
    },
    find(_query,callback){
        const pg = require('pg');
        const client = new pg.Client(network.database);
        client.connect();
        const query = client.query(_query)
        const result=[]
        query.on('row', (row) => { 
            result.push(row)
        })
        query.on('end', () => { 
            client.end()
            return callback(values.status.ok,result)
        })
    },

}