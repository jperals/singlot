var polyglot = polyglot || {};
var translation = translation || {};
var languageUtils = languageUtils || {};

(function() {
    var jsonp = {
        callbackCounter: 0,

        fetch: function(url, callback) {
            var fn = 'JSONPCallback_' + this.callbackCounter++;
            window[fn] = this.evalJSONP(callback);
            url = url.replace('=JSONPCallback', '=' + fn);

            var scriptTag = document.createElement('SCRIPT');
            scriptTag.src = url;
            document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
        },

        evalJSONP: function(callback) {
            return function(data) {
                var validJSON = false;
            if (typeof data === "string") {
                try {validJSON = JSON.parse(data);} catch (e) {
                    /*invalid JSON*/}
            } else {
                validJSON = JSON.parse(JSON.stringify(data));
                    window.console && console.warn(
                    'response data was not a JSON string');
                }
                if (validJSON) {
                    callback(validJSON);
                } else {
                    throw("JSONP call returned invalid or empty JSON");
                }
            };
        }
    };
    
    polyglot.translation = {
        translate: function(options) {
            var sourceLanguageCode = options.from;
            if(typeof options.to === "undefined") {
                for(var i = 0; i < translation.languages.length; i++) {
                    var language = translation.languages[i];
                    if(typeof language.location !== "undefined" && sourceLanguageCode !== languageUtils.getLanguageCode(language)) {
                        this.translate({
                            from: options.from,
                            text: options.text,
                            to: languageUtils.getLanguageCode(language),
                            callback: options.callback
                        });
                    }
                }
            }
            else {
                var translatedText = "";
                var targetLanguageCode = options.to;
                var url = "http://glosbe.com/gapi/translate?from=" + sourceLanguageCode + "&dest=" + targetLanguageCode + "&format=json&phrase=" + options.text + "&callback=JSONPCallback&pretty=true";
                jsonp.fetch(url, function(data){
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
                });
            }
        }
    };
    
})();
