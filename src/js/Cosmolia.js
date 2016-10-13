import Scroll from './Cosmolia/Renderers/Scroll.js';
import ScrollThumb from './Cosmolia/Renderers/ScrollThumb.js';

import POSITIONS from './Cosmolia/Positions.js';
import DIRECTIONS from './Cosmolia/Directions.js';

class Cosmolia {

    /* @PRAGMA Initialization =============================================== */

    //@TODO Map the redenrers and use string for the default ones and references for external ones
    //@TODO Not needed for ES kept for documenting

    // parent = null;
    // images = null;
    // selectedIndex = 0;
    // renderer = null;
    // parser = null;
    // hasControlButtons = null;
    // pauseOnHover = null;
    // interval = null;
    // animationSpeed = null;
    // fixedProportion = null;
    // relativeProportion = null;
    // direction = null; //VERTICAL; HORIZONTAL;
    // directionDictionary = null;
    // data = null;
    // carousel = null;
    // carouselPosition = null; //TOP; RIGHT; BOTTOM; LEFT;
    // carouselFixedProportion = null;
    // carouselRelativeProportion = null;
    // items = null;
    // paused = null;
    // reseponsive = null;
    // offset = null;
    // carouselOffset = null;
    // timer = null;
    // html = null;
    // started = false;
    // rendering = null;

    constructor(parent, opts) {
        opts = opts || {};

        this.data = {};
        this.html = {};
        this.images = [];
        this.rendering = true;
        this.started = false;
        this.parent = jQuery(parent);
        this.autoplay = opts.autoplay !== false;
        this.parser = opts.parser || null;
        
        this.initResponsive();
        this.parseImages();
        this.buildLayout();
        this.layout(opts);

        if (this.autoplay) 
            this.start();
    }
    

    /* @PRAGMA Basic Encapsulation ========================================== */

    setRenderer(renderer) {
        this.renderer = renderer;
        this.layoutImages();
    }

    setImages(images) {
        this.images = images;
        if (this.carousel) {
            this.carousel.setImages(images);
        }
        this.selectedIndex = 0;
        this.layoutImages();
    }

    addImage(image) {
        this.images.push(image);
        this.layoutImages();
    }

    clearImages() {
        this.images = [];
        if (this.carousel) {
            this.carousel.setImages(this.images);
        }
        this.selectedIndex = 0;
        this.layoutImages();
    }

    setShowInfo(isVisible) {
        this.showInfo = isVisible;
        if (isVisible) {
            this.html.wrapper.removeClass('cosmolia-st-no-info');
        } else {
            this.html.wrapper.addClass('cosmolia-st-no-info');
        }
    }

    setShowCounter(isVisible) {
        this.showCounter = isVisible;
        if (this.showCounter) {
            this.html.wrapper.removeClass('cosmolia-st-no-counter');
        } else {
            this.html.wrapper.addClass('cosmolia-st-no-counter');
        }
    }

    setPauseOnHover(shouldPause) {
        if (this.pauseOnHover == shouldPause) {
            return;
        }
        this.pauseOnHover = shouldPause;
        this.html.imagesSpan.off('mouseenter.cosmolia');
        this.html.imagesSpan.off('mouseleave.cosmolia');
        if (shouldPause && this.autoplay) {
            this.html.wrapper.on('mouseenter.cosmolia', this.pausePlay.bind(this));
            this.html.wrapper.on('mouseleave.cosmolia', this.continuePlay.bind(this));
        }
    }

