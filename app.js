var bip39 = require("bip39");
var ark = require("arkjs");
var request = require('request');

var testnetapi = "http://node1.arknet.cloud:4000/api/"

var testnetrequest = function(api, callback){
  request(testnetapi + api, function (error, response, body) {
    callback(error, JSON.parse(body));
  });
};


$(window).ready(function(){

  $("button#generateAccountc").click(function(){
    var passphrase = bip39.generateMnemonic();
    $("#passphrase").html(passphrase);
    $("#address").html(ark.crypto.getAddress(ark.crypto.getKeys(passphrase).publicKey));
  });

  $("button#queryTestnet").click(function(){
    testnetapi = $("#testnet_node").val() + "/api/";
    testnetrequest("loader/status/sync", function(error, result){
      console.log(result);
      $("#height").html(result.height);
    });
  });

  $("button#checkTransactions").click(function(){
    var address = $("#check_address").val();
    console.log(address);
    testnetrequest("transactions?orderBy=timestamp:desc&recipientId="+address+"&senderId="+address, function(error, result){
      console.log(result);
      $("#transactions").html("");
      for(i in result.transactions){
        var transaction=result.transactions[i];
        var tr = $("<tr>")
        tr.append("<td>"+transaction.type+"</td>");
        tr.append("<td>"+transaction.id+"</td>");
        tr.append("<td>"+transaction.vendorField+"</td>");
        tr.append("<td>"+transaction.amount/100000000+"</td>");
        tr.append("<td>"+transaction.fee/100000000+"</td>");
        $("#transactions").append(tr);
      }
    })
  });
});
