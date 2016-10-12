Cosmolia.Renderers.Slide = Object.create(Cosmolia.Renderers.Opacity);
Cosmolia.Renderers.Slide.change = function(gallery, index, animated, direction) {
    var old = gallery.getSlideFromCache(gallery.selectedIndex);
    gallery.willStartSwitchingSlide(index, animated);
    var elem = gallery.getSlideFromCache(index);
    if (elem) {
        if (animated) {
            var css = {opacity: 0};
            css[gallery.directionDictionary.left] = (direction*100)+'%';
            elem.css(css);

            gallery.html.imagesSpan.append(elem);

            var css = {opacity: 1};
            css[gallery.directionDictionary.left] = 0;
            elem.animate(css, gallery.animationSpeed, gallery.didEndSwitchingSlide(gallery, index, animated));
        } else {
            var css = {opacity: 1};
            css[gallery.directionDictionary.left] = 0;
            gallery.html.imagesSpan.append(elem);
            elem.css(css);
            gallery.didEndSwitchingSlide(index, animated);

        }
    }

    if (old && old != elem) {
            if (animated) {
                old.animate({
                    opacity: 0
                }, gallery.animationSpeed);
            } else {
                old.css({opacity: 0});
            }
        }
};