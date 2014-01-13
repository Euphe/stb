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

var itemname = 'No item',
trade = false,
    minprice = 0.00,
    quantity = 0,
    bought = 0,
    summary = '',
    deals = [];
function getCurVars(){
    chrome.runtime.sendMessage({
            request: 'curvars'
        }, function(response){
                trade = response.trade;
                itemname = response.itemname;
                minprice = response.minprice;
                quantity = response.quantity;
                bought = response.bought;
                summary = response.summary;
                deals = response.deals;

                document.getElementById('itemname').innerHTML = response.itemname;
                document.getElementById('quantity').value = response.quantity;
                document.getElementById('price').value = response.minprice;
                document.getElementById('progress').innerHTML = bought + '/' + quantity;
                document.getElementById('state').innerHTML = (trade == true)?'Trading!':'Not trading';
                addSummary();
                updateLog();
        });
    
}
function addSummary() {
    document.getElementById('summary').innerHTML = summary
}
function updateLog() {
   
    document.getElementById('log').innerHTML = '';
    for(var n = 0; n<deals.length;n++){
      
        var entry = deals[n],
            item = entry.item,
            price = entry.price,
            operation = entry.operation,
            state = entry.state;

        var newdiv = document.createElement("DIV");
        newdiv.setAttribute("class", "logmsg " + state);
        if (item && price) {
            newdiv.innerHTML = '[' + state + ']' + ' ' + operation + ' ' + item + ' at price ' + price;
        } else {
            newdiv.innerHTML = '[' + state + ']' + ' ' + operation;

        }
        document.getElementById('log').appendChild(newdiv);
    }
}

function showError(entry) {
    var item = entry.item,
        price = entry.price,
        operation = entry.operation,
        state = entry.state;
    if (item && price) {
        message = '[' + state + ']' + ' ' + operation + ' when buying item ' + item + ' at price ' + price;
    } else {
        message = '[' + state + ']' + ' ' + operation;
    }
    document.getElementById('error').innerHTML = message;
}

function getVars() {
    var vars = {};
    vars.minprice = parseFloat(document.getElementById('price').value.replace(/[A-Za-z$-]/g, '').replace(',','.'));
    minprice = vars.minprice;

    vars.quantity = parseInt(document.getElementById('quantity').value.replace(/[A-Za-z$-]/g, '').replace(',','.'));
    quantity = vars.quantity;
    
    return vars;
}

//Magically send the vars
document.getElementById("Trade").addEventListener("click",
    function () {
        var nums = getVars();
        if (quantity <= 0 || minprice <= 0){return false}
     //   console.log('Sending start')
        chrome.runtime.sendMessage({
            request: 'start'
        });
        chrome.runtime.sendMessage({
            request: 'setvars',
            vars: nums
        });
    });

document.getElementById("Stop").addEventListener("click",

function () {
    chrome.runtime.sendMessage({
        request: 'stop'
    });
});

chrome.runtime.onMessage.addListener(
function (request, sender, sendResponse) {  
    switch (request.request) {
        case 'pushLog':
          
            deals = request.deals;
            
            updateLog();
            break;
        case 'pushError':
            showError(request.entry);
            break;
        case 'name':
         //   console.log('Setting name to ' + request.itemname)
            itemname = request.itemname;
            document.getElementById("itemname").innerHTML = itemname;
            break;
        case 'getVars':
            sendResponse(getVars());
            break;
        case 'summary':
            addSummary(request.summary);
            break;
        default:
            break;
    }
     getCurVars();
});
getCurVars();
