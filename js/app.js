var app = angular.module('transglobe', ['leaflet-directive'])

    .directive('transglobeMap', ['languageMarkersFactory', function(languageMarkersFactory) {
        return {
            restrict: 'C',
            replace: true,
            scope: false,
            template: '<div id="map-wrapper" ng-if="showMap">' +
                      '<leaflet center="europe" defaults="defaults" id="map" markers="markers" event-broadcast="events"></leaflet>' +
                      '</div>',
            link: function(scope) {
                languageMarkersFactory.getLanguageMarkersPromise().then(function(markers) {
                    angular.extend(scope, {
                        defaults: {
                            tileLayer: 'http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png'
                        },
                        europe: {
                            lat: 52.5,
                            lng: 2,
                            zoom: 4
                        },
                        events: {
                            markers: {
                                enable: ['click'],
                                logic: 'emit'
                            }
                        },
                        markers: markers
                    });
                    scope.showMap = true;
                });
            },
            controller: function($scope) {
                $scope.$on('leafletDirectiveMarker.click', function(event, args) {
                    console.log( 'marker name: ' + args.markerName);
                    console.log( 'marker: ' + $scope.markers[args.markerName]);
                    var inputField = angular.element(document.querySelector('.translation.language-' + args.markerName))[0];
                    inputField.focus();
                });
            }
        };
    }])
    
    .factory('languageMarkersFactory', [ '$http', '$q' , 'languageService', function($http, $q, languageService) {
            
        var getMarkerFromLanguage = function(language, i) {
            var markerLocation = ( typeof i === "undefined" ) ? language.location : language.location[i];
            if(typeof markerLocation !== "undefined") {
                var languageName = languageService.getLanguageName(language),
                    languageCode = languageService.getLanguageCode(language);
                var languageCodeLocal = ( typeof i === "undefined" ) ? languageCode : languageCode + '_' + i;
                var languageIcon = {
                    className: 'language-label',
                    html: '<div class="translation-container empty" data-language="' + languageCode + '" data-languagename="' + languageName + '">' +
                          '<div contenteditable="true" class="translation language-' + languageCodeLocal + '""></div>' +
                          '<div class="placeholder">' + languageName + '</div>' +
                          '<a href="#" role="button">Go</a>' +
                          '</div>',
                    type: 'div'
                };
                var marker = {
                    clickable: true,
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
                            var marker = getMarkerFromLanguage(language, i);
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
            getLanguageMarkersPromise: function() {
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
    
    .directive('translationContainer', function() {
        
        return {
            replace: false,
            restrict: 'C',
            scope: true,
            template: '<div contenteditable="true" class="translation language-{{languageCode}}" ng-click="onTextClick()"></div><div class="placeholder" ng-click="onPlaceHolderClick()">{{languageName}}</div><a href="#" role="button" ng-click="onButtonClick()">Go</a>',
            link: function(scope, element, attrs) {
                console.log('directive link');
                scope.languageCode = attrs.language;
                scope.languageName = attrs.languagename;
                scope.onPlaceholderClick = function(event) {
                   console.log('clicked on placeholder');
                   var container = element.parentElement;
                   //var input = element;
                   //input.blur(); // Without previously blurring the field, focusing it would mysteriously not work
                   //element[0].blur();
                   element[0].focus();
                };
                scope.onTextClick = function(event) {
                    console.log('clicked on input field');
                    //this.blur(); // Without previously blurring the field, focusing it would mysteriously not work
                    element[0].focus();
                };
                scope.onButtonClick = function(event) {
                    console.log('clicked on button');
                    var container = element.parentElement;
                    var input = element;
                    var sourceLanguage = container.getAttribute('data-language');
                    polyglot.translation.translate({
                        from: sourceLanguage,
                        text: input.innerText,
                        callback: function(options) {
                            if(options.to && options.translatedText) {
                                var elements = document.querySelectorAll('.translation.language-' + options.to);
                                for(var j in elements) {
                                    var elem = elements.item(j);
                                    if(elem) {
                                        elem.innerHTML = options.translatedText;
                                    }
                                }
                            }
                        }
                    });
                };
                /*element.bind('click', function() {
                    scope.onPlaceholderClick();
                });*/
            },
            controller: function($scope, $element) {
               $scope.$on('leafletDirectiveMarker.click', function(event, args) {
                    console.log( 'marker name: ' + $scope.markers[args.markerName]);
                    $scope.onPlaceholderClick();
                });
            }
        };
               
    })
    
    ;
