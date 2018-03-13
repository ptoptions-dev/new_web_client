var authDir = function ($rootScope, common, $timeout) {

    var cont = function ($scope) {
        $scope.username = "63424354";
        $scope.password = "mJscel11";
        $scope.remember = false;
        $scope.isVisible = true;
        $scope.authmsg = "";
        //$scope.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
        $scope.login = function () {
            $scope.$emit(common.msg.auth, {
                username: $scope.username,
                password: $scope.password,
                remember: $scope.remember
            });
            $scope.authmsg = "";
            $scope.isDisabled = true;
            // $scope.$emit(common.msg.h_auth);

            $rootScope.$on(common.msg.invalid_auth, Invalid);

            function Invalid(args, param) {
                // $scope.authmsg = param;
                $scope.isDisabled = false;
            }
        };

        $scope.onCreateDemo = function () {
            $scope.$emit(common.msg.create_demo);
        };
    };


    var lnFn = function (scope, iElement, iAttrs, controller) {

        var ab = iElement.find("#authBox");
        var modal = $.UIkit.modal('#authBox', {
            backdrop: "static",
            keyboard: false,
            bgclose: false
        });

        var sAuthCB = function () {
            modal.show();
            scope.isVisible = true;
            ab.removeClass("fadeOut fadeIn hide");
            ab.addClass("fadeIn");
        };
        var hAuthCB = function () {
            iElement.find("#st-usermenu-userbalance").fadeOut(0);
            modal.hide();
            ab.removeClass("fadeOut fadeIn");
            ab.addClass("fadeOut");
            scope.isVisible = false;
            if (!scope.remember) {
                scope.username = "";
                scope.password = "";
            }
            // else {
            //     scope.username = $scope.username;
            //     scope.password = $scope.password;
            // }
        };
        scope.$on(common.msg.s_auth, sAuthCB);
        scope.$on(common.msg.h_auth, hAuthCB);

        var cefAuthResult = function (event, args) {
            scope.acct_reltd = args.AccountDetails.relatedAccounts;
            switch (args.Id) {
                case 0:
                    $rootScope.$emit(common.msg.h_auth);
                    $rootScope.$emit(common.msg.acct_is_authrzd);
                    $rootScope.$emit('try', scope.acct_reltd);

                    break;
                case 1:
                case 2:
                    //$rootScope.$emit(common.msg.invalid_auth, args.Message);
                    // $rootScope.$emit(common.msg.trns_ntfy, notification);
                    // notification({  });
                    $rootScope.$emit(common.msg.invalid_auth, {
                        Status: "invalid",
                        status: "default2",
                        pos: "top-center",
                        Message: args.Message
                    });
                    break;
                case 6:
                    $rootScope.$emit(common.msg.invalid_auth, {
                        Status: "invalid",
                        status: "default2",
                        pos: "top-center",
                        Message: args.Message
                    });
                    break;
                default:

                    break;
            }
            scope.isDisabled = false;
        };

        $rootScope.$on(common.msg.auth_r, cefAuthResult);
    };

    return {
        restrict: "E",
        templateUrl: 'view/authview.html',
        link: lnFn,
        controller: cont
    };
};
mainApp.directive("authDir", ['$rootScope', 'common', '$timeout', authDir]);

var dirLogout = function ($rootScope, common) {
    var cntrlr = function ($scope) {
        $scope.logout = function () {
            $rootScope.$emit(common.msg.logout);
            $rootScope.$emit(common.msg.s_auth);
            // if ($scope.remember == true) {
            //     // alert($scope.remember);
            //     $scope.$on(common.msg.auth, {
            //         username: "10000001",
            //         password: "+vCDvbEzaOvm"
            //     });
            // } else {

            // };
        }
    }
    return {
        restrict: "A",
        controller: cntrlr
    }
};
mainApp.directive('dirLogout', ['$rootScope', 'common', dirLogout]);

var dirAccountDetails = function ($rootScope, common, ptodata) {
    var ctrllr = function ($scope) {

        var click = function (type) {
            $rootScope.AccountDetails.AccountType = type;
            $rootScope.$emit(common.msg.acct_typ_chngs, {
                AccountType: type,
                Callback: accttypchng_Callback
            });
        }
        $scope.click = click;


        var acct_dtls_result = function (result) {
            $rootScope.$on('try', function (data) {
                $rootScope.AccountDetails.RelatedAccounts = data;
            });
            $rootScope.AccountDetails.AccountCurrency = result.AccountCurrency;
            $rootScope.AccountDetails.AccountNumber = result.AccountNumber;
            $rootScope.AccountDetails.AccountType = result.AccountType;
            $rootScope.AccountDetails.Balance = result.Balance;
            $rootScope.AccountDetails.FirstName = result.FirstName;
            $rootScope.AccountDetails.LastName = result.LastName;
            $rootScope.AccountDetails.MiddleName = result.MiddleName;
            $rootScope.AccountDetails.Email = result.Email;
            if ($rootScope.acct_reltd.length){
                $scope.acnt = $rootScope.acct_reltd[0].account;
                $scope.tpe = $rootScope.acct_reltd[0].type;
            }
            $rootScope.AccountDetails.RelatedAccounts = $rootScope.acct_reltd;
        }
        var DemoDeposit = function ($event) {
            $rootScope.AccountDetails.Balance.Demo += 10000;
            $rootScope.$emit(common.msg.dm_dp, {
                DepositAmount: $rootScope.AccountDetails.DemoDepositAmount,
                Callback: dm_dpCallback
            });
        }
        var dm_dpCallback = function (result) {
            if (result) {
                notification({
                    message: "Deposit was successful at amount of :$" + $rootScope.AccountDetails.DemoDepositAmount,
                    status: "success",
                    pos: "top-center"
                })
            }
        };
        var accttypchng_Callback = function (result) {
            if (result) $rootScope.$emit(common.msg.invk_gt_trns_hstry);
        }
        $scope.DemoDeposit = DemoDeposit;

        var gt_acct_dtls = function (name) {
            $rootScope.$emit(common.msg.gt_acct_dtls, acct_dtls_result);
        }
        var clear = function () {
            $rootScope.AccountDetails.AccountCurrency = "";
            $rootScope.AccountDetails.AccountNumber = "";
            $rootScope.AccountDetails.FirstName = "";
            $rootScope.AccountDetails.LastName = "";
            $rootScope.AccountDetails.MiddleName = "";
            $rootScope.AccountDetails.Email = "";
            $rootScope.AccountDetails.Balance = {
                Real: parseFloat(0).toFixed(2),
                Demo: parseFloat(0).toFixed(2)
            }
        }
        $rootScope.$on(common.msg.acct_is_authrzd, gt_acct_dtls);
        $rootScope.$on(common.msg.logout, clear);
    }
    return {
        restrict: "A",
        controller: ctrllr
    }
}
mainApp.directive('dirAccountdetails', ['$rootScope', 'common', 'ptodata', dirAccountDetails]);