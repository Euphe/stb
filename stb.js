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
