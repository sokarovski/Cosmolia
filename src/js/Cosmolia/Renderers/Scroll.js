Cosmolia.Renderers.Scroll = {

    willRotate: function(gallery) {
        gallery.html.imagesSpan.css(gallery.directionDictionary.left, '');
    },

    layout: function(gallery) {
        gallery.html.imagesSpan.empty();
        var start = 0-gallery.items;
        var length = gallery.images.length+gallery.items;
        gallery.resetSlideCache();
        for (var i=start; i<length; i++) {
            var slide = gallery.createSlide();
            var realIndex = gallery.moduloIndex(i);
            slide.css(gallery.directionDictionary.width, gallery.itemsWidth+'%');
            slide.css(gallery.directionDictionary.left, (i*gallery.itemsWidth)+'%' );
            gallery.addSlideToCache(i, slide);
            gallery.setSlideData(slide, realIndex);
            gallery.html.imagesSpan.append(slide);
        }
        this.switchTo(gallery, gallery.selectedIndex);
    },

    next: function(gallery) {
        var oldIndex = gallery.selectedIndex;
        var index = gallery.getNextIndex();
        var through = index <= oldIndex ? oldIndex+1 : null;
        this.change(gallery, index, true, true, through);
    },

    prev: function(gallery) {
        var oldIndex = gallery.selectedIndex;
        var index = gallery.getPreviousIndex();
        var through = index >= oldIndex ? oldIndex-1 : null;
        this.change(gallery, index, true, true, through);
    },

    moveTo: function(gallery, index) {
        var index = gallery.moduloIndex(index);
        this.change(gallery, index, true, true);
    },

    switchTo: function(gallery, index) {
        var index = gallery.moduloIndex(index);
        this.change(gallery, index, false, false);
    },

    change: function(gallery, index, animated, animate, through) {
        gallery.willStartSwitchingSlide(index, animated);
        if (animate) {
            var callback;
            if (through) {
                callback = this.change.bind(this, gallery, index, animated, false);
            } else {
                callback = gallery.didEndSwitchingSlide.bind(gallery, index, animated);
                through = index;
            }
            var hash = {};
            hash[gallery.directionDictionary.left] = (-1*(through+gallery.offset)*gallery.itemsWidth)+'%';
            gallery.html.imagesSpan.animate(hash, gallery.animationSpeed ,callback);
        } else {
            gallery.html.imagesSpan.css(gallery.directionDictionary.left, (-1*(index+gallery.offset)*gallery.itemsWidth)+'%' );
            gallery.didEndSwitchingSlide(index, animated);
        }
    }

};