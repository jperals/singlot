var languageUtils = languageUtils || {};

(function() {

    var visitorLanguage = "en";

    languageUtils = {
        getLanguageCode: function(language) {
            var languageCode;
            if(language.codes) {
                languageCode = language.codes["639-3"] || language.codes["639-2"] || language.codes["639-1"];
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
    
})();
