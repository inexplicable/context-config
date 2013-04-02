
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
            process.send({//worker sending over to master
                "type":event,
                "pid":process.pid,
                "base":ref.base,
                "domain":ref.domain,
                "target":ref.target,
                "project":ref.project,
                "config":ref.config,
                "version":ref.version
            });
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
            if(sameOrigin(ref, message)){
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
            "type":"read-config",
            "pid":process.pid,
            "base":ref.base,
            "domain":ref.domain,
            "target":ref.target,
            "project":ref.project,
            "config":ref.config,
            "version":ref.version
        });
    }

    deferred.promise
        .then(callback)
        .fail(onError || function(){/*do nothing*/})
        .done();
};

function sameOrigin(origin, message){
    return _.isEqual(_.pick(origin, "domain", "target", "project", "config", "version"),
                    _.pick(message, "domain", "target", "project", "config", "version"));
}