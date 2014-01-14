/*
Author: Boris Tsejtlin
Github: https://github.com/Euphe
Email: euphetar@gmail.com
License: MIT

The MIT License (MIT)

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


Copyright 2014 Boris Tsejtlin

*/
var trade,
    waittime = 2000,
    item,
    minprice,
    quantity,
    itemPrice,
    found,
    itemButton,
    itemname,
    bought,
    i;
 chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //console.log('Got request', request)
    if (request.request == 'dostart'){
        refresh()
    }
 });
function setVars(vars){
    trade = vars.trade;
    minprice = vars.minprice;
    quantity = vars.quantity;
    bought = vars.bought;
  //  console.log('My new vars are ', trade, item, minprice, quantity, bought);

    if (trade == true) {Trade()}
}
function loadVars() {
  //  console.log('Requesting vars');
    chrome.runtime.sendMessage({
        request: 'vars'
    }, function (response) {
      //  console.log('Got some vars.They are ', response);
      //  console.log('My initial vars are ', trade, item, minprice, quantity, bought);
        setVars(response)
        
    });
  
}

function log(operation, item, price, state) {
    // send chrome magic event to stb-back.js to log

    var entry = {
        operation: operation,
        item: item,
        price: price,
        state: state
    }
   // console.log('Logging ', entry)
    chrome.runtime.sendMessage({
        request: 'log',
        entry: entry
    });
}

function sendBought() {
    chrome.runtime.sendMessage({
        request: 'bought'
    });
}

function sendStop() {
    chrome.runtime.sendMessage({
        request: 'stop'
    });
}

function buyItem(itemnam, prc) {
    document.getElementById('market_buynow_dialog_accept_ssa').checked = true;
    setTimeout(buyItemconfirm(itemnam, prc), waittime + Math.floor(Math.random() * 5));
}

function buyItemconfirm(itemnam, prc) {
        document.getElementById('market_buynow_dialog_purchase').click();
        setTimeout( 
            function(){ 
                if (window.getComputedStyle(document.getElementById('market_buynow_dialog_error')).getPropertyValue('display') == 'none') {
                    // send chrome magic request to log
                    log('Bought', itemnam, prc, 'OK')

                    sendBought();
                    setTimeout(refresh, waittime + Math.floor(Math.random() * 100));
                } 
                else {
                    document.getElementById('market_buynow_dialog_purchase').click();
                    // send chrome magic request to log error
                    log('Encountered error when attempting to buy ', itemnam, prc, 'WARNING')
                    sendBought();
                    setTimeout(refresh, waittime + Math.floor(Math.random() * 100));
                }
        },  waittime*2 + Math.floor(Math.random() * 5))
}

function refresh() {
    location.reload(true);
}


function setItemName() {
   // console.log('Setting name')
    var nm = 'No item';
    if (document.getElementsByClassName('market_listing_item_name')[0]) {
        nm = document.getElementsByClassName('market_listing_item_name')[0].innerHTML;
        // send chrome magic request to stb-back.js to log
    }
   // console.log('Sending request to set name to ' + nm)
    chrome.runtime.sendMessage({
        request: 'itemname',
        itemname: nm
    });
}


function Trade() {
    if (!document.getElementsByClassName('market_listing_item_name')[0]) {
        log('Invalid page, no listings found', null, null, 'ERROR')
        sendStop();
        return false;
    }
    setItemName();

    if (bought >= quantity) {
        log('Bought enough', null, null, 'OK')
        sendStop();
        return true;
    }
   
    item = document.getElementsByClassName('market_listing_row'),
    itemPrice = document.getElementsByClassName('market_listing_price_with_fee'),
    found = false,
    itemButton = document.getElementsByClassName('item_market_action_button_green'),
    itemname = document.getElementsByClassName('market_listing_item_name')[0].innerHTML,
    i = 0;


    while (item[i]) {
        var price = parseFloat(itemPrice[i].innerHTML.replace(/[A-Za-z$-]/g, '').replace(',', '.'));
      //  console.log(price)
        if (price <= minprice) {

            found = true;
            itemButton[i].click();
            setTimeout(buyItem(itemname, price), 400 + Math.floor(Math.random() * 4));

            break;
        }
        i++;
    }

    if (found != true) {
        setTimeout(refresh, waittime + Math.floor(Math.random() * 300));
    }

}

loadVars()
