Cosmolia.Renderers.Basic = {
    
    willRotate: function(gallery) {
        'use strict';

        gallery.html.imageSpan.css(gallery.directionDictionary.left, null);
    },

    layout: function(gallery) {
        'use strict';

        gallery.html.imagesSpan.empty();
        gallery.html.imagesSpan.css('left', '0%');
        var start = 0-gallery.items;
        var length = gallery.images.length+gallery.items;
        gallery.resetSlideCache();
        for (var i=start; i<length; i++) {
            var slide = gallery.createSlide();
            var realIndex = gallery.moduloIndex(i);
            slide.css('width', gallery.itemsWidth+'%');
            slide.css('left', (i*gallery.itemsWidth)+'%' );
            gallery.addSlideToCache(slide, i);
            gallery.setSlideData(slide, realIndex);
            gallery.html.imagesSpan.append(slide);
        }
        this.switchTo(gallery, gallery.selectedIndex);
    },

    next: function(gallery) {
        'use strict';

        var index = gallery.getNextIndex();
        this.change(gallery, index, true);
    },

    prev: function(gallery) {
        'use strict';

        var index = gallery.getPreviousIndex();
        this.change(gallery, index, true);
    },

    moveTo: function(gallery, index) {
        'use strict';

        this.change(gallery, index, true);
    },

    switchTo: function(gallery, index) {
        'use strict';

        this.change(gallery, index, false);
    },

    change: function(gallery, index, animated) {
        'use strict';

        var newIndex = gallery.moduloIndex(index);
        gallery.willStartSwitchingSlide(newIndex, animated);
        gallery.html.imagesSpan.css({'left': (-1*(newIndex+gallery.offset)*gallery.itemsWidth)+'%' });
        gallery.didEndSwitchingSlide(newIndex, animated);
    }

};