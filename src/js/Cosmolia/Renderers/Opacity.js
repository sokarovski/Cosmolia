Cosmolia.Renderers.Opacity = {

    willRotate: function(gallery) {
        'use strict';

        gallery.html.imageSpan.css(gallery.directionDictionary.left, null);
    },

    layout: function(gallery) {
        'use strict';

        gallery.html.imagesSpan.empty();
        gallery.resetSlideCache();
        for (var i=0; i<gallery.images.length; i++) {
            var slide = gallery.createSlide();
            var realIndex = gallery.moduloIndex(i);
            gallery.addSlideToCache(i, slide);
            slide.css('opacity', 0);
            gallery.setSlideData(slide, realIndex);
            gallery.html.imagesSpan.append(slide);
        }
        this.switchTo(gallery, gallery.selectedIndex);
    },

    next: function(gallery) {
        'use strict';

        var index = gallery.getNextIndex();
        this.change(gallery, index, true, -1);
    },

    prev: function(gallery) {
        'use strict';

        var index = gallery.getPreviousIndex();
        this.change(gallery, index, true, 1);
    },

    moveTo: function(gallery, index) {
        'use strict';

        var newIndex = gallery.moduloIndex(index);
        this.change(gallery, newIndex, true, 0);
    },

    switchTo: function(gallery, index) {
        'use strict';

        var newIndex = gallery.moduloIndex(index);
        this.change(gallery, newIndex, false);
    },

    change: function(gallery, index, animated) {
        'use strict';

        var old = gallery.getSlideFromCache(gallery.selectedIndex);
        gallery.willStartSwitchingSlide(index, animated);
        var elem = gallery.getSlideFromCache(index);
        if (elem) {
            if (animated) {
                elem.css({
                   opacity: 0
                });
                gallery.html.imagesSpan.append(elem);
                elem.animate({
                   opacity: 1
                }, gallery.animationSpeed ,gallery.didEndSwitchingSlide(gallery, index, animated));
            } else {
                gallery.html.imagesSpan.append(elem);
                elem.css({
                   opacity: 1
                });
                gallery.didEndSwitchingSlide(index, animated);
            }
        }

        if (old && old != elem) {
            if (animated) {
                old.delay(300).animate({
                    opacity: 0
                }, gallery.animationSpeed-300);
            } else {
                old.css({opacity: 0});
            }
        }
    }

};