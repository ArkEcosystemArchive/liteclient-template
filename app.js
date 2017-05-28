var bip39 = require("bip39");
var ark = require("arkjs");

var testnetapi = "http://node1.arknet.cloud:4000/api/"

var testnetrequest = function(api, callback){
  $.getJSON(testnetapi + api, function(data) {
    callback(data);
  });
};

$(window).ready(function(){
  $("button#generateAccount").click(function(){
    var passphrase = bip39.generateMnemonic();
    var ecpair = ark.ECPair.fromSeed(passphrase, ark.networks.ark);

    var publicKey = ecpair.getPublicKeyBuffer().toString('hex');
    var address = ecpair.getAddress().toString('hex');
    $("#passphrase").html(passphrase);
    $("#address").html(address);
    $('#qrcode').html("");
    $('#qrcode').qrcode("{'a':'"+address+"'}");
  });

  $("form#queryTestnet").submit(function(e){
    e.preventDefault();
    testnetapi = $("#testnet_node").val() + "/api/";
    testnetrequest("loader/status/sync", function(result){
      console.log(result);
      $("#height").html(result.height);
    });
  });

  $("form#checkTransactions").submit(function(e){
    e.preventDefault();
    var address = $("#check_address").val();
    console.log(address);
    testnetrequest("transactions?orderBy=timestamp:desc&recipientId="+address+"&senderId="+address, function(result){
      console.log(result);
      $("#transactions").html("");
      for(i in result.transactions){
        var transaction=result.transactions[i];
        if(transaction.type==0){
          transaction.type="Send";
        }
        else if(transaction.type==1){
          transaction.type="Delegate Registration";
        }
        else if(transaction.type==2){
          transaction.type="Second Passphrase Creation";
        }
        else if(transaction.type==3){
          transaction.type="Vote";
        }
        else if(transaction.type==4){
          transaction.type="Multisignature";
        }
        var tr = $("<tr>")
        tr.append("<td><a target='_blank' href='http://texplorer.ark.io/tx/"+transaction.id+"'>"+transaction.id+"</a></td>");
        tr.append("<td>"+transaction.type+"</td>");
        tr.append("<td><a target='_blank' href='http://texplorer.ark.io/address/"+transaction.senderId+"'>"+transaction.senderId+"</a></td>");
        tr.append("<td><a target='_blank' href='http://texplorer.ark.io/address/"+transaction.recipientId+"'>"+transaction.recipientId+"</a></td>");
        tr.append("<td>"+(transaction.vendorField?transaction.vendorField:"-")+"</td>");
        tr.append("<td>"+transaction.amount/100000000+"</td>");
        tr.append("<td>"+transaction.fee/100000000+"</td>");
        $("#transactions").append(tr);
      }
    })
  });
});
