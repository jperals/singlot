/**
 * Created by joan on 22/12/14.
 */

angular.module('singlot')

    .service('languageService', ['$http', '$q', function($http, $q) {

        var deferred = $q.defer(),
            languages,
            visitorLanguage = "en";

        $http.get('data/languages.json')
            .success(function(response) {
                languages = response;
                deferred.resolve(response);
            })
        ;

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
            },
            getNativeLanguageName: function(language) {
                var languageName;
                var languageCode = this.getSimpleCode(language);
                if(typeof language.name[languageCode] !== 'undefined') {
                    languageName = language.name[languageCode];
                }
                else if(typeof language.name[visitorLanguage] !== 'undefined') {
                    languageName = language.name[visitorLanguage];
                }
                else {
                    languageName = language.name;
                }
                if(typeof languageName === 'object') languageName = languageName[0];
                if(typeof languageName !== 'string') console.log(languageName);
                return languageName;
            },
            getSimpleCode: function(language) {
                var code;
                if(language.code) {
                    code = language.code;
                }
                else if(language.codes) {
                    code = language.codes["639-1"] || language.codes["639-2"] || language.codes["639-3"];
                }
                return code;
            },
            getLanguages: function() {
                return languages;
            },
            getLanguagesPromise: function() {
                return deferred.promise;
            }
        };

    }])

    .service('translationService', ['languageService', '$http', function(languageService, $http) {
        return {
            translate: function(options) {
                var languages = languageService.getLanguages(),
                    sourceLanguageCode = options.from;
                if(typeof languages === "undefined") return;
                if(typeof options.to === "undefined") {
                    for(var i = 0; i < languages.length; i++) {
                        var language = languages[i];
                        if(typeof language.location !== "undefined" && sourceLanguageCode !== languageService.getLanguageCode(language)) {
                            this.translate({
                                from: options.from,
                                text: options.text,
                                to: languageService.getLanguageCode(language),
                                callback: options.callback
                            });
                        }
                    }
                }
                else {
                    var translatedText = "";
                    var targetLanguageCode = options.to;
                    var url = "http://glosbe.com/gapi/translate?from=" + sourceLanguageCode + "&dest=" + targetLanguageCode + "&format=json&phrase=" + options.text + "&callback=JSON_CALLBACK&pretty=true";
                    var that = this;
                    $http.jsonp(url)
                        .success(function(data) {
                            console.log(data);
                            if(typeof data.tuc === "undefined") {
                                elem.value = "";
                            }
                            else {
                                if(data.tuc instanceof Array) {
                                    if(data.tuc.length > 0) {
                                        if(data.tuc[0].phrase) {
                                            translatedText = data.tuc[0].phrase.text;
                                        }
                                    }
                                }
                                else {
                                    translatedText = data.tuc.phrase.text;
                                }
                            }
                            options.callback({
                                to: options.to,
                                translatedText: translatedText
                            });
                        })
                        .error(function(data, status, headers, config) {
                            console.error('There was an error trying to translate this phrase from ' + sourceLanguageCode + ' to ' + targetLanguageCode + ': "' + options.text + '"');
                        });
                }
            }
        };
    }])

;

var translateToAll = function(element) {
    var from = element.parentElement.getAttribute('data-language'),
        text = element.parentElement.children[0].innerText;
    console.log('translate: ' + text);
    var callback = function(options) {
        if(options.to && options.translatedText) {
            var elements = document.querySelectorAll('.translation.language-' + options.to);
            for(var j in elements) {
                var elem = elements.item(j);
                if(elem) {
                    elem.innerHTML = options.translatedText;
                }
            }
        }
    };
    var languageMap = document.querySelector('#map-wrapper');
    var scope = angular.element(languageMap).scope();
    var options = {
        callback: callback,
        from: from,
        text: text
    };
    scope.translate(options);
};
