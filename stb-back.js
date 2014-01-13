/*
Author: Boris Tsejtlin
Github: https://github.com/Euphe
Email: euphetar@gmail.com
License: GPL 

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.


Copyright 2014 Boris Tsejtlin

*/
var trade = false,
    item = 'No item',
    minprice = 0,
    quantity = 0,
    deals = [],
    summaryStr = '',
    bought = 0;

function pushLog() {
    //magically send log to popup.js
    chrome.runtime.sendMessage({
        request: 'pushLog',
        deals: deals
    });
}

function showError(entry) {
    //magically send error to popup.js
    chrome.runtime.sendMessage({
        request: 'pushError',
        entry: entry
    });
}

function pushItemName(name) {
   // console.log('Sending request to set name to ' + name)
    chrome.runtime.sendMessage({
        request: 'name',
        itemname: name
    });
}

function initStart(){
   // console.log('init starting')
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {request: "dostart"}, function(response) {});  
    });
}

function fetchSummary() {
    var str, summary = {
        deals: 0,
        sum: 0,
        warnings: 0,
        successes: 0
    };

    var sum = 0,
        warnings = 0,
        successes = 0;
    for (var deal in deals) {
        if (deals[deal].price){
            sum += deals[deal].price;
        }

        if (deals[deal].state == 'OK' && deals[deal].price) {
            summary.deals+= 1
            successes += 1;
        } else if (deals[deal].state == 'WARNING' && deals[deal].price) {
            summary.deals+=1
            warnings += 1;
        }
    }
    summary.sum = sum;
    summary.warnings = warnings;
    summary.successes = successes;

     summaryStr = 'Bought ' + summary.deals + ' items for a total price of ' + String(summary.sum).slice(0,5) + ' with ' + summary.warnings +' warnings and ' + summary.successes +' successes.'
    chrome.runtime.sendMessage({
        request: 'summary',
        summary: summaryStr
    });
}
    function sendVars() {
        //magically get vars from popup.js
        
        var vars = {
            success: true,
            trade: trade,
            minprice: minprice,
            quantity: quantity,
            bought: bought,
            itemname: item,
            summary: summaryStr,
            deals: deals

        }
        //console.log('Sendings vars. My vars are now ', vars);
        return vars;
    }



    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request)
        switch (request.request) {
            case 'curvars':
                sendResponse(sendVars());
                break;
            case 'vars':
              //  console.log('Recieved request to send vars')
                sendResponse(sendVars());
                break;
            case 'log':

                if (request.entry.state == 'ERROR') {
                    showError(request.entry)
                }
                else {
                   // console.log('Recieved log ', request.entry)
                    deals.push(request.entry)
                   // console.log(deals)
                    pushLog();
                    }
                break;
            case 'itemname':
                item = request.itemname;
            //    console.log('Got request to set item name to ' + item)
                pushItemName(request.itemname);

                break;
            case 'bought':
                bought += 1;
                break;
            case 'start':
             //   console.log('Recieved start')
                trade = true;
            //    console.log('calling init start')
                initStart();
                break;
            case 'stop':
                trade = false;
                fetchSummary();
                break;
            case 'setvars':
               // console.log('Recieved request to set vars.')
                minprice = request.vars.minprice;
                quantity = request.vars.quantity;
                bought = 0;
              //  console.log('Minprice is now ' + minprice);
              //  console.log('Quantityis now ' + quantity);
                break;
            default:

                break;
        }

    });