var translation = translation || {};
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
            if (typeof data == "string") {
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
    translation = {
        translate: function(options) {
            if(typeof options.to === "undefined") {
                for(var i = 0; i < translation.languages.length; i++) {
                    var language = translation.languages[i];
                    if(typeof language.location !== "undefined" && options.from.code !== language.code) {
                        translation.translate({
                            from: options.from,
                            text: options.text,
                            to: language,
                            callback: options.callback
                        });
                    }
                }
            }
            else {
                var translatedText = "";
                var url = "http://glosbe.com/gapi/translate?from=" + options.from.code + "&dest=" + options.to.code + "&format=json&phrase=" + options.text + "&callback=JSONPCallback&pretty=true";
                jsonp.fetch(url, function(data){
                    console.log(data);
                    if(typeof data.tuc === "undefined") {
                        elem.value = "";
                    }
                    else {
                        if(data.tuc instanceof Array) {
                            if(data.tuc.length > 0) {
                                translatedText = data.tuc[0].phrase.text;
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
