var polyglot = polyglot || {};
polyglot.translation = polyglot.translation || {};

(function() {
        
    polyglot.ui = {
        
        addLanguageTag: function(language, markerLocation) {
            var markerLocation = markerLocation || language.location;
            if(typeof markerLocation !== "undefined") {
                //console.log('location: ' + JSON.stringify(markerLocation));
                var languageName = languageUtils.getLanguageName(language);
                var languageCode = languageUtils.getLanguageCode(language);
                var languageIcon = L.divIcon({
                    className: 'language-label',
                    html: '<div class="translation-container empty" data-language="' + languageCode + '"><div contenteditable="true" class="translation language-' + languageCode + '"></div><div class="placeholder">' + languageName + '</div><a href="#" role="button">Go</a></div>'
                });
                var marker = L.marker([markerLocation.lat, markerLocation.lon], {
                    clickable: false,
                    icon: languageIcon,
                    title: 'Write something in ' + languageName
                });
                marker.language = language;
                   /*marker.on('click', onClick);*/
                   if(typeof this.map !== "undefined") {
                       marker.addTo(this.map);
                   }
                   else {
                       window.console && console.warn('Variable map is undefined. Could not initialize Leaflet map');
                   }
              }
        },
        
        initInteractions: function() {
            var onPlaceholderClick = function(event) {
                console.log('clicked on placeholder');
                var container = this.parentElement;
                var input = container.querySelector('.translation');
                input.blur(); // Without previously blurring the field, focusing it would mysteriously not work
                input.focus();
            };
            var onTextClick = function(event) {
                console.log('clicked on input field');
                this.blur(); // Without previously blurring the field, focusing it would mysteriously not work
                this.focus();
            };
            var onButtonClick = function(event) {
                console.log('clicked on button');
                var container = this.parentElement;
                var input = container.querySelector('.translation');
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
            var translationTags = document.querySelectorAll('.translation-container');
            for(var i in translationTags) {
                var tag = translationTags.item(i);
                var input = tag.querySelector('.translation');
                if(input) {
                    input.onclick = onTextClick;
                }
                var placeholder = tag.querySelector('.placeholder');
                if(placeholder) {
                    placeholder.onclick = onPlaceholderClick;
                }
                var button = tag.querySelector('a[role="button"]');
                if(button) {
                    button.onclick = onButtonClick;
                }
            }
        }
        
    };
})();
