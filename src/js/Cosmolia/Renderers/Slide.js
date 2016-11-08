Cosmolia.Renderers.Slide = Object.create(Cosmolia.Renderers.Opacity);
Cosmolia.Renderers.Slide.change = function(gallery, index, animated, direction) {
    'use strict';

    var old = gallery.getSlideFromCache(gallery.selectedIndex);
    gallery.willStartSwitchingSlide(index, animated);
    var elem = gallery.getSlideFromCache(index);
    if (elem) {
        var css;

        if (animated) {
            css = {opacity: 0};
            css[gallery.directionDictionary.left] = (direction*100)+'%';
            elem.css(css);

            gallery.html.imagesSpan.append(elem);

            css = {opacity: 1};
            css[gallery.directionDictionary.left] = 0;
            elem.animate(css, gallery.animationSpeed, gallery.didEndSwitchingSlide(gallery, index, animated));
        } else {
            css = {opacity: 1};
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