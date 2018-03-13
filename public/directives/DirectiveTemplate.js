var ChartDisplayTemplate = [
    '<div class="st-optionchart-controls">',
    '<h1 ng-model="Symbol">{{Symbol}}</h1>',
        '<div class="controlpanel">',
           '<span>Time</span>',
           '<time/>',
           ' <div class="con-plus-minus">',
               '<minus-button></minus-button>',
               '<plus-button></plus-button>',
            '</div>',
        '</div>',
        '<div class="controlpanel">',
            '<span>Amount</span>',
            '<amount/>',
            '<div class="con-plus-minus">',
                '<minus-button></minus-button>',
                '<plus-button></plus-button>',
            '</div>',
        '</div>',
        '<div class="controlpanel">',
            '<span>Profit</span>',
            '<percentage/>',
            '<profit/>',
           '<call-button/>',
            '<put-button/>',
        '</div>',
    '</div>',
].join('');

    // '<div class="opt-cd-menu">',
    //     '<div ng-bind="Symbol"> </div>',
    //     '<div ng-bind="TimeFrame"> </div>',
    // '</div>',
    // '<div class="opt-cd-chart">MainChart</div>',
// ].join('');

var SymbolTemplate = [
'<div class="container">',
    '<select ng-model="symbol">',
         '<option  ng-repeat="c in symbols">{{c}}</option>' ,
         '</select>',
    
    
    '<ul style="list-style-type: none;">',
    
        '<li ng-repeat="obj in symbolist" class="uk-panel uk-panel-box st-asset-panel" style="display: inline-block; margin-left: 10px;"  ng-click="displayChart(obj.symbolist)">',
            '<a href="#link" ng-click="Remove($index)" class="uk-icon-close"></a>',
            '<span class="st-asset-title">{{obj.symbolist}}</span>',
            '<span class="st-asset-percent">100%</span>',
        '</li>',
        '<li class="st-asset-add" style="display: inline-block; margin-left: 10px;"><a href="#link"  class="uk-icon-plus-square-o"  ng-click="AddSymbols()"></a></li>',
        
    '</ul>',
'</div>'
].join('');