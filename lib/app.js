
var _ = require("underscore"),
    Q = require('q'),
    ContextConfiguration = require('./context-configuration.js').ContextConfiguration,
    ForwardConfiguration = require('./forward-configuration.js').ForwardConfiguration;

var ConfigurationBuilder = module.exports = function(ref, emitter){

    this._ref = ref;
    this._emitter = emitter || {
        "on": function(event, handler){
            process.on("message", function(message){//worker listening to "message"
                if(_.isEqual(event, message.type)){
                    handler(message);
                }
            });
        },
        emit: function(event, message){
            message.type = "delegate";
            message.delegate = event;
            message.expect = "config-read";
            message.notification = true;
            process.send(message);
        }//pseudo event emitter in cluster
    };
    this._forward = null;
};

ConfigurationBuilder.prototype.build = function(callback, onError){

    var self = this;
    var ref = self._ref;
    var deferred = Q.defer();
    var timeOut = setTimeout(function(){
        deferred.reject("timeout after 10s");//timeout
    }, 10000);//TIME OUT IN 3 SECONDS

    if(self._forward){
        clearTimeout(timeOut);
        deferred.resolve(self._forward);
    }
    else{
        var emitter = self._emitter;
        emitter.on("config-read", function(message){
            if(isExpected(ref, message)){
                if(!self._forward){
                    clearTimeout(timeOut);

                    self._forward = new ForwardConfiguration([new ContextConfiguration(message.properties, message.validContexts || [])]);
                    deferred.resolve(self._forward);
                }
                else{
                    self._forward.swap([new ContextConfiguration(message.properties, message.validContexts || [])]);
                }
            }
        });

        emitter.emit("read-config", {
            "pid":process.pid,
            "base":ref.base,
            "domain":ref.domain,
            "target":ref.target,
            "project":ref.project,
            "config":ref.config,
            "version":ref.version
        });
    }

    if(callback){
        deferred.promise
            .then(callback)
            .fail(onError || function(){/*do nothing*/})
            .done();
    }
    else{
        return deferred.promise;
    }
};

function isExpected(origin, message){
    return _.isEqual(_.pick(origin, "domain", "target", "project", "config", "version"),
                    _.pick(message, "domain", "target", "project", "config", "version"));
}