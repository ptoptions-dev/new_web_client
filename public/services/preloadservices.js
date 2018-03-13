var WS = {};

function PreLoadServices(socket, callbacks) {
    var quoteService = new WebSocket('ws://138.201.34.110:7701/Implementation/QuotesSocket.ashx?name=allQuotes');

    quoteService.onmessage = function (data) {
        debugger;
    };


    var symbols = [
        "#Bitcoin",
        "#Litecoin",
        "#Ripple",
        "AUDCAD",
        "AUDCHF",
        "AUDCZK",
        "AUDDKK",
        "AUDHKD",
        "AUDHUF",
        "AUDJPY",
        "AUDMXN",
        "AUDNOK",
        "AUDNZD",
        "AUDPLN",
        "AUDSEK",
        "AUDSGD",
        "AUDUSD",
        "AUDZAR",
        "CADCHF",
        "CADCZK",
        "CADDKK",
        "CADHKD",
        "CADHUF",
        "CADJPY",
        "CADMXN",
        "CADNOK",
        "CADPLN",
        "CADSEK",
        "CADZAR",
        "CHFCZK",
        "CHFDKK",
        "CHFHKD",
        "CHFHUF",
        "CHFJPY",
        "CHFMXN",
        "CHFNOK",
        "CHFPLN",
        "CHFSEK",
        "CHFSGD",
        "CHFZAR",
        "CZKJPY",
        "DKKJPY",
        "EURAUD",
        "EURCAD",
        "EURCHF",
        "EURCZK",
        "EURDKK",
        "EURGBP",
        "EURHKD",
        "EURHUF",
        "EURJPY",
        "EURMXN",
        "EURNOK",
        "EURNZD",
        "EURPLN",
        "EURSEK",
        "EURSGD",
        "EURUSD",
        "EURZAR",
        "GBPCAD",
        "GBPCHF",
        "GBPCZK",
        "GBPDKK",
        "GBPHKD",
        "GBPHUF",
        "GBPJPY",
        "GBPMXN",
        "GBPNOK",
        "GBPNZD",
        "GBPPLN",
        "GBPSEK",
        "GBPSGD",
        "GBPUSD",
        "GBPZAR",
        "GOLD",
        "HKDJPY",
        "HUFJPY",
        "MXNJPY",
        "NOKJPY",
        "NZDCAD",
        "NZDCHF",
        "NZDCZK",
        "NZDDKK",
        "NZDHKD",
        "NZDHUF",
        "NZDJPY",
        "NZDMXN",
        "NZDNOK",
        "NZDPLN",
        "NZDSEK",
        "NZDSGD",
        "NZDUSD",
        "NZDZAR",
        "SEKJPY",
        "SGDJPY",
        "SILVER",
        "USDCAD",
        "USDCHF",
        "USDCZK",
        "USDDKK",
        "USDHKD",
        "USDHUF",
        "USDJPY",
        "USDMXN",
        "USDNOK",
        "USDPLN",
        "USDRUR",
        "USDSEK",
        "USDSGD",
        "USDZAR",
        "XAUUSD",
        "ZARJPY"
    ];
    var Quotes = [];
    var type_quotes = 'standard'; // standard | eurica
    QuoteSocket();
    var init = true;



    WS.ServerTime = new _serverTime(callbacks["onservertime"]);

    function _serverTime(callback) {
        var _url = 'ws://138.201.34.110:5758/ServerTimeSocket.ashx?name=test';
        var _socket;
        Reconnect();

        return {

        };

        function Reconnect(data) {
            debugger;
            var _timeout = setTimeout(function () {
                if (_socket) {
                    console.log('Reconnecting ServerTime...');
                }
                _socket = new WebSocket(_url);

                _socket.onmessage = OnMessage;

                _socket.onopen = OnOpen;

                _socket.onclose = OnClose;

                _socket.onerror = OnError;

                clearTimeout(_timeout);
                _timeout = null;
            }, 1000);
        }

        function OnOpen(data) {
            console.log('Opened connection from Server Time Web Socket...');
        }

        function OnClose(data) {
            Reconnect(data);
        }

        function OnError(data) {
            Reconnect(data);
        }

        function OnMessage(data) {
            callback(data.data);
        }
    }

    function QuoteSocket() {
        var socket = io.connect('https://qrtm1.ifxdb.com:8443');

        function SocketResponse(currentQuote) {
            currentQuote.Bid = currentQuote.bid;
            currentQuote.Stamp = new Date(currentQuote.lasttime * 1000);
            currentQuote.Stamp.setHours(currentQuote.Stamp.getHours() - 10);
            if (Quotes.length) {
                for (var x = 0; x < Quotes.length; x++) {
                    if (Quotes[x].symbol == currentQuote.symbol) {
                        Quotes[x] = currentQuote;
                        return;
                    }
                }
            }
            Quotes.push(currentQuote);
        }



        // Connect to server and subscribe quotes
        socket.on('connect', function (data) {
            console.info('connected');
            socket.emit('subscribe', symbols, type_quotes, 6);
        });

        socket.on('quotes6', function (data) {
            SocketResponse(data.msg);
            callbacks['oncurrentquotes'](Quotes);
        });

        socket.on('close', function () {
            console.info('Close connect');
        });

        socket.on('disconnect', function () {
            console.info('Disconnect');
        });

        socket.on('connect_failed', function () {
            console.log(' connect_failed');
        });

        socket.on('reconnect', function () {
            console.log(' reconnect');
        });

        socket.on('reconnecting', function () {
            console.log(' reconnecting');
        });

        socket.on('reconnect_failed', function () {
            console.log(' reconnect_failed');
        })
    }
}