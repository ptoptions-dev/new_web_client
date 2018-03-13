mainApp.service("common", function ($rootScope) {
    var self = this;
    self.msg = {
        r_quotes: "r_quotes", // 0 msg for when quotes are received from service
        s_auth: "s_auth", // show authentication box
        h_auth: "h_auth", // hide authentication box
        auth_r: "auth_result", // authorization result
        auth: "authorize", // authorize
        auth_rem: "auth_rememberme", // remember me update
        logout: "logout", // logout
        r_sym: "symbols_received", // symbols received msg
        add_symbol: "add_symbol", // add symbol to Active Symbols list
        sel_symbol: "sel_symbol", // select symbol from Active Symbols list to display chart
        del_symbol: "del_symbol", // remove symbol from Active Symbols list
        up_down_trade: "up_down_trade", // notify for up/down trade
        upd_svrdt: "update_serverdatetime", // get update for server datetime
        act_expTime: "active_expirationTime", //Active expirationTime
        chgn_sym: "change_symbol", //for symbol change
        rqts_bars: "request_bars", //used for request bars.
        rqts_bars_result: "request_bars_result", //,
        gt_trns_hstry: "get_transaction_history",
        invk_gt_trns_hstry: "invoked_getting_transaction_history",
        trns_updt: "transaction_update",
        invalid_auth: "Invalid_auth",
        create_demo: "create_demo",
        opn_opt_rslt: "open_option_result",
        loginDisable: "disable_login",
        gt_acct_dtls: "get_account_details",
        chart_chngeStmp: "chart_change_stamp",
        chng_slctd_xtm: "change_selected_expirytime",
        acct_is_authrzd: "account_is_authorized",
        gt_acct_bal: "get_account_balance",
        dm_dp: "Demo_Deposit",
        strt_updt: "Start_Getting_Updates",
        gt_opn_opt: "Get_Open_Options",
        gt_live_bars: "Request_Live_Bars",
        live_bars_result: "live_bars_result",
        trns_ntfy: "transaction_notification",
        on_chnge_interval: "on_chnge_interval",
        nw_opt: "new_open_trade",
        acct_typ_chngs: "account_type_change",
        st_hstry_itm: "set_history_item",
        trns_clsd: "transaction_closed",
        ntfy_close: "ntfy_close",
        rqts_brs_hstry: "request_bars_history"
    };

    self.GetSymbolName = function(sym){
        return sym.replace("#", "__");
    };

    self.GetOrigSymbolName = function(sym){
        return sym.replace("__", "#");
    };

    
});