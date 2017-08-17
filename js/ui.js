/**
 * Created by joan on 22/12/14.
 */

angular.module('singlot')

.directive('singlotMap', ['languageMarkersFactory', 'languageService',
  'translationService',
  function(languageMarkersFactory, languageService, translationService) {
    function selectElementContents(el) {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      template: '<div id="map-wrapper" ng-if="showMap">' +
        '<leaflet center="europe" defaults="defaults" id="map" markers="markers" event-broadcast="events"></leaflet>' +
        '</div>',
      link: function(scope) {
        languageMarkersFactory.getLanguageMarkersPromise().then(function(
          markers) {
          angular.extend(scope, {
            defaults: {
              tileLayer: 'https://api.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoianBlcmFscyIsImEiOiJjajR4NnhwazUwcGdvMzNxbnMzY3Qza3BvIn0.Ae2Eze-ABuDGlilGHthLXQ',
              tileLayerOptions: {
                attribution: 'Translations by <a href="//www.glosbe.com">Glosbe</a> | Map data by © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }
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
          console.log('marker name: ' + args.markerName);
          console.log('marker: ' + $scope.markers[args.markerName]);
          selectElementContents(document.querySelector(
            '.translation.language-' + args.modelName));
        });
        $scope.translateToAll = function(options) {
          var languages = languageService.getLanguages();
          if (typeof languages === 'undefined') return;
          for (var index = 0, nLanguages = languages.length; index <
            nLanguages; index++) {
            var language = languages[index];
            options.to = languageService.getSimpleCode(language);

            translationService.translate(angular.copy(options)).then(
              function(result) {
                if (result.translatedText) {
                  var elements = document.querySelectorAll(
                    '.translation.language-' + result.to);
                  for (var j in elements) {
                    var elem = elements.item(j);
                    if (elem) {
                      elem.innerHTML = result.translatedText;
                    }
                  }
                }
              });
          }
        };
      }
    };
  }
])

// This directive is currently not used
.directive('translationContainer', ['translationService', function(
  translationService) {

  return {
    replace: false,
    restrict: 'C',
    scope: true,
    template: '<div contenteditable="true" class="translation language-{{languageCode}}" ng-click="onTextClick()"></div><div class="placeholder" ng-click="onPlaceHolderClick()">{{languageName}}</div><a href="#" role="button" ng-click="onButtonClick()">Go</a>',
    link: function(scope, element, attrs) {
      scope.languageCode = attrs.language;
      scope.languageName = attrs.languagename;
      scope.onPlaceholderClick = function(event) {
        var container = element.parentElement;
        //var input = element;
        //input.blur(); // Without previously blurring the field, focusing it would mysteriously not work
        //element[0].blur();
        element[0].focus();
      };
      scope.onTextClick = function(event) {
        //this.blur(); // Without previously blurring the field, focusing it would mysteriously not work
        element[0].focus();
      };
      scope.onButtonClick = function(event) {
        var container = element.parentElement;
        var input = element;
        var sourceLanguage = container.getAttribute('data-language');
        translationService.translate({
          from: sourceLanguage,
          text: input.innerText,
          callback: function(options) {
            if (options.to && options.translatedText) {
              var elements = document.querySelectorAll(
                '.translation.language-' + options.to);
              for (var j in elements) {
                var elem = elements.item(j);
                if (elem) {
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
        $scope.onPlaceholderClick();
      });
    }
  };

}])


.factory('languageMarkersFactory', ['$q', 'languageService', function($q,
  languageService) {

  var getMarkerFromLanguage = function(language, i) {
    var markerLocation = (typeof i === "undefined") ? language.location :
      language.location[i];
    if (typeof markerLocation !== "undefined") {
      var languageName = languageService.getLanguageName(language),
        nativeLanguageName = languageService.getNativeLanguageName(
          language),
        languageCode = languageService.getSimpleCode(language);
      var languageCodeLocal = (typeof i === "undefined") ? languageCode :
        languageCode + '_' + i;
      var languageIcon = {
        className: 'language-label',
        html: '<div class="translation-container empty" data-language="' +
          languageCode + '" data-languagename="' + languageName +
          '" data-nativelanguagename="' + nativeLanguageName + '">' +
          '<div contenteditable="true" class="translation language-' +
          languageCodeLocal + '"></div>' +
          '<div class="placeholder">' + nativeLanguageName + '</div>' +
          '<a href="#" onclick="translateToAll(this)" role="button"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></a>' +
          '</div>',
        type: 'div'
      };
      var marker = {
        icon: languageIcon,
        lat: markerLocation.lat,
        lng: markerLocation.lon,
        title: languageName
      };
      marker.language = language;
      return marker;
    }
  };

  var getMarkersFromLanguages = function(languages) {
    var markers = {};
    for (var index = 0, nLanguages = languages.length; index <
      nLanguages; index++) {
      var language = languages[index];
      var location = language.location;
      var marker;
      if (typeof language.name !== "undefined" && typeof location !==
        "undefined") {
        var languageCode = languageService.getSimpleCode(language);
        if (location instanceof Array) {
          for (var i = 0, n = location.length; i < n; i++) {
            marker = getMarkerFromLanguage(language, i);
            markers[languageCode + '_' + i] = marker;
          }
        } else {
          marker = getMarkerFromLanguage(language);
          markers[languageCode] = marker;
        }
      }
    }
    return markers;
  };

  var deferred = $q.defer();

  languageService.getLanguagesPromise().then(function(languages) {
    var markers = getMarkersFromLanguages(languages);
    deferred.resolve(markers);
  });

  return {
    getLanguageMarkersPromise: function() {
      return deferred.promise;
    }
  };

}])

.controller('singlotMapCtrl', ['$scope', '$modal', function($scope, $modal) {
  $scope.openInfoModal = function() {
    var modalInstance = $modal.open({
      templateUrl: 'infoModal.html',
    });
  };
}]);

var translateToAll = function(element) {
  var from = element.parentElement.getAttribute('data-language'),
    text = element.parentElement.children[0].innerText;
  var languageMap = document.querySelector('#map-wrapper');
  var scope = angular.element(languageMap).scope();
  var options = {
    from: from,
    text: text
  };
  document.querySelectorAll('translation-container .translation').forEach(function(translationElement) {
    translationElement.innerText = "";
  });
  scope.translateToAll(options);
};
