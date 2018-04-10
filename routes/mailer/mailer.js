var express = require('express');
var router = express.Router();
const subscriber=require('./subscribe')
const string = require('../constants').string
const id = require('../constants').id
const utils = require('../utils')
const values = require('../constants').values

router.get('/subscribe',(req,res,next)=>{
    const email=req.query[id.mailer.email]
    const from=req.query[id.mailer.from]
    const to=req.query[id.mailer.to]
    subscriber.sendOtp(email,from,to,(status,message)=>{
        res.json({
            status:status,
            message:message
        })
    })
})
router.get('/subscribe/validate',(req,res,next)=>{
    const email=req.query[id.mailer.email]
    const from=req.query[id.mailer.from]
    const to=req.query[id.mailer.to]
    const otp=req.query[id.mailer.otp]

    subscriber.validateOtp(email,from,to,otp,(status)=>{
        var message=''
        if(status===values.status.error){
            message=string.someWrong
        }else{
            message=string.subscribe.subscribedMessage(from,to)
            subscriber.sendMail(email,string.subscribe.subscribed(from,to),message)
            subscriber.saveSubscription(email,from,to)
        }
        res.json({
            status:values.status.ok,
            message:message,
        })
    })
})

router.get('/subscribe/subscribed',(req,res,next)=>{
    const email=req.query[id.mailer.email]
    const from=req.query[id.mailer.from]
    const to=req.query[id.mailer.to]
    subscriber.isSubscribed(email,from,to,(status,message)=>{
        res.json({
            status:status,
            message:message
        })
    })
})

router.get('/subscribe/unsubscribe',(req,res,next)=>{
    const email=req.query[id.mailer.email]
    const from=req.query[id.mailer.from]
    const to=req.query[id.mailer.to]
    subscriber.unSubscribe(email,from,to,(status,message)=>{
        subscriber.sendMail(email,string.subscribe.unsubscribed,string.subscribe.unsubscribedMessage(from,to),undefined)
        res.json({
            status:status,
            message:message
        })
    })
})






module.exports=router