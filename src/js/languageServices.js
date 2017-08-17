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
                languages = response.filter(function(element) {
                    return element.location instanceof Object;
                });
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

    .service('translationService', ['languageService', '$http', '$q', function(languageService, $http, $q) {
        return {
            translate: function(options) {
                var sourceLanguageCode = options.from;
                var translatedText = "";
                var targetLanguageCode = options.to;
                var key = "trnsl.1.1.20170817T153125Z.41ce8b796687d241.b6943d3e38540a8f8644a70eda34250c47a2c98a";
                var url = "https://translate.yandex.net/api/v1.5/tr.json/translate"
                    + "?key=" + key
                    + "&text=" + options.text
                    + "&lang=" + sourceLanguageCode + "-" + targetLanguageCode
                    + "&callback=JSON_CALLBACK";
                var deferred = $q.defer();

                $http.jsonp(url)
                    .success(function successCallback(response) {
                        if(response.code === 200 && response.text instanceof Array) {
                            translatedText = response.text[0];
                        }
                        else {
                            translatedText = "";
                            console.warn('Couldn\'t translate this text from ' + sourceLanguageCode + ' to ' + targetLanguageCode + ': "' + options.text + '"');
                        }
                        deferred.resolve({
                            translatedText: translatedText,
                            to: options.to
                        });
                    })
                    .error(function errorCallback(response) {
                        translatedText = "";
                        console.warn('Couldn\'t translate this text from ' + sourceLanguageCode + ' to ' + targetLanguageCode + ': "' + options.text + '"');
                        deferred.resolve({
                            translatedText: "",
                            to: options.to
                        });
                    });

            return deferred.promise;
            }
        };
    }])

;
