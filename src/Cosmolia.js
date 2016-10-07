var Cosmolia = PS.Class({

    /* @PRAGMA Initialization =============================================== */

    parent: null,
    images: null,

    selectedIndex: 0,
    renderer: null,
    parser: null,

    hasControlButtons: null,
    pauseOnHover: null,
    interval: null,
    animationSpeed: null,
    fixedProportion: null,
    relativeProportion: null,
    direction: null, //VERTICAL, HORIZONTAL,
    directionDictionary: null,
    data: null,
    carousel: null,
    carouselPosition: null, //TOP, RIGHT, BOTTOM, LEFT,
    carouselFixedProportion: null,
    carouselRelativeProportion: null,
    items: null,
    paused: null,

    reseponsive: null,

    offset: null,
    carouselOffset: null,

    /* @PRIVATE */
    timer: null,
    html: null,
    started: false,

    rendering: null,

    init: function(parent, opts) {
        opts = opts || {};

        this.data = {};
        this.html = {};
        this.images = [];
        this.rendering = true;
        this.parent = jQuery(parent);
        this.autoplay = opts.autoplay !== false;
        this.parser = opts.parser || null;
        
        this.initResponsive();
        this.parseImages();
        this.buildLayout();
        this.layout(opts);

        if (this.autoplay) {
            this.start();
        }

        console.log(this);
    },

    /* @PRAGMA Basic Encapsulation ========================================== */

    setRenderer: function(renderer) {
        this.renderer = renderer;
        this.layoutImages();
    },

    setImages: function(images) {
        this.images = images;
        if (this.carousel) {
            this.carousel.setImages(images);
        }
        this.selectedIndex = 0;
        this.layoutImages();
    },

    addImage: function(image) {
        this.images.push(image);
        this.layoutImages();
    },

    clearImages: function() {
        this.images = [];
        if (this.carousel) {
            this.carousel.setImages(this.images);
        }
        this.selectedIndex = 0;
        this.layoutImages();
    },

    setShowInfo: function(isVisible) {
        this.showInfo = isVisible;
        if (isVisible) {
            this.html.wrapper.removeClass('cosmolia-st-no-info');
        } else {
            this.html.wrapper.addClass('cosmolia-st-no-info');
        }
    },

    setShowCounter: function(isVisible) {
        this.showCounter = isVisible;
        if (this.showCounter) {
            this.html.wrapper.removeClass('cosmolia-st-no-counter');
        } else {
            this.html.wrapper.addClass('cosmolia-st-no-counter');
        }
    },

    setPauseOnHover: function(shouldPause) {
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
    },

    setCarouselPosition: function(position) {
        if (position) {
            position = position.toLowerCase();
            this.carouselPosition = position;
            var carousel = this.getCarousel();
            carousel.haltRendering();

            if (position == 'bottom') {
                this.html.wrapper.append(carousel.html.wrapper);
                this.carousel.setDirection('HORIZONTAL');
                this.carousel.setProportion(this.carouselFixedProportion, this.carouselRelativeProportion);
            } else if (position == 'top') {
                this.html.wrapper.prepend(carousel.html.wrapper);
                this.carousel.setDirection('HORIZONTAL');
                this.carousel.setProportion(this.carouselFixedProportion, this.carouselRelativeProportion);
            } else if (position == 'left' || position == 'right') {
                this.html.wrapper.append(carousel.html.wrapper);
                this.carousel.setDirection('VERTICAL');
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

    },

    setHasControllButtons: function(isVisible) {
        this.hasControlButtons = isVisible;
        if (this.hasControlButtons) {
            this.html.prevButton.show();
            this.html.nextButton.show();
        } else {
            this.html.prevButton.hide();
            this.html.nextButton.hide();
        }
    },

    setSlideData: function(slide, index) {
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
    },

    setProportion: function(fixedProportion, relativeProportion) {
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
    },

    setCarouselProportion: function(fixedProportion, relativeProportion) {
        this.carouselFixedProportion = fixedProportion;
        this.carouselRelativeProportion = relativeProportion;
        if (this.carousel) {
            if (this.carouselPosition == 'left' || this.carouselPosition == 'right') {
                this.placeCarousel();
            } else {
                this.carousel.setProportion(fixedProportion, relativeProportion);
            }

        }
    },

    setItems: function(items) {
        this.html.wrapper.removeClass('cosmolia-cp-items-1 cosmolia-cp-items-2 cosmolia-cp-items-3 cosmolia-cp-items-4');
        this.html.wrapper.addClass('cosmolia-cp-items-'+items);
        this.items = items;
        this.itemsWidth = (100/items);
        this.layoutImages();
    },

    setCarouselItems: function(items) {
        this.carouselItems = items;
        if (this.carousel) {
            this.carousel.setItems(items);
        }
    },

    setOffset: function(offset) {
        this.offset = offset;
        if (this.rendering) {
            this.renderer.switchTo(this, this.selectedIndex);
        }
    },

    setCarouselOffset: function(offset) {
        if (this.carousel) {
            this.carousel.setOffset(offset);
        }
    },

    setInterval: function(interval) {
        this.interval = interval;
        if (this.started) {
            var pausedWas = this.paused;
            this.stop();
            this.start();
            this.paused = pausedWas;
        }
    },

    setAnimationSpeed: function(animationSpeed) {
        this.animationSpeed = animationSpeed;
    },

    setDirection: function(direction) {
        if (direction != null && direction != undefined) {
            direction = new String(direction).toLowerCase();
            this.direction = direction;

            if (this.renderer) {
                this.renderer.willRotate(this);
            }

            if (direction == 'vertical') {
                this.directionDictionary = {'left': 'top', 'width': 'height'};
            } else {
                this.direction == 'horizontal'
                this.directionDictionary = {'left': 'left', 'width': 'width'};
            }
        }

    },

    setOnImageClick: function(callback) {
        if (this.onImageClick != null && callback != null) {
            this.onImageClick = callback;
        } else if (this.onImageClick != callback) {
            this.onImageClick = callback;
            this.layoutImages();
        }
    },

    setImageContain: function(enabled) {
        this.imageContain = enabled;
        if (enabled) {
            this.html.wrapper.addClass('cosmolia-images-style-contain');
        } else {
            this.html.wrapper.removeClass('cosmolia-images-style-contain');
        }
    },

    setResponsive: function(responsive) {
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
    },

    initResponsive: function() {
        this.responsiveHandler = this.onWindowResizeResponsive.bind(this);
    },

    onWindowResizeResponsive: function() {
        var newWidth = jQuery(window).width();
        this.calculateImagesVisibility(newWidth);
    },

    calculateImagesVisibility: function(newWidth) {
        if (this.lastWindowSize != 1 && newWidth < 769) {
            this.lastWindowSize = 1;
            this.setItems(1);
        } else if (this.lastWindowSize != 2 && newWidth > 768) {
            this.lastWindowSize = 2;
            this.setItems(3);
        }
    },

    /* @PRAGMA Layout Organization ========================================== */

    buildLayout: function() {

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
    },

    layout: function(opts) {
        opts = opts || {};

        this.haltRendering();

        this.setDirection(opts.direction || 'horizontal');
        this.setRenderer(opts.renderer || Cosmolia.Renderers.Scroll);
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
    },

    layoutImages: function() {
        if (this.rendering) {
            this.renderer.layout(this);
        }
    },

    createSlide: function() {
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
    },

    getCarousel: function() {
        if (this.carousel) {
            this.carousel.setImages(this.images);
            return this.carousel;
        }

        this.carousel = new Cosmolia(null, {
            fixedProportion: this.carouselFixedProportion,
            relativeProportion: this.carouselRelativeProportion,
            autoplay: false,
            renderer: Cosmolia.Renderers.ScrollThumb,
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
    },

    /* @PRAGMA Default Parser =============================================== */

    parseImages: function() {
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

    },

    /* @PRAGMA Internal Control Functions =================================== */

    imageWasClicked: function(index, image) {
        this.onImageClick(index, image);
    },

    getNextIndex: function() {
        return this.moduloIndex(this.selectedIndex+1);
    },

    getPreviousIndex: function() {
        return this.moduloIndex(this.selectedIndex-1);
    },

    moduloIndex: function(index) {
        if (index < 0) {
            while(index < 0 && this.images.length > 0) {
                index += this.images.length;
            }
        }

        return Math.abs(index%this.images.length);
    },

    evaluateCarouselProportion: function() {
        if (this.carouselFixedProportion != null) {
            return this.carouselFixedProportion;
        } else if (this.carouselRelativeProportion != null) {
            return (this.carouselRelativeProportion*100)+'%';
        }
        return '50px;'
    },

    placeCarousel: function() {
        var position = this.carouselPosition;
        var factor = this.evaluateCarouselProportion();
        var margins = {'margin-left':'0', 'margin-right':'0'};
        var width = '';
        switch(position) {
            case 'right':
                margins['margin-right'] = factor;
                width = factor;
            break;
            case 'left':
                margins['margin-left'] = factor;
                width = factor;
            break;
        }
        this.html.imagesPositioner.css(margins);

        if (this.carousel) {
            this.carousel.html.wrapper.css('width', width);
        }
    },

    /* @PRAGMA Control Functions ============================================ */

    switchTo: function(index) {
        this.renderer.switchTo(this, index);
    },

    moveTo: function(index) {
        this.renderer.moveTo(this, index);
    },

    next: function() {
        this.renderer.next(this);
    },

    prev: function() {
        this.renderer.prev(this);
    },

    start: function() {
        if (this.started) {
            return;
        }
        this.timer = setInterval(this.step.bind(this), this.interval);
        this.started = true;
        this.paused = false;
    },

    stop: function() {
        clearInterval(this.timer);
        this.started = false;
        this.paused = true;
    },

    pausePlay: function() {
        this.paused = true;
    },

    continuePlay: function() {
        this.paused = false;
    },

    step: function() {
        if (!this.paused) {
            this.next();
        }
    },

    /* @PRAGMA Renderer Delegate Implementations ============================ */

    willStartSwitchingSlide: function(toIndex, animated) {
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
    },

    didEndSwitchingSlide: function(toIndex, animated) {
        //This logic should be moved inside the renderers
        this.markActiveSlide(toIndex);
    },

    /* @PRAGMA Rendere Controll ============================================= */

    haltRendering: function() {
        this.rendering = false;
    },

    resumeRendering: function() {
        this.rendering = true;
    },

    /* @PRAGMA Mark Active Slide ============================================ */

    clearActiveSlide: function() {
        //This logic should be moved inside the renderers
        this.html.imagesSpan.find('.cosmolia-active-slide').removeClass('cosmolia-active-slide');
    },

    markActiveSlide: function(index) {
        //This logic should be moved inside the renderers
        var element = this.getSlideFromCache(index);
        if (element)
            element.addClass('cosmolia-active-slide');
    },

    /* @PRAGMA Slide Caching for The renderer =============================== */

    resetSlideCache: function() {
        this.data.slideCaches = {};
    },

    addSlideToCache: function(index, slide) {
        this.data.slideCaches['cache_' + index] = slide;
    },

    getSlideFromCache: function(index) {
        if (this.data.slideCaches['cache_' + index])
            return this.data.slideCaches['cache_' + index];
    }

});

// /**
//  * Creating the jQuery hook
//  */
jQuery.fn.Cosmolia = function( methodOrOptions ) 
{

    if (!$(this).length) {
        return $(this);
    }
    var instance = $(this).data('Cosmolia');
        
    // CASE: action method (public method on PLUGIN class)        
    if ( instance 
            && methodOrOptions.indexOf('_') != 0 
            && instance[ methodOrOptions ] 
            && typeof( instance[ methodOrOptions ] ) == 'function' ) {
        
        return instance[ methodOrOptions ]( Array.prototype.slice.call( arguments, 1 ) ); 
            
            
    // CASE: argument is options object or empty = initialise            
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {

        instance = new Cosmolia( $(this), methodOrOptions );    // ok to overwrite if this is a re-init
        $(this).data( 'Cosmolia', instance );
        return $(this);
    
    // CASE: method called before init
    } else if ( !instance ) {
        $.error( 'Cosmolia must be initialised before using method: ' + methodOrOptions );
    
    // CASE: invalid method
    } else if ( methodOrOptions.indexOf('_') == 0 ) {
        $.error( 'Method ' +  methodOrOptions + ' is private!' );
    } else {
        $.error( 'Method ' +  methodOrOptions + ' does not exist.' );
    }
};