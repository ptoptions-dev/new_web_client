function dirTrade($rootscope, ptodata, common) {
    function lnkTrade($scope, elem, attrs, ctrls) {

        $scope.AmountActions = function (args) {
            // debugger;
            var val = $scope.Amount;
            switch (args) {
                case "-":
                $scope.Amount = Number(val) - 1;
                validateAmount();
                //   if ($scope.Amount > 1) $scope.Amount = Number($scope.Amount) - 1;
                //   else alert("Reached the limit bet amount");
                // }
                
                break;
              case "+":
                $scope.Amount = Number(val) + 1;
                //   if (val > 1000) alert("Reached the limit bet amount");
                validateAmount();
                //   $scope.Amount = val < 1000 ? val : 1000;
      
                break;
                case 1:
                case 2:
                case 5:
                case 10:
                case 15:
                case 19:
                case 20:
                    $scope.Amount = args;
                    break;
                default:
                     //jestoni
          // var val = Number(this.Amount.replace(/[^0-9]+/g, ''));
          // $scope.Amount = val == 0 ? 1 : val < 1000 ? val : 1000;
          // var val = this.Amount.replace(/[^0-9.]+/g, '').replace(/(\..*)\./g, '');

          //marlo
          // var val = this.Amount.match(/\d{0,4}(\.\d{0,2})?/)[0];
          // $scope.Amount = val < 1 ? 1 : val <= 1000 ? val : 1000;

          myFunc();
          break;
            }
            $scope.Profit = $scope.Amount * ($scope.Percentage / 100);
        };

        function validateAmount() {
            var val = $scope.Amount;
            if (val < 1) {
              val = 1;
              $('.uk-icon-minus').css("pointer-events", "none")
              $scope.$emit(common.msg.invalid_auth, {
                  Status: "invalid",
                  pos: "top-center",
                  
                  Message: "You have reached the minimum bet amount lower than $1.00"
              });
             
              // alert("You have reached the minimum bet amount lower than $1.00");
            } else if (val <= 1000) {
              val = val;
              $('.uk-icon-plus').css("pointer-events", "all")
              $('.uk-icon-minus').css("pointer-events", "all")
            } else {
              val = 1000;
              $('.uk-icon-plus').css("pointer-events", "none")
              $scope.$emit(common.msg.invalid_auth, {
                  Status: "invalid",
                  pos: "top-center",
                  Message: "You have reached the maximum bet amount higher than $1000.00"
              });
              // alert("You have reached the maximum bet amount higher than $1000.00");
            }
            $scope.Amount = val;
          }
      
          function myFunc(e) {
            var txt = document.getElementById("amtDiv");
            txt.addEventListener("keyup", myFunc);
      
            var val = this.value;
            var re = /^([0-9]+[\.]?[0-9]?[0-9]?|[0-9]+)$/g;
            var re1 = /^([0-9]+[\.]?[0-9]?[0-9]?|[0-9]+)/g;
            if (re.test(val)) {
              //do something here
              validateAmount();
            } else {
              val = re1.exec(val);
              if (val) {
                this.value = val[0];
              } else {
                this.value = "";
              }
            }
          }

        $scope.TimeActions = function (args) {
            switch (args) {
                case "-":
                    if ($scope.SlctdIndexTime > 0) $scope.SlctdIndexTime -= 1;
                    break;
                case "+":
                    if ($scope.SlctdIndexTime < 4) $scope.SlctdIndexTime += 1;
                    break;
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    $scope.SlctdIndexTime = args;
                    break;
            }
            $scope.SlctdExprTime = $scope.ExpirationTime[$scope.SlctdIndexTime].ExpiryTime.string;
            $scope.$parent.ChartDisplaySettings.ExpirationSettings.SelectedIndex = $scope.SlctdIndexTime;
        }


    }

    function cntrTrade($scope) {
        $scope.Symbol = $scope.$parent.ChartDisplaySettings.Symbol;
        $scope.ExpirationTime = [{
            ExpiryTime: {
                string: "00:00"
            },
            RemainingTime: {
                string: "00:00"
            }
        }];

        $scope.Percentage = 60;
        $scope.ProfitStatus = true ? "+" : "-";
        $scope.bndProfit = $scope.ProfitStatus + "$" + $scope.Percentage;
        $scope.TimeFrame = "15M";
        $scope.SlctdExprTime = "00:00";
        $scope.SlctdIndexTime = 0;
        $scope.AmountOptions = [1, 2, 5, 10, 15, 19, 20];
        $scope.Amount = $scope.AmountOptions[0];
        $scope.Profit = $scope.Amount * ($scope.Percentage / 100);



        $scope.$watch(function () {
            return ptodata;
        }, function (o) {
            $scope.Percentage = o.SymbolDetails[$scope.$parent.ChartDisplaySettings.Symbol].FastPercentageValue;
            $scope.Profit = $scope.Amount * ($scope.Percentage / 100);
        }, true);
        //events

        $scope.$parent.ChartDisplaySettings.OptionService.Callback = function (result) {
            // debugger;
            if (!result["Status"]) $rootscope.$emit(common.msg.trns_ntfy, result);
            else $scope.$parent.ChartDisplaySettings.ExpirationSettings.hasOpenOptions = true;
        };

        $scope.UpDownTrade = function (type) {
            if (type == 2) {
                if ($scope.$parent.ChartDisplaySettings.ExpirationSettings.isExpired == false) {
                    $.UIkit.offcanvas.show('#st-add-asset');
                    $("#assetLabel").text("New Asset");
                } else {
                    $scope.$parent.ChartDisplaySettings.ExpirationSettings.isExpired = false;
                    $scope.$parent.ChartDisplaySettings.ExpirationSettings.hasOpenOptions = false;
                    if (typeof $scope.$parent.ChartDisplaySettings.OnNewOptionBtn != "function") return;
                    $scope.$parent.ChartDisplaySettings.OnNewOptionBtn();
                }
            } else {
                var transtype = type;
                var transdata = {
                    Symbol: $scope.Symbol,
                    TransactionType: transtype,
                    Amount: $scope.Amount,
                    Percent: $scope.Percentage,
                    StartTicks: String(ptodata.CurrentTime.getTime()),
                    EndTicks: String($scope.ExpirationTime[$scope.SlctdIndexTime].ExpiryTime.tick),
                    AccountType: $rootscope.AccountType
                };                                      
                // $scope.$parent.ChartDisplaySettings.ExpirationSettings.hasOpenOptions = true;
                // debugger;
                console.log(transdata.EndTicks);
                // $scope.$parent.ChartDisplaySettings.OptionService.Request(transdata);
                $scope.$emit(common.msg.up_down_trade, transdata);
            }
        }

        $scope.OnhoverBtn = function (type) {
            if (typeof $scope.$parent.ChartDisplaySettings.OnButtonHover != "function") return;
            $scope.$parent.ChartDisplaySettings.OnButtonHover(parseInt(type));
        }

        $scope.OnUnHover = function () {
            if (typeof $scope.$parent.ChartDisplaySettings.OnUnHover != "function") return;
            $scope.$parent.ChartDisplaySettings.OnUnHover();
        }
        //listener
        $scope.SubscribeToExp = function (data) {
            $scope.ExpirationTime = data.ExpirationTime;
            var _slctd = data.ExpirationTime[$scope.SlctdIndexTime];
            $scope.SlctdExprTime = _slctd.ExpiryTime.string;
            // $scope.$apply();
            if (_slctd.RemainingTime.tick > 0 && _slctd.hasOpenOptions) {
                $scope.$parent.ChartDisplaySettings.ShowActiveLabels = true;
            } else {
                $scope.$parent.ChartDisplaySettings.ShowActiveLabels = false;
            }
            if (_slctd.RemainingTime.InSecond <= 5 || ((_slctd.PurchaseTime.InSecond >= 0 && _slctd.PurchaseTime.InSecond <= 5) && _slctd.hasOpenOptions == true)) {
                $scope.$parent.ChartDisplaySettings.isExpiring = true;
            } else {
                $scope.$parent.ChartDisplaySettings.isExpiring = false;
            }
            if (_slctd.PurchaseTime.InSecond < 0 && _slctd.hasOpenOptions) {
                $scope.hasOption = true;
                $scope.$parent.ChartDisplaySettings.PurchaseTime = _slctd.RemainingTime.string;
                $scope.$parent.ChartDisplaySettings.isPurchaseTimeExceed = true;
            } else {
                $scope.hasOption = false;
                $scope.$parent.ChartDisplaySettings.PurchaseTime = _slctd.PurchaseTime.string;
                $scope.$parent.ChartDisplaySettings.isPurchaseTimeExceed = false;
            }
        }
        var ChangeSymbol = function (symbol) {
            $scope.Symbol = symbol;
        }
        $scope.ChangeSymbol = ChangeSymbol;
        $scope.$parent.TradePanel = $scope;
    }
    return {
        restrict: "EA",
        templateUrl: 'view/trade.html',
        link: lnkTrade,
        scope: {
            settings: '='
        },
        replace: true,
        controller: cntrTrade
    }
}
mainApp.directive("dirTrade", ['$rootScope', 'ptodata', 'common', dirTrade]);

