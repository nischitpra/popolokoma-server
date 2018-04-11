module.exports = {
    network:{
        news:(type,count,page)=>`https://newsapi.org/v2/${type}?sources=crypto-coins-news&pageSize=${count}&page=${page}`,
        history:(historyType,from,to,exchange,toTime)=>`https://min-api.cryptocompare.com/data/${historyType}?fsym=${from}&tsym=${to}&e=${exchange}&limit=${2000}&toTs=${toTime}`,
        favourites:(fromList,toList,exchange)=>`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${fromList}&tsyms=${toList}&e=${exchange}`,
        coinList:`https://min-api.cryptocompare.com/data/all/coinlist`,
        socketSubsList:(from,to)=>`https://min-api.cryptocompare.com/data/subs?fsym=${from}&tsyms=${to}`,
        cryptocompareWebSocket:`https://streamer.cryptocompare.com/`,
        searchTweet:(name,symbol)=>`https://api.twitter.com/1.1/search/tweets.json?q=${name}%20${symbol}%20crypto%blockchain&result_type=mixed`,
        
        subscribeOtp:(email,from,to,otp)=>`http://localhost:3001/mailer/subscribe/validate?email=${email}&from=${from}&to=${to}&otp=${otp}`,
        database:`mongodb://heroku_w06gvgdc:39i4hl2t7g5fqejfb07jbb9gf4@ds241059.mlab.com:41059/heroku_w06gvgdc`,
    },
    files:{
        python:{
            compiler:'python3.6',
            sentimentTrend:`pythonscript/sentiment_trend.py`,
            filterTweet:`pythonscript/filter_tweet.py`,
            goodBadTweet:`pythonscript/good_bad_tweet.py`,
            forecaster:`pythonscript/forecaster/model.py`,
        },
        buildPath:(pathFromBin)=>`/app/routes/bin/${pathFromBin}`,
    },

    values:{
        baseHeader:{
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:57.0) Gecko/20100101 Firefox/57.0",
            "Accept": 'application/json',
        },
        news:{
            apiKey:'d2a968870c6c41e0b2f172bad1c2ef10',
            everything:'everything',
            headlines:'top-headlines',
            articles:'articles',
        },
        twitter:{
            consumerKey: 'q3RPMgFxS26kHOUfSl2qOCt3w',
            consumerSecret: 'XfGCLJZFJmDBCEvF0RjlRmd592TS9jWXgXFi6PpddcxCXqEOG5',
            accessTokenKey: '941802374707822592-kLwiBWC7k6Bdqu2Gg5NkFymyKtOJbfU',
            accessTokenSecret: '7HTsCnI7M3IJeb4wkWomngCYQb6AHwyoSilvhLD3kXywH',
        },
        status:{
            ok:'ok',
            error:'error',
        },
        mailer:{
            server:{name:'Gmail',email:'popolokoma@gmail.com',password:'weRock123'},
        }

    },
    id:{
        params:{ count:'count', from:'f',to:'t',coinName:'coinName',type:'type',exchange:'e',toTime:'tt',fromTime:'ft' },
        application:{db:'db'},
        database:{
            name:'heroku_w06gvgdc',
            collection:{
                otp:'otp',
                subscribed:'subscribed',
                tweets:'tweets',
                goodBadTweets:'good_bad_tweets',
                sentimentTrend:'sentiment_trend',
                history:'history',
                forecast:'forecast',
            },
            email:'email',
            from:'from',
            to:'to',
            createdAt:'createdAt',
            isDeleted:'isDeleted',
            cc:{
                id:'_id',
                history:'history',
                time:'time',
                history_from_to_type:(from,to,type)=>`${from}_${to}_${type}`,
            
            },
        },
        news:{everything:0,headlines:1,articles:'articles'},
        cryptocompare:{
            history:{0:'histominute',1:'histohour',2:'histoday'},
            from:'from',
            to:'to',
            exchange:'exchange',
            historyType:'historyType',
            fromTime:'fromTime',
            toTime:'toTime',
            raw:'RAW',
            data:'Data',
            baseImageUrl:'BaseImageUrl',
            trades:'TRADES',
            clientEvent:'clientEvent',
            serverEvent:'serverEvent',
            close:'close',
            high:'high',
            low:'low',
            open:'open',
            trendData:'trendData',
            pairHistoryType:'pairHistoryType',
            datasetType:'datasetType',
            params:{
                start:'start',
                end:'end',
            },
        },
        twitter:{
            symbol:'symbol',
            statuses:'statuses',
            coinName:'coinName',
            tweet:{
                tweet:'tweet',
                text:'text',
                id:'_id',
                index:'index',
                timestamp:'timestamp',
                createdAt:'created_at',
                category:'category',
            },
        },
        mailer:{
            email:'email',
            from:'from',
            to:'to',
            otp:'otp',
            subscribe:{
                key:'key',
                otp:'otp',
                createdAt:'createdAt',
                validationSuccess:true,
                validationError:false,
            },
        },
    },
    string:{
        subscribe:{
            optSent:(email)=>`Otp has been sent to ${email}`,
            otpEmail:(otp,url)=>`Your OTP is ${otp}. You can enter the otp or simply click on the following link to subscribe \n\n\n${url}`,
            subscribedMessage:(from,to)=>`You have just subscribed to email alerts for ${from}:${to} trend changes`,
            subscribed:(from,to)=>`You have been subscribed`,
            requestSubscriptionBody:(otp)=>`Your OTP for subscription is: ${otp}`,
            unsubscribed:`You have been unsubscribed`,
            unsubscribedMessage:(from,to)=>`You have unsubscribed email alerts for ${from}:${to}`,
            requestSubscription:`Verification for subscription`,
            
        },
        database:{
            insert:{
                emptyList:`Trying to insert empty list.`
            }
        },
        invalidRequest:'Invalid Request',
        someWrong:'Woops, something went wrong!',
        tweets:{
            updated:(count)=>`${count} tweets downloaded`,
        },
        inserted:(count)=>`${count} items added!`,
        functionLocked:`Function Locked! An instance of the function is already running.`,
        feature_comming_soon:`Feature comming soon`,
    },
}

