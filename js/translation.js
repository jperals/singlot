var translation = translation || {};
(function() {
    translation = {
        translate: function(options) {
            if(typeof options.to === "undefined") {
                for(var i in translation.languages) {
                    var language = translation.languages[i];
                    translation.translate({
                        from: options.from,
                        text: options.text,
                        to: language
                    });
                }
            }
            else {
                var translationRequest = new XMLHttpRequest();
                translationRequest.open("GET", "http://glosbe.com/gapi/translate?from=" + options.from.code + "&dest=" + options.to.code + "format=json&phrase=" + options.text, false);
                var elem = document.querySelector('.translation.language-' + options.to.code);
                translationRequest.onload = function() {
                    if(elem !== null) {
                        elem.value = JSON.parse(translationRequest.responseText).tuc.phrase.text;
                    }
                };
                translationRequest.send(null);
            }
        }
    };
})();