var dirNotify = function (ptodata, $rootScope, common) {
    var ctrllr = function ($scope) {
        var notifydata = function (name, args) {
            var icns = args.TransactionType == "Up" ? '<i class="st-fonticon-trade-call"></i>' : '<i class="st-fonticon-trade-put"></i> '            

            // var message = args.TransactionType == "UP" ? '<i class="st-fonticon-trade-call"></i>' : '<i class="st-fonticon-trade-put"></i> ';;
            switch (args.Status) {
                case 'COMPLETE':
                case 'PENDING':
                    // debugger;
                    $rootScope.$broadcast(common.msg.nw_opt, args);
                    break;
                case 'True':
                    message = args.Message
                    notification({
                        message: message = '\n' +
                        '<div  style="display: inline-flex">' +
                            '<span class="st-notify-font" style="font-size: 30px !important; ">' + icns + '</span>' +
                            '<div style="display: block" >' +
                                '<h5 class="st-notify-font">' + args.Message + '</h5>' +
                                '<div>'+
                                    '<h5 class="st-notify-font">' + args.OptionData.symbol +'</h5>'+
                                '</div>'+
                                
                            '</div>'+
                        '</div>' 
                    });                          
                    if (args.Status){
                        // $scope.ChartPanel.ChartManager.OnNewOption(newOpen);
                        // $scope.$parent.ChartDisplaySettings
                        // args.OptionData.openTime = Number(args.OptionData.openTime) * 1000;
                        // args.OptionData.closeTime = Number(args.OptionData.closeTime) * 1000;
                        $rootScope.$broadcast(common.msg.nw_opt, args);
                    }
                    break;
                case 'False':
                    message = args.Message
                    notification({
                        message: message
                    });
                    break;
                case false:
                    message = args.Message
                    notification({
                        message: message
                    });
                    break;
                case 'success':
                    message = '\n' +
                        '<div  style="display: inline-flex">' +
                            '<span class="st-notify-font" style="font-size: 30px !important; ">' + icns + '</span>' +
                            '<div style="display: block" >' +
                                '<h5 class="st-notify-font">Transaction Successful</h5>' +
                                '<div>'+
                                    '<h5 class="st-notify-font">' + args.OptionData.symbol +'</h5>'+
                                '</div>'+
                                
                            '</div>'+
                        '</div>'


                    // '<span><h4 class="st-notify-font">'+ icns + "EURUSD" + '</h4></span>' + '<span>' + "$1" +'</span>'  
                    // '<div class="uk-grid uk-grid-small uk-grid-width-1-2 st-notify-details">' +

                    // '<span ">Transaction ID: ' + '</span>' + '<span class="uk-text-right">' + 1150 + '</span>' + '\n' + '<br>' +
                    // '<span ">Amount: ' + '</span>' + '<span class="uk-text-right">' + "$1" + '</span>' + '\n' + '<br>' +
                    // '<span ">Level: ' + '</span>' + '<span class="uk-text-right">' + "1.6354" + '</span>' + '\n' + '<br>' +
                    // '<span ">Expiration: ' + '</span>' + '<span class="uk-text-right">' + "26-Oct 12:00:00" + '</span>' + '</span>' + '\n' +

                    // '</div'

                    ;

                    // '<div class="uk-grid uk-grid-small uk-grid-width-1-2 st-notify-details">' +
                    // '<span ">Transaction ID: ' + '</span>' + '<span class="uk-text-right">' + args.Detail.TransactionId + '</span>' + '\n' + '<br>' +
                    // '<span ">Amount: ' + '</span>' + '<span class="uk-text-right">' + args.Detail.Amount + '</span>' + '\n' + '<br>' +
                    // '<span ">Level: ' + '</span>' + '<span class="uk-text-right">' + args.Detail.StartQuote + '</span>' + '\n' + '<br>' +
                    // '<span ">Expiration: ' + '</span>' + '<span class="uk-text-right">' + FormatTime(args.Detail.EndStamp, 'd-m-hh-mm-ss') + '</span>' + '</span>' + '\n' +

                    notification({
                        message: message,
                        // timeout: 0
                    });
                    break;
                case 'close':
                    // debugger;
                message = '\n' +
                '<div  style="display: inline-flex">' +
                    '<span class="st-notify-font" style="font-size: 30px !important; ">' + icns + '</span>' +
                    '<div style="display: block" >' +
                        '<h5 class="st-notify-font">Transaction Closed</h5>' +
                        '<div>'+
                            '<h5 class="st-notify-font">' + args.Detail.Symbol +'</h5>'+
                            '<h5 class="st-notify-font">' + args.Detail.ProfitStatus +'</h5>'+
                        '</div>'+
                        
                    '</div>'+
                '</div>';





                    // message += '\n' + '<h4 class="st-notify-font">Transaction Closed</h4>' + '\n' +
                    //     '<h2 class="st-notify-font st-notify-symbol">' + args.Detail.Symbol + '</h2>' + '\n' + '<br>' +
                    //     '<div class="uk-grid uk-grid-small uk-grid-width-1-2 st-notify-details">' +
                    //     '<span ">Transaction ID: ' + '</span>' + '<span class="uk-text-right">' + args.Detail.TransactionId + '</span>' + '\n' + '<br>' +
                    //     '<span ">Amount: ' + '</span>' + '<span class="uk-text-right">' + args.Detail.Amount + '</span>' + '\n' + '<br>' +
                    //     '<span ">Level: ' + '</span>' + '<span class="uk-text-right">' + args.Detail.StartQuote + '</span>' + '\n' + '<br>' +
                    //     '<span ">Expiration: ' + '</span>' + '<span class="uk-text-right">' + FormatTime(args.Detail.EndStamp, 'd-m-hh-mm-ss') + '</span>' + '</span>' + '\n' +
                    //     '</div';
                    notification({
                        message: message
                    });
                    break;
                case 'invalid':
                    message = '\n' + '<h4 class="st-notify-font">' + args.Message + '</h4>' + '\n';
                    notification({
                        message: args.Message,
                        pos: args.pos,
                        status: args.status
                    });
                    break;
                default:
                    break;
            }
        }
        // Handling data for open options
        var notify = function (name, data) {
            // debugger;
            var dl = data.length;
            for (var i = 0; i < dl; i++) {
                var tran = data[i];
                var trn_len = tran.TransactionValues.length;
                for (var ii = 0; ii < trn_len; ii++) {
                    var tran_detail = tran.TransactionValues[ii];
                    notifydata("", {
                        TransactionType: tran_detail.TransactionType,
                        Status: 'success',
                        Detail: tran_detail
                    });
                }
            }
        };

        // for testing
        
        // var notify1 = function () {
        //     notifydata("", {
        //         Status: 'success',
        //     });
        // };

        $scope.$on(common.msg.ntfy_close, notifydata);
        $scope.$on(common.msg.trns_ntfy, notifydata);
        $scope.$on(common.msg.nw_opt, notify);
        $scope.$on(common.msg.invalid_auth, notifydata);
        //for testing
        // $scope.$on("opennotify", notify1);
    }
    return {
        restrict: "EA",
        controller: ctrllr,
        replace: true
    }
}
mainApp.directive('dirNotification', ['ptodata', '$rootScope', 'common', dirNotify])