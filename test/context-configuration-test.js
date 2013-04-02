var ContextConfiguration = require("../context-configuration.js").ContextConfiguration,
    should = require("should");

describe("ContextConfiguration", function() {

    describe("#get(key)", function(){
        var config = new ContextConfiguration([], []);
        config.append({
            "key":"k1",
            "value":"v1"
        });

        it("should get 'v1' using 'k1' ", function(done){
            (config.get("k1")).should.equal("v1");
            done();
        });
    });

    describe("#get(key, context)", function(){
        var config = new ContextConfiguration([], ["site"]);
        config.append({
            "key":"k1",
            "context": {"site":"en-US"},
            "value":"v1"
        });
        config.append({
            "key":"k1",
            "context": {"site":"de-DE"},
            "value":"v2"
        });

        it("should get 'v1' using 'k1' and 'site':'en-US' ", function(done){
            (config.get("k1", [{"site":"en-US"}])).should.equal("v1");
            done();
        });

        it("should get 'v2' using 'k1' and 'site':'de-DE' ", function(done){
            (config.get("k1", [{"site":"de-DE"}])).should.equal("v2");
            done();
        });
    });

    
    describe("#get(key, context) with fallback", function(){
        var config = new ContextConfiguration([], ["site", "page"]);
        config.append({
            "key":"k1",
            "context": {"site":"en-US", "page":"1"},
            "value":"v1"
        });
        config.append({
            "key":"k1",
            "context": {"site":"de-DE", "page":"5"},
            "value":"v2"
        });

        it("should get 'v1' using 'k1' and {'site':'en-US', 'page':'5'} ", function(done){
            (config.get("k1", [[{"site":"en-US"}, {"page":"5"}], [{"site":"en-US"}, {"page":"1"}]])).should.equal("v1");
            done();
        });

        it("should get 'v2' using 'k1' and {'site':'de-DE', 'page':'5'} ", function(done){
            (config.get("k1", [[{"site":"de-DE"}, {"page":"5"}]])).should.equal("v2");
            done();
        });
    });
});