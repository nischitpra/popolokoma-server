module.exports = {
    network:{
        news:(type,count,page)=>`https://newsapi.org/v2/${type}?sources=crypto-coins-news&pageSize=${count}&page=${page}`,
        history:(historyType,from,to,exchange,toTime)=>`https://min-api.cryptocompare.com/data/${historyType}?fsym=${from}&tsym=${to}&e=${exchange}&limit=${2000}&toTs=${toTime}`,
        favourites:(fromList,toList,exchange)=>`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${fromList}&tsyms=${toList}&e=${exchange}`,
        coinList:`https://min-api.cryptocompare.com/data/all/coinlist`,
        socketSubsList:(from,to)=>`https://min-api.cryptocompare.com/data/subs?fsym=${from}&tsyms=${to}`,
        cryptocompareWebSocket:`https://streamer.cryptocompare.com/`,
        searchTweet:(name,symbol)=>`https://api.twitter.com/1.1/search/tweets.json?q=${name}%20${symbol}%20crypto%blockchain&result_type=mixed`,
        
        binance:{
            ticker24h:(from,to)=>`https://api.binance.com/api/v1/ticker/24hr?symbol=${from}${to}`,
            ticker24hAll:`https://api.binance.com/api/v1/ticker/24hr`,
            candleStick:(from,to,interval,fromTime,toTime)=>`https://api.binance.com/api/v1/klines?symbol=${from}${to}&interval=${interval}&startTime=${fromTime}&endTime=${toTime}`,

        },

        subscribeOtp:(email,from,to,otp)=>`http://localhost:3001/mailer/subscribe/validate?email=${email}&from=${from}&to=${to}&otp=${otp}`,
        // database:`mongodb://localhost:27017/`,
        database:`postgres://popo:weareawesome@popo-server.ckhrqovrxtw4.us-east-1.rds.amazonaws.com:5432/coins`,
    },
    files:{
        python:{
            compiler:'python3.6',
            sentimentTrend:`pythonscript/sentiment_trend.py`,
            filterTweet:`pythonscript/filter_tweet.py`,
            goodBadTweet:`pythonscript/good_bad_tweet.py`,
            forecaster:`pythonscript/forecaster/model.py`,
            binance:{
                candlestick:`pythonscript/binance/candlestick.py`
            },
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
            server:{name:'Gmail',email:'nischitpra@gmail.com',password:'Applebob123'},
        },
        binance:{
            candle_interval:{   
                _1m:'1m', //minute
                _3m:'3m',
                _5m:'5m',
                _15m:'15m',
                _30m:'30m',
                _1h:'1h',  //hour
                _2h:'2h',
                _4h:'4h',
                _6h:'6h',
                _8h:'8h',
                _12h:'12h',
                _1d:'1d', //day
                _3d:'3d',
                _1w:'1w',
                _1M:'1M', //month
            }, candle_interval_milliseconds:{   
                _1m:1000*60*1, //minute
                _3m:1000*60*3,
                _5m:1000*60*5,
                _15m:1000*60*15,
                _30m:1000*60*30,
                _1h:1000*60*60*1,  //hour
                _2h:1000*60*60*2,
                _4h:1000*60*60*4,
                _6h:1000*60*60*6,
                _8h:1000*60*60*8,
                _12h:1000*60*60*12,
                _1d:1000*60*60*24*1, //day
                _3d:1000*60*60*24*3,
                _1w:1000*60*60*24*7, //week
                _1M:1000*60*60*24*30, //month
            }
        },
    },
    id:{
        params:{ 
            count:'count', 
            from:'f',
            to:'t',
            coinName:'coinName',
            type:'type',
            exchange:'e',
            toTime:'tt',
            fromTime:'ft',
            isNew:'n'
        },
        binance:{
            id:'_id',
            open:'open',
            high:'high',
            low:'low',
            close:'close',
            volume:'volume',
            close_time:'close_time',
            quote_asset_volume:'quote_asset_volume',
            number_of_trades:'number_of_trades',
            taker_buy_base_asset_volume:'taker_buy_base_asset_volume',
            taker_buy_quote_asset_volume:'taker_buy_quote_asset_volume',
        },
        application:{db:'db'},
        database:{
            name:'coins',
            collection:{
                otp:'otp',
                subscribed:'subscribed',
                tweets:'tweets',
                goodBadTweets:'good_bad_tweets',
                sentimentTrend:'sentiment_trend',
                history:'history',
                forecast:'forecast',
                dump:{
                    candlestick:'candlestick_dump'
                },
                keyList:{
                    history:['_id','open','high','low','close','volume','close_time','quote_asset_volume','number_of_trades','taker_buy_base_asset_volume','taker_buy_quote_asset_volume'],
                    goodBadTweets:['_id','category','probability','timestamp'],
                    sentimentTrend:['_id','close','high','low','open','time'],
                    // tweets:['_id','created_at','id_str','text','name','screen_name','profile_image_url','timestamp_ms'],
                    tweets:['created_at','id_str','text','name','screen_name','profile_image_url','timestamp_ms'],
                },
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
                emptyList:`Trying to insert empty list.`,
                values:(count)=>`${count} rows added`,
            },
            create:{
                table:(name)=>`${name} table has been created/initialized`,
            }
        },
        invalidRequest:'Invalid Request',
        someWrong:'Woops, something went wrong!',
        tweets:{
            updated:(count)=>`${count} tweets downloaded`,
        },
        inserted:(count)=>`${count} items added!`,
        functionLocked:`Function Locked! An instance of the function is already running.`,
        
    },
}

