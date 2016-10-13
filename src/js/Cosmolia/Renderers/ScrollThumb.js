import Scroll from './Scroll.js';

var ScrollThumb = Object.create(Scroll);
ScrollThumb.layout = function(gallery) {
    gallery.html.imagesSpan.empty();
    var start = 0;
    var length = gallery.images.length;
    gallery.resetSlideCache();
    for (var i=start; i<length; i++) {
        var slide = gallery.createSlide();
        var realIndex = gallery.moduloIndex(i);
        gallery.addSlideToCache(i, slide);
        slide.css(gallery.directionDictionary.width, gallery.itemsWidth+'%');
        slide.css(gallery.directionDictionary.left, (i*gallery.itemsWidth)+'%' );
        gallery.setSlideData(slide, realIndex);
        gallery.html.imagesSpan.append(slide);
    }
    this.switchTo(gallery, gallery.selectedIndex);
}

export default ScrollThumb;