var translation = translation || {};
var languageUtils = languageUtils || {};
var polyglot = polyglot || {};
polyglot.ui = polyglot.ui || {};

(function() {
    
    var initMap = function() {
        var cloudmadeUrl = 'http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',
        cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18});
        polyglot.ui.map = new L.Map('map', {layers: [cloudmade], center: new L.LatLng(52.5, 2), zoom: 4 });
    };
    
    var loadData = function() {
        var xhReq = new XMLHttpRequest();
        xhReq.open("GET", "data/languages.json", false);
        xhReq.onload = function() {
            onDataLoad(xhReq.responseText);
        };
        xhReq.send(null);
    };
    
    var onDataLoad = function(data) {
        var languages = JSON.parse(data);
        translation.languages = languages;
        for(var index in languages) {
            var language = languages[index];
            if(typeof language.name !== "undefined" && typeof language.location !== "undefined") {
                if(language.location instanceof Array) {
                    for(var i in language.location) {
                        polyglot.ui.addLanguageTag(language, language.location[i]);
                    }
                }
                else {
                    polyglot.ui.addLanguageTag(language);
                }
            }
        }
        polyglot.ui.initInteractions();
    };
        
    window.onload = function() {
        initMap();
        loadData();
    };
    
})();
