var proxy = require("express-http-proxy");
var mockData = require("./define");
var apiProxy = function() {
    if (mockData.define.isProxy) {
        return proxy(mockData.define.domain, {
            limit:'500mb',
            forwardPath: function(req, res) {
                return req._parsedUrl.path
            }
        });
    } else {
        return function(req, res, next) {
            var postParams=Object.keys(req.body);
            if (req.baseUrl) {
                if(Array.isArray(mockData.getInterFace(req.baseUrl)) && typeof mockData.getInterFace(req.baseUrl)[0].$params!=='undefined'){
                    var data=mockData.getInterFace(req.baseUrl).filter(function(mockdata){
                        var params=mockdata.$params;
                        return params.filter(function(param){
                                return postParams.indexOf(param)===-1;
                            }).length===0; // paramsMatched
                    });
                    if(data.length>0){
                        res.json(data[0].$res);
                    }else{
                        res.json({
                            "msg": "nodata"
                        });
                    }
                }else{
                    res.json(mockData.getInterFace(req.baseUrl));
                }
            } else {
                res.json({
                    "msg": "nodata"
                });
            }
        };
    }
}();

module.exports = function(app) {
    //模拟数据
    if (mockData.define.isProxy && mockData.define.matchPath !== '') {
        app.use(mockData.define.matchPath, apiProxy);
    } else {
        var keys = mockData.interFaces.keys();  //遍历Key
        for (var key of keys) {
            app.use(key, apiProxy);
        }
    }
};
