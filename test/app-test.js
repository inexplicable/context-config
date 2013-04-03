'use strict';

var EventEmitter = require("events").EventEmitter,
    Builder = require("../app.js"),
    cluster = require("cluster"),
    should = require("should"),
    spawn = require("child_process").spawn;

describe("Builder", function(){

    describe("#build", function(){

        var emitter = new EventEmitter();
        emitter.on("read-config", function(message){

            emitter.emit("config-read", {
                "type":"config-read",
                "properties":[{
                    "key":"k1",
                    "context": {"site":"en-US"},
                    "value":"v1"
                }
                ,{
                    "key":"k1",
                    "context": {"site":"de-DE"},
                    "value":"v2"
                }],
                "validContexts":["site"]
            });
        });

        var builder = new Builder({

        }, emitter);

        it("should build config correctly and callback", function(done){

            builder.build(function(config){
                should.exists(config);
                (config.get("k1")).should.equal("v1");
                done();
            }, function(error){
                done(error);
            });
        });
    });

    describe("message", function(){

        it("should work exactly the same in cluster environment using messaging", function(done){
            var clusterTest = spawn("node", [process.cwd() + "/test/lib/app-cluster-test.js"]);
            clusterTest.stdout.setEncoding("utf8");
            clusterTest.stderr.setEncoding("utf8");

            clusterTest.stdout.on("data", function(data){
                done();
            });
            clusterTest.stderr.on("data", function(data){
                done(data);
            });
        });
    });
});