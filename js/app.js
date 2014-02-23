var translation = translation || {};
(function() {
    var map;
    var initMap = function() {
        var cloudmadeUrl = 'http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',
        cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18});
        map = new L.Map('map', {layers: [cloudmade], center: new L.LatLng(52.5, 2), zoom: 4 });
    };
    var loadData = function() {
        var xhReq = new XMLHttpRequest();
        xhReq.open("GET", "data/languages.json", false);
        xhReq.onload = function() {
            onDataLoad(xhReq.responseText);
        };
        xhReq.send(null);
    };
    var onDataLoad = function(data) {
        var languages = JSON.parse(data);
        translation.languages = languages;
        for(var index in languages) {
            var language = languages[index];
            addLanguageTag(language);
        }
    };
    var addLanguageTag = function(language) {
        //console.log('language: ' + JSON.stringify(language));
        if(typeof language.speakers !== "undefined" && typeof language.location !== "undefined") {
            //console.log('language: ' + language.name);
            var languageIcon = L.divIcon({
                className: 'language-label',
                html: '<input type="text" class="translation language-' + language.code + '" placeholder="' + language.name + '" /><a href="#" role="button">Go</a>'
            });
            var marker = L.marker([language.location.lat, language.location.lon], {
                icon: languageIcon,
                title: 'Write something in ' + language.name
            });
            var onClick = function(event) {
                var e = document.querySelector('.translation.language-' + this.language.code);
                e.classList.add('active');
                e.focus();
                var button = e.parentElement.querySelector('a[role="button"]');
                var language = this.language;
                var originalValue = e.value;
                e.onblur = function() {
                    e.classList.remove('active');
                    if(e.value !== originalValue) {
                        translation.translate({
                            from: language,
                            text: e.value,
                            callback: function(options) {
                                if(options.to && options.translatedText) {
                                    var elem = document.querySelector('.translation.language-' + options.to.code);
                                    if(elem) {
                                        elem.value = options.translatedText;
                                    }
                                }
                            }
                        });
                    }
                };
                button.onclick = function() {
                    e.blur();
                };
            };
            marker.language = language;
            marker.on('click', onClick);
            if(typeof map !== "undefined") {
                marker.addTo(map);
            }
            else {
                console.log('map is undefined');
            }
        }
    };
    window.onload = function() {
        initMap();
        loadData();
    };
})();
