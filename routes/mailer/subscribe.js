const string = require('../constants').string
const id = require('../constants').id
const network = require('../constants').network
const utils = require('../utils')
const values = require('../constants').values
const nodemailer = require('nodemailer')
const db = require('../database')

module.exports={
    sendOtp(user,from,to,callback){
        if(this.validateEmail(user)){
            const otp= this.generateOtp()
            const otpUrl= network.subscribeOtp(user,from,to,otp)
            const message=string.subscribe.otpEmail(otp,otpUrl)
            console.log(message)
            this.sendMailOtp(user,from,to,otp,string.subscribe.requestSubscription,message,callback)
        }else{
            callback(values.status.error,string.someWrong)
        }
    },
    sendMailOtp(user,from,to,otp,subject,message,callback){
        var transporter = nodemailer.createTransport({
            service: values.mailer.server.name,
            auth: {
                user:  values.mailer.server.email,
                pass: values.mailer.server.password
            }
        });
        transporter.sendMail({
        from: values.mailer.server.email,
          to: user,
          subject: subject,
          text: message,
        }).then(()=>{
            db.insert(id.database.collection.otp,id.database.collection.keyList.otp,{
                [id.database.collection.keyList.otp[0]]:this.generateKey(user,from,to),
                [id.database.collection.keyList.otp[1]]:otp,
                [id.database.collection.keyList.otp[2]]:new Date().getTime(),
                [id.database.collection.keyList.otp[3]]:false
            },(status,message)=>{
                console.log(`status:${status}, message:${message}`)
                return callback(values.status.ok,string.subscribe.optSent(user))   
            })
        }).catch((error)=>{
            console.log(error);
            return callback(values.status.error,string.someWrong)
        })
    },
    sendMail(user,subject,message,callback){
        var transporter = nodemailer.createTransport({
            service: values.mailer.server.name,
            auth: {
                user:  values.mailer.server.email,
                pass: values.mailer.server.password
            }
        });
        transporter.sendMail({
        from: values.mailer.server.email,
          to: user,
          subject: subject,
          text: message,
        }).then(()=>{
            if(callback!=undefined){
                callback(values.status.ok,message)    
            }
        }).catch((error)=>{
            console.log(error);
            if(callback!=undefined){
                callback(values.status.error,string.someWrong)
            }
        })
    },

    validateOtp(user,from,to,otp,mailerCallback){
        db.validateOtp(this.generateKey(user,from,to),otp,this.validation,mailerCallback)
    },
    validation(status,callback){
        if(status===id.mailer.subscribe.validationSuccess){
            callback(values.status.ok)
        }else if(status===id.mailer.subscribe.validationError){
            callback(values.status.error)
        }
    },
    validateEmail(email) {
        return re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    saveSubscription(email,from,to){
        db.findOne(id.database.collection.subscribed,{[id.database.email]:utils.base64(email),[id.database.from]:from,[id.database.to]:to,[id.database.isDeleted]:false},(status,item)=>{
            if(status==values.status.error){
                db.insert(id.database.collection.subscribed,id.database.collection.keyList.subscribed,{[id.database.email]:utils.base64(email),[id.database.from]:from,[id.database.to]:to,[id.database.createdAt]:new Date().getTime(),[id.database.isDeleted]:false})
            }
        })
    },

    generateKey(user,from,to){
        user=utils.base64(user)
        return `${user}_${from}_${to}`
    },
    generateOtp(){
        // 10+26 i.e 0-9 + a-z = 36 . random number is in float so remove starting `0.`
        return Math.random().toString(36).slice(2,8)
    },
    isSubscribed(email,from,to,callback){
        db.isSubscribed(utils.base64(email),from,to,callback)
    },
    unSubscribe(email,from,to,callback){
        db.deleteWhere(id.database.collection.subscribed,`${id.database.email}=${utils.base64(email)} and ${id.database.to} = ${to} and ${id.database.isDeleted} = false`,callback)
    },
}
