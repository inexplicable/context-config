'use strict';

var Builder = require("../../app.js"),
    EventEmitter = require("events").EventEmitter,
    Q = require("q"),
    cluster = require("cluster"),
    should = require("should");

if(cluster.isMaster){

    var worker = cluster.fork();
    worker.on("message", function(message){
        worker.send({
            "type":"config-read",
            "properties":[{
                "key":"k1",
                "context": {"site":"en-US"},
                "value":"v3"
            }
                ,{
                    "key":"k1",
                    "context": {"site":"de-DE"},
                    "value":"v4"
                }],
            "validContexts":["site"]
        });
    });

    var timeOut = setTimeout(function(){
        worker.process.kill("SIGTERM");
    }, 5000);

    cluster.on("exit", function(worker, code, signal) {
        console.log("success");
    });
}
else{

    var builder = new Builder({});
    builder.build(function(config){
        should.exists(config);
        (config.get("k1")).should.equal("v3");
        console.log("success");

    }, function(error){
        console.error(error);
    });
}