    setCarouselPosition(position) {
        if (position) {
            this.carouselPosition = position;
            var carousel = this.getCarousel();
            carousel.haltRendering();

            if (position & POSITIONS.BOTTOM) {
                this.html.wrapper.append(carousel.html.wrapper);
                this.carousel.setDirection(DIRECTIONS.HORIZONTAL);
                this.carousel.setProportion(this.carouselFixedProportion, this.carouselRelativeProportion);
            } else if (position & POSITIONS.TOP) {
                this.html.wrapper.prepend(carousel.html.wrapper);
                this.carousel.setDirection(DIRECTIONS.HORIZONTAL);
                this.carousel.setProportion(this.carouselFixedProportion, this.carouselRelativeProportion);
            } else if (position & (DIRECTIONS.LEFT | DIRECTIONS.RIGHT) ) {
                this.html.wrapper.append(carousel.html.wrapper);
                this.carousel.setDirection(DIRECTIONS.VERTICAL);
                this.carousel.setProportion('100%');
            }

            this.placeCarousel();

            this.html.wrapper.removeClass('cosmolia-cp-top cosmolia-cp-right cosmolia-cp-bottom cosmolia-cp-left');
            this.html.wrapper.addClass('cosmolia-cp-'+position);
            carousel.resumeRendering();
            carousel.layoutImages();
        } else {
            this.html.wrapper.removeClass('cosmolia-cp-top cosmolia-cp-right cosmolia-cp-bottom cosmolia-cp-left');
            this.carouselPosition = null;
            this.placeCarousel();
            if (this.carousel) {
                this.carousel.html.wrapper.detach();
            }
        }

    }

    setHasControllButtons(isVisible) {
        this.hasControlButtons = isVisible;
        if (this.hasControlButtons) {
            this.html.prevButton.show();
            this.html.nextButton.show();
        } else {
            this.html.prevButton.hide();
            this.html.nextButton.hide();
        }
    }

    setSlideData(slide, index) {
        var image = this.images[index];
        if (image) {
            slide.css('background-image', "url('"+image.src+"')");
            slide.find('.cosmolia-item-title').text(image.title);
            slide.find('.cosmolia-item-description').text(image.description);
            slide.find('.cosmolia-item-counter').text(index+1 + ' / ' + this.images.length);

            slide.off('click.cosmolia');
            if (this.onImageClick) {
                slide.attr('href', 'javascript:;');
                slide.on('click.cosmolia', this.imageWasClicked.bind(this, index, image));
            } else if (image.link) {
                slide.attr('href', image.link);
            } else {
                slide.removeAttr('href');
            }

        }
    }

    setProportion(fixedProportion, relativeProportion) {
        this.fixedProportion = fixedProportion;
        this.relativeProportion = relativeProportion;
        if (!fixedProportion && !relativeProportion) {
            //Do nothing
        } else if (fixedProportion != null) {
            this.html.imagesHolder.css({
                'padding-bottom': 0,
                'height' : fixedProportion
            });
            if (fixedProportion.indexOf('%') > -1) {
                this.html.wrapper.css({
                    width: '100%',
                    position: 'absolute',
                    height: '100%'
                });
            } else {
                this.html.wrapper.css({
                    width: '',
                    position: '',
                    height: ''
                });
            }
        } else if (relativeProportion != null) {
            this.html.imagesHolder.css({
                'padding-bottom': (100*relativeProportion)+'%',
                'height' : 0
            });
            this.html.wrapper.css({
                width: '',
                position: '',
                height: ''
            });
        }
    }

    setCarouselProportion(fixedProportion, relativeProportion) {
        this.carouselFixedProportion = fixedProportion;
        this.carouselRelativeProportion = relativeProportion;
        if (this.carousel) {
            if (this.carouselPosition & (POSITIONS.LEFT | POSITIONS.RIGHT)) {
                this.placeCarousel();
            } else {
                this.carousel.setProportion(fixedProportion, relativeProportion);
            }

        }
    }

    setItems(items) {
        this.html.wrapper.removeClass('cosmolia-cp-items-1 cosmolia-cp-items-2 cosmolia-cp-items-3 cosmolia-cp-items-4');
        this.html.wrapper.addClass('cosmolia-cp-items-'+items);
        this.items = items;
        this.itemsWidth = (100/items);
        this.layoutImages();
    }

    setCarouselItems(items) {
        this.carouselItems = items;
        if (this.carousel) {
            this.carousel.setItems(items);
        }
    }

    setOffset(offset) {
        this.offset = offset;
        if (this.rendering) {
            this.renderer.switchTo(this, this.selectedIndex);
        }
    }

    setCarouselOffset(offset) {
        if (this.carousel) {
            this.carousel.setOffset(offset);
        }
    }

    setInterval(interval) {
        this.interval = interval;
        if (this.started) {
            var pausedWas = this.paused;
            this.stop();
            this.start();
            this.paused = pausedWas;
        }
    }

    setAnimationSpeed(animationSpeed) {
        this.animationSpeed = animationSpeed;
    }

    setDirection(direction) {
        if (!direction)
            return;

        this.direction = direction;

        if (this.renderer) 
            this.renderer.willRotate(this);
        
        if (direction == DIRECTIONS.VERTICAL)
            this.directionDictionary = {'left': 'top', 'width': 'height'};
        else if (direction == DIRECTIONS.HORIZONTAL)
            this.directionDictionary = {'left': 'left', 'width': 'width'};
    }

    setOnImageClick(callback) {
        if (this.onImageClick != null && callback != null) {
            this.onImageClick = callback;
        } else if (this.onImageClick != callback) {
            this.onImageClick = callback;
            this.layoutImages();
        }
    }

    setImageContain(enabled) {
        this.imageContain = enabled;
        if (enabled) {
            this.html.wrapper.addClass('cosmolia-images-style-contain');
        } else {
            this.html.wrapper.removeClass('cosmolia-images-style-contain');
        }
    }

    setResponsive(responsive) {
        if (responsive && !this.isResponsiveSet) {
            jQuery(window).on('resize', this.responsiveHandler);
            this.lastWindowSize = 0;
            this.isResponsiveSet = true;
            this.onWindowResizeResponsive();
        } else if (this.isResponsiveSet) {
            jQuery(window).off('resize', this.responsiveHandler);
            this.isResponsiveSet = false;
            this.calculateImagesVisibility(10000000);
        }
    }

    initResponsive() {
        this.responsiveHandler = this.onWindowResizeResponsive.bind(this);
    }

    onWindowResizeResponsive() {
        var newWidth = jQuery(window).width();
        this.calculateImagesVisibility(newWidth);
    }

    calculateImagesVisibility(newWidth) {
        if (this.lastWindowSize != 1 && newWidth < 769) {
            this.lastWindowSize = 1;
            this.setItems(1);
        } else if (this.lastWindowSize != 2 && newWidth > 768) {
            this.lastWindowSize = 2;
            this.setItems(3);
        }
    }

    /* @PRAGMA Layout Organization ========================================== */

    buildLayout() {

        var wrapper = jQuery('<div class="cosmolia-wrapper"></div>');
        var imagesPositioner = jQuery('<div class="cosmolia-images-positioner"></div>');
        var imagesHolder = jQuery('<div class="cosmolia-images-sizer"></div>');
        var imagesTube = jQuery('<div class="cosmolia-images-tube"></div>');
        var imagesSpan = jQuery('<div class="cosmolia-images-span"></div>');

        wrapper.append(imagesPositioner);
        imagesPositioner.append(imagesHolder);
        imagesHolder.append(imagesTube);
        imagesTube.append(imagesSpan);

        var prevButton = jQuery('<a href="javascript:;" class="cosmolia-prev"></a>');
        var nextButton = jQuery('<a href="javascript:;" class="cosmolia-next"></a>');
        imagesTube.append(prevButton);
        imagesTube.append(nextButton);

        prevButton.on('click', this.prev.bind(this));
        nextButton.on('click', this.next.bind(this));

        this.html.wrapper = wrapper;
        this.html.imagesPositioner = imagesPositioner;
        this.html.imagesHolder = imagesHolder;
        this.html.imagesTube = imagesTube;
        this.html.imagesSpan = imagesSpan;
        this.html.prevButton = prevButton;
        this.html.nextButton = nextButton;

        this.parent.empty();
        this.parent.append(wrapper);
    }

    layout(opts) {
        opts = opts || {};

        this.haltRendering();

        this.setDirection(opts.direction || DIRECTIONS.HORIZONTAL);
        this.setRenderer(opts.renderer || Scroll);
        this.setInterval(opts.interval || 4000);
        this.setAnimationSpeed(opts.animationSpeed || 300);
        this.setCarouselProportion(opts.carouselFixedProportion, opts.carouselRelativeProportion||0.25);
        this.setItems(opts.items || 1);
        this.setShowInfo(opts.showInfo !== false);
        this.setShowCounter(opts.showCounter !== false);
        this.setPauseOnHover(opts.pauseOnHover !== false);
        this.setCarouselPosition(opts.carouselPosition || null);
        this.setHasControllButtons(opts.hasControllButtons !== false);
        this.setProportion(opts.fixedProportion, opts.relativeProportion);
        this.setCarouselItems(opts.carouselItems || 3);
        this.setOffset(opts.offset || 0);
        this.setCarouselOffset(opts.carouselOffset || -1);
        this.setOnImageClick(opts.onImageClick || null);
        this.setImageContain(!!opts.imageContain);
        this.setResponsive(!!opts.responsive);

        this.resumeRendering();

        this.layoutImages();
    }

    layoutImages() {
        if (this.rendering) {
            this.renderer.layout(this);
        }
    }

    createSlide() {
        var slide = jQuery('<a class="cosmolia-item"></a>');
        var meta = jQuery('<div class="cosmolia-item-meta"></div>');
        var title = jQuery('<div class="cosmolia-item-title"></div>');
        var description = jQuery('<div class="cosmolia-item-description"></div>');
        var counter = jQuery('<div class="cosmolia-item-counter"></div>');

        slide.append(meta);
        meta.append(counter);
        meta.append(title);
        meta.append(description);

        return slide;
    }

    getCarousel() {
        if (this.carousel) {
            this.carousel.setImages(this.images);
            return this.carousel;
        }

        this.carousel = new Cosmolia(null, {
            fixedProportion: this.carouselFixedProportion,
            relativeProportion: this.carouselRelativeProportion,
            autoplay: false,
            renderer: ScrollThumb,
            carouselPosition: null,
            showInfo: false,
            showCounter: false,
            hasControllButtons: false,
            pauseOnHover: false,
            items: this.carouselItems,
            onImageClick: this.moveTo.bind(this)
        });
        this.carousel.setImages(this.images);
        return this.carousel;
    }

    /* @PRAGMA Default Parser =============================================== */

    parseImages() {
        if (this.parser) {
            this.parser(this.parent, this.images);
            return null;
        }

        var images = this.parent.find('img');
        var result = [];
        for (var i=0; i<images.length; i++) {
            var image = jQuery(images[i]);
            var source = image.attr('src');
            result.push({
                src: source,
                title: image.attr('title'),
                description: '',
                link: source
            });
        }

        this.images = result;
        if (this.carousel) {
            this.carousel.images = result;
        }

    }

    /* @PRAGMA Internal Control Functions =================================== */

    imageWasClicked(index, image) {
        this.onImageClick(index, image);
    }

    getNextIndex() {
        return this.moduloIndex(this.selectedIndex+1);
    }

    getPreviousIndex() {
        return this.moduloIndex(this.selectedIndex-1);
    }

    moduloIndex(index) {
        if (index < 0) {
            while(index < 0 && this.images.length > 0) {
                index += this.images.length;
            }
        }

        return Math.abs(index%this.images.length);
    }

    evaluateCarouselProportion() {
        if (this.carouselFixedProportion != null) {
            return this.carouselFixedProportion;
        } else if (this.carouselRelativeProportion != null) {
            return (this.carouselRelativeProportion*100)+'%';
        }
        return '50px;'
    }

    placeCarousel() {
        var position = this.carouselPosition;
        var factor = this.evaluateCarouselProportion();
        var margins = {'margin-left':'0', 'margin-right':'0'};
        var width = '';
        if (position & POSITIONS.LEFT) {
            margins['margin-right'] = factor;
            width = factor;
        }
        if (position & POSITIONS.RIGHT) {
            margins['margin-left'] = factor;
            width = factor;
        }
        
        this.html.imagesPositioner.css(margins);

        if (this.carousel) {
            this.carousel.html.wrapper.css('width', width);
        }
    }

    /* @PRAGMA Control Functions ============================================ */

    switchTo(index) {
        this.renderer.switchTo(this, index);
    }

    moveTo(index) {
        this.renderer.moveTo(this, index);
    }

    next() {
        this.renderer.next(this);
    }

    prev() {
        this.renderer.prev(this);
    }

    start() {
        if (this.started) {
            return;
        }
        this.timer = setInterval(this.step.bind(this), this.interval);
        this.started = true;
        this.paused = false;
    }

    stop() {
        clearInterval(this.timer);
        this.started = false;
        this.paused = true;
    }

    pausePlay() {
        this.paused = true;
    }

    continuePlay() {
        this.paused = false;
    }

    step() {
        if (!this.paused) {
            this.next();
        }
    }

    /* @PRAGMA Renderer Delegate Implementations ============================ */

    willStartSwitchingSlide(toIndex, animated) {
        this.selectedIndex = toIndex || 0;
        if (this.carousel) {
            if (animated) {
                this.carousel.moveTo(toIndex);
            } else {
                this.carousel.switchTo(toIndex);
            }
        }

        //This logic should be moved inside the renderers
        this.clearActiveSlide();
    }

    didEndSwitchingSlide(toIndex, animated) {
        //This logic should be moved inside the renderers
        this.markActiveSlide(toIndex);
    }

    /* @PRAGMA Rendere Controll ============================================= */

    haltRendering() {
        this.rendering = false;
    }

    resumeRendering() {
        this.rendering = true;
    }

    /* @PRAGMA Mark Active Slide ============================================ */

    clearActiveSlide() {
        //This logic should be moved inside the renderers
        this.html.imagesSpan.find('.cosmolia-active-slide').removeClass('cosmolia-active-slide');
    }

    markActiveSlide(index) {
        //This logic should be moved inside the renderers
        var element = this.getSlideFromCache(index);
        if (element)
            element.addClass('cosmolia-active-slide');
    }

    /* @PRAGMA Slide Caching for The renderer =============================== */

    resetSlideCache() {
        this.data.slideCaches = {};
    }

    addSlideToCache(index, slide) {
        this.data.slideCaches['cache_' + index] = slide;
    }

    getSlideFromCache(index) {
        if (this.data.slideCaches['cache_' + index])
            return this.data.slideCaches['cache_' + index];
    }

}

if (jQuery)
jQuery.fn.Cosmolia = function( methodOrOptions ) {

    if (!jQuery(this).length) {
        return jQuery(this);
    }

    var instance = jQuery(this).data('Cosmolia');
        
    // CASE: action method (public method on PLUGIN class)        
    if ( instance 
            && methodOrOptions.indexOf('_') != 0 
            && instance[ methodOrOptions ] 
            && typeof( instance[ methodOrOptions ] ) == 'function' ) {
        
        return instance[ methodOrOptions ]( Array.prototype.slice.call( arguments, 1 ) ); 
            
            
    // CASE: argument is options object or empty = initialise            
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        instance = new Cosmolia( jQuery(this), methodOrOptions );    // ok to overwrite if this is a re-init
        jQuery(this).data( 'Cosmolia', instance );
        return jQuery(this);
    
    // CASE: method called before init
    } else if ( !instance ) {
        jQuery.error( 'Cosmolia must be initialised before using method: ' + methodOrOptions );
    
    // CASE: invalid method
    } else {
        jQuery.error( 'Method ' +  methodOrOptions + ' does not exist.' );
    }
}

if (window)
window.Cosmolia = Cosmolia;

export default Cosmolia;