var polyglot = polyglot || {};    

(function() {
        
    polyglot.interface = {
        
        addLanguageTag: function(language, markerLocation) {
            var markerLocation = markerLocation || language.location;
            if(typeof markerLocation !== "undefined") {
                //console.log('location: ' + JSON.stringify(markerLocation));
                var languageName = languageUtils.getLanguageName(language);
                var languageCode = languageUtils.getLanguageCode(language);
                var languageIcon = L.divIcon({
                    className: 'language-label',
                    html: '<input type="text" class="translation language-' + languageCode + '" placeholder="' + languageName + '" /><a href="#" role="button">Go</a>'
                });
                var marker = L.marker([markerLocation.lat, markerLocation.lon], {
                    icon: languageIcon,
                    title: 'Write something in ' + languageName
                });
                var onClick = function(event) {
                    var elements = document.querySelectorAll('.translation.language-' + languageUtils.getLanguageCode(this.language));
                    for(var i in elements) {
                        var e = elements.item(i);
                        e.classList.add('active');
                        e.focus();
                        //var button = e.parentElement.querySelector('a[role="button"]');
                        var sourceLanguage = this.language;
                        var originalValue = e.value;
                        e.onblur = function() {
                            console.log('click');
                            e.classList.remove('active');
                            if(e.value !== originalValue) {
                                translation.translate({
                                    from: sourceLanguage,
                                    text: e.value,
                                    callback: function(options) {
                                        if(options.to && options.translatedText) {
                                            var elem = document.querySelector('.translation.language-' + languageUtils.getLanguageCode(options.to));
                                            if(elem) {
                                                elem.value = options.translatedText;
                                            }
                                        }
                                    }
                                });
                            }
                        };
                    }
                };
                marker.language = language;
                marker.on('click', onClick);
                if(typeof this.map !== "undefined") {
                    marker.addTo(this.map);
                }
                else {
                    console.log('map is undefined');
                }
            }
        }
        
    };
})();
