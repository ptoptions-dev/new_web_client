mainApp.service("ptodata",["$rootScope","common","dummy","optionsocket",function(o,a,e,t){var i=this;i.init=function(){for(var o=e.symbols,t=0;t<o.length;t++){var m=a.GetSymbolName(o[t]);i.SymbolDetails[m]={SymbolName:m}}},i.SymbolDetails={}}]);