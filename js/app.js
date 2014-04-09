var app = angular.module('transglobe', ['leaflet-directive'])

    .controller('transglobeController', [ '$scope', 'languageMarkersFactory', function($scope, languageMarkersFactory) {
        
        languageMarkersFactory.getLanguageMarkers().then(function(markers) {
            $scope.markers = markers;
        });

        angular.extend($scope, {
            defaults: {
                tileLayer: 'http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',
            },
            europe: {
                lat: 52.5,
                lng: 2,
                zoom: 4
            },
            markers: []
        });
        
    }])
    
    .factory('languageMarkersFactory', [ '$http', '$q', 'languageService', function($http, $q, languageService) {

        var getMarkerFromLanguage = function(language, opt_location) {
            var markerLocation = opt_location || language.location;
            if(typeof markerLocation !== "undefined") {
                var languageName = languageService.getLanguageName(language);
                var languageCode = languageService.getLanguageCode(language);
                var languageIcon = {
                    className: 'language-label',
                    html: '<div class="translation-container empty" data-language="' + languageCode + '"><div contenteditable="true" class="translation language-' + languageCode + '"></div><div class="placeholder">' + languageName + '</div><a href="#" role="button">Go</a></div>',
                    type: 'div'
                };
                var marker = {
                    clickable: false,
                    icon: languageIcon,
                    lat: markerLocation.lat,
                    lng: markerLocation.lon,
                    title: 'Write something in ' + languageName
                };
                marker.language = language;
                return marker;
            }
        };
            
        var getMarkersFromLanguages = function(languages) {
            var markers = {};
            for(var index = 0, nLanguages = languages.length; index < nLanguages; index++) {
                var language = languages[index];
                var location = language.location;
                if(typeof language.name !== "undefined" && typeof location !== "undefined") {
                    var languageCode = languageService.getLanguageCode(language);
                    if(location instanceof Array) {
                        for(var i = 0, n = location.length; i < n; i++) {
                            var marker = getMarkerFromLanguage(language, location[i]);
                            markers[languageCode + '_' + i] = marker;
                        }
                    }
                    else {
                        var marker = getMarkerFromLanguage(language);
                        markers[languageCode] = marker;
                    }
                }
            }
            return markers;
        };

        var deferred = $q.defer();
        
        $http.get('data/languages.json')
            .success(function(response) {
                var markers = getMarkersFromLanguages(response);
                deferred.resolve(markers);
            })
        ;

        return {
            getLanguageMarkers: function() {
                return deferred.promise;
            }
        };

    }])

    .service('languageService', function() {

        var visitorLanguage = "en";

        return {
            getLanguageCode: function(language) {
                var languageCode;
                if(language.codes) {
                    languageCode = language.codes["639-3"] || language.codes["639-2"] || language.codes["639-1"];
                    if(languageCode instanceof Array) {
                        languageCode = languageCode[0];
                    }
                }
                else {
                    languageCode = language.code;
                }
                return languageCode;
            },
            getLanguageName: function(language) {
                var languageName;
                if(language.name[visitorLanguage] instanceof Array) {
                    languageName = language.name[visitorLanguage][0];
                }
                else {
                    if(typeof language.name[visitorLanguage] === 'string') {
                        languageName = language.name[visitorLanguage];
                    }
                    else {
                        languageName = language.name;
                    }
                }
                return languageName;
            }
        };
        
    })
    
    ;

/*var translation = translation || {};
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
*/