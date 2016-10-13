(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Scroll = require('./Cosmolia/Renderers/Scroll.js');

var _Scroll2 = _interopRequireDefault(_Scroll);

var _ScrollThumb = require('./Cosmolia/Renderers/ScrollThumb.js');

var _ScrollThumb2 = _interopRequireDefault(_ScrollThumb);

var _Positions = require('./Cosmolia/Positions.js');

var _Positions2 = _interopRequireDefault(_Positions);

var _Directions = require('./Cosmolia/Directions.js');

var _Directions2 = _interopRequireDefault(_Directions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cosmolia = function () {

    /* @PRAGMA Initialization =============================================== */

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

    function Cosmolia(parent, opts) {
        _classCallCheck(this, Cosmolia);

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

        if (this.autoplay) this.start();
    }

    /* @PRAGMA Basic Encapsulation ========================================== */

    Cosmolia.prototype.setRenderer = function setRenderer(renderer) {
        this.renderer = renderer;
        this.layoutImages();
    };

    Cosmolia.prototype.setImages = function setImages(images) {
        this.images = images;
        if (this.carousel) {
            this.carousel.setImages(images);
        }
        this.selectedIndex = 0;
        this.layoutImages();
    };

    Cosmolia.prototype.addImage = function addImage(image) {
        this.images.push(image);
        this.layoutImages();
    };

    Cosmolia.prototype.clearImages = function clearImages() {
        this.images = [];
        if (this.carousel) {
            this.carousel.setImages(this.images);
        }
        this.selectedIndex = 0;
        this.layoutImages();
    };

    Cosmolia.prototype.setShowInfo = function setShowInfo(isVisible) {
        this.showInfo = isVisible;
        if (isVisible) {
            this.html.wrapper.removeClass('cosmolia-st-no-info');
        } else {
            this.html.wrapper.addClass('cosmolia-st-no-info');
        }
    };

    Cosmolia.prototype.setShowCounter = function setShowCounter(isVisible) {
        this.showCounter = isVisible;
        if (this.showCounter) {
            this.html.wrapper.removeClass('cosmolia-st-no-counter');
        } else {
            this.html.wrapper.addClass('cosmolia-st-no-counter');
        }
    };

    Cosmolia.prototype.setPauseOnHover = function setPauseOnHover(shouldPause) {
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
    };

    Cosmolia.prototype.setCarouselPosition = function setCarouselPosition(position) {
        if (position) {
            this.carouselPosition = position;
            var carousel = this.getCarousel();
            carousel.haltRendering();

            if (position & _Positions2.default.BOTTOM) {
                this.html.wrapper.append(carousel.html.wrapper);
                this.carousel.setDirection(_Directions2.default.HORIZONTAL);
                this.carousel.setProportion(this.carouselFixedProportion, this.carouselRelativeProportion);
            } else if (position & _Positions2.default.TOP) {
                this.html.wrapper.prepend(carousel.html.wrapper);
                this.carousel.setDirection(_Directions2.default.HORIZONTAL);
                this.carousel.setProportion(this.carouselFixedProportion, this.carouselRelativeProportion);
            } else if (position & (_Directions2.default.LEFT | _Directions2.default.RIGHT)) {
                this.html.wrapper.append(carousel.html.wrapper);
                this.carousel.setDirection(_Directions2.default.VERTICAL);
                this.carousel.setProportion('100%');
            }

            this.placeCarousel();

            this.html.wrapper.removeClass('cosmolia-cp-top cosmolia-cp-right cosmolia-cp-bottom cosmolia-cp-left');
            this.html.wrapper.addClass('cosmolia-cp-' + position);
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
    };

    Cosmolia.prototype.setHasControllButtons = function setHasControllButtons(isVisible) {
        this.hasControlButtons = isVisible;
        if (this.hasControlButtons) {
            this.html.prevButton.show();
            this.html.nextButton.show();
        } else {
            this.html.prevButton.hide();
            this.html.nextButton.hide();
        }
    };

    Cosmolia.prototype.setSlideData = function setSlideData(slide, index) {
        var image = this.images[index];
        if (image) {
            slide.css('background-image', "url('" + image.src + "')");
            slide.find('.cosmolia-item-title').text(image.title);
            slide.find('.cosmolia-item-description').text(image.description);
            slide.find('.cosmolia-item-counter').text(index + 1 + ' / ' + this.images.length);

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
    };

    Cosmolia.prototype.setProportion = function setProportion(fixedProportion, relativeProportion) {
        this.fixedProportion = fixedProportion;
        this.relativeProportion = relativeProportion;
        if (!fixedProportion && !relativeProportion) {
            //Do nothing
        } else if (fixedProportion != null) {
            this.html.imagesHolder.css({
                'padding-bottom': 0,
                'height': fixedProportion
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
                'padding-bottom': 100 * relativeProportion + '%',
                'height': 0
            });
            this.html.wrapper.css({
                width: '',
                position: '',
                height: ''
            });
        }
    };

    Cosmolia.prototype.setCarouselProportion = function setCarouselProportion(fixedProportion, relativeProportion) {
        this.carouselFixedProportion = fixedProportion;
        this.carouselRelativeProportion = relativeProportion;
        if (this.carousel) {
            if (this.carouselPosition & (_Positions2.default.LEFT | _Positions2.default.RIGHT)) {
                this.placeCarousel();
            } else {
                this.carousel.setProportion(fixedProportion, relativeProportion);
            }
        }
    };

    Cosmolia.prototype.setItems = function setItems(items) {
        this.html.wrapper.removeClass('cosmolia-cp-items-1 cosmolia-cp-items-2 cosmolia-cp-items-3 cosmolia-cp-items-4');
        this.html.wrapper.addClass('cosmolia-cp-items-' + items);
        this.items = items;
        this.itemsWidth = 100 / items;
        this.layoutImages();
    };

    Cosmolia.prototype.setCarouselItems = function setCarouselItems(items) {
        this.carouselItems = items;
        if (this.carousel) {
            this.carousel.setItems(items);
        }
    };

    Cosmolia.prototype.setOffset = function setOffset(offset) {
        this.offset = offset;
        if (this.rendering) {
            this.renderer.switchTo(this, this.selectedIndex);
        }
    };

    Cosmolia.prototype.setCarouselOffset = function setCarouselOffset(offset) {
        if (this.carousel) {
            this.carousel.setOffset(offset);
        }
    };

    Cosmolia.prototype.setInterval = function setInterval(interval) {
        this.interval = interval;
        if (this.started) {
            var pausedWas = this.paused;
            this.stop();
            this.start();
            this.paused = pausedWas;
        }
    };

    Cosmolia.prototype.setAnimationSpeed = function setAnimationSpeed(animationSpeed) {
        this.animationSpeed = animationSpeed;
    };

    Cosmolia.prototype.setDirection = function setDirection(direction) {
        if (!direction) return;

        this.direction = direction;

        if (this.renderer) this.renderer.willRotate(this);

        if (direction == _Directions2.default.VERTICAL) this.directionDictionary = { 'left': 'top', 'width': 'height' };else if (direction == _Directions2.default.HORIZONTAL) this.directionDictionary = { 'left': 'left', 'width': 'width' };
    };

    Cosmolia.prototype.setOnImageClick = function setOnImageClick(callback) {
        if (this.onImageClick != null && callback != null) {
            this.onImageClick = callback;
        } else if (this.onImageClick != callback) {
            this.onImageClick = callback;
            this.layoutImages();
        }
    };

    Cosmolia.prototype.setImageContain = function setImageContain(enabled) {
        this.imageContain = enabled;
        if (enabled) {
            this.html.wrapper.addClass('cosmolia-images-style-contain');
        } else {
            this.html.wrapper.removeClass('cosmolia-images-style-contain');
        }
    };

    Cosmolia.prototype.setResponsive = function setResponsive(responsive) {
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
    };

    Cosmolia.prototype.initResponsive = function initResponsive() {
        this.responsiveHandler = this.onWindowResizeResponsive.bind(this);
    };

    Cosmolia.prototype.onWindowResizeResponsive = function onWindowResizeResponsive() {
        var newWidth = jQuery(window).width();
        this.calculateImagesVisibility(newWidth);
    };

    Cosmolia.prototype.calculateImagesVisibility = function calculateImagesVisibility(newWidth) {
        if (this.lastWindowSize != 1 && newWidth < 769) {
            this.lastWindowSize = 1;
            this.setItems(1);
        } else if (this.lastWindowSize != 2 && newWidth > 768) {
            this.lastWindowSize = 2;
            this.setItems(3);
        }
    };

    /* @PRAGMA Layout Organization ========================================== */

    Cosmolia.prototype.buildLayout = function buildLayout() {

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
    };

    Cosmolia.prototype.layout = function layout(opts) {
        opts = opts || {};

        this.haltRendering();

        this.setDirection(opts.direction || _Directions2.default.HORIZONTAL);
        this.setRenderer(opts.renderer || _Scroll2.default);
        this.setInterval(opts.interval || 4000);
        this.setAnimationSpeed(opts.animationSpeed || 300);
        this.setCarouselProportion(opts.carouselFixedProportion, opts.carouselRelativeProportion || 0.25);
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
    };

    Cosmolia.prototype.layoutImages = function layoutImages() {
        if (this.rendering) {
            this.renderer.layout(this);
        }
    };

    Cosmolia.prototype.createSlide = function createSlide() {
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
    };

    Cosmolia.prototype.getCarousel = function getCarousel() {
        if (this.carousel) {
            this.carousel.setImages(this.images);
            return this.carousel;
        }

        this.carousel = new Cosmolia(null, {
            fixedProportion: this.carouselFixedProportion,
            relativeProportion: this.carouselRelativeProportion,
            autoplay: false,
            renderer: _ScrollThumb2.default,
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
    };

    /* @PRAGMA Default Parser =============================================== */

    Cosmolia.prototype.parseImages = function parseImages() {
        if (this.parser) {
            this.parser(this.parent, this.images);
            return null;
        }

        var images = this.parent.find('img');
        var result = [];
        for (var i = 0; i < images.length; i++) {
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
    };

    /* @PRAGMA Internal Control Functions =================================== */

    Cosmolia.prototype.imageWasClicked = function imageWasClicked(index, image) {
        this.onImageClick(index, image);
    };

    Cosmolia.prototype.getNextIndex = function getNextIndex() {
        return this.moduloIndex(this.selectedIndex + 1);
    };

    Cosmolia.prototype.getPreviousIndex = function getPreviousIndex() {
        return this.moduloIndex(this.selectedIndex - 1);
    };

    Cosmolia.prototype.moduloIndex = function moduloIndex(index) {
        if (index < 0) {
            while (index < 0 && this.images.length > 0) {
                index += this.images.length;
            }
        }

        return Math.abs(index % this.images.length);
    };

    Cosmolia.prototype.evaluateCarouselProportion = function evaluateCarouselProportion() {
        if (this.carouselFixedProportion != null) {
            return this.carouselFixedProportion;
        } else if (this.carouselRelativeProportion != null) {
            return this.carouselRelativeProportion * 100 + '%';
        }
        return '50px;';
    };

    Cosmolia.prototype.placeCarousel = function placeCarousel() {
        var position = this.carouselPosition;
        var factor = this.evaluateCarouselProportion();
        var margins = { 'margin-left': '0', 'margin-right': '0' };
        var width = '';
        if (position & _Positions2.default.LEFT) {
            margins['margin-right'] = factor;
            width = factor;
        }
        if (position & _Positions2.default.RIGHT) {
            margins['margin-left'] = factor;
            width = factor;
        }

        this.html.imagesPositioner.css(margins);

        if (this.carousel) {
            this.carousel.html.wrapper.css('width', width);
        }
    };

    /* @PRAGMA Control Functions ============================================ */

    Cosmolia.prototype.switchTo = function switchTo(index) {
        this.renderer.switchTo(this, index);
    };

    Cosmolia.prototype.moveTo = function moveTo(index) {
        this.renderer.moveTo(this, index);
    };

    Cosmolia.prototype.next = function next() {
        this.renderer.next(this);
    };

    Cosmolia.prototype.prev = function prev() {
        this.renderer.prev(this);
    };

    Cosmolia.prototype.start = function start() {
        if (this.started) {
            return;
        }
        this.timer = setInterval(this.step.bind(this), this.interval);
        this.started = true;
        this.paused = false;
    };

    Cosmolia.prototype.stop = function stop() {
        clearInterval(this.timer);
        this.started = false;
        this.paused = true;
    };

    Cosmolia.prototype.pausePlay = function pausePlay() {
        this.paused = true;
    };

    Cosmolia.prototype.continuePlay = function continuePlay() {
        this.paused = false;
    };

    Cosmolia.prototype.step = function step() {
        if (!this.paused) {
            this.next();
        }
    };

    /* @PRAGMA Renderer Delegate Implementations ============================ */

    Cosmolia.prototype.willStartSwitchingSlide = function willStartSwitchingSlide(toIndex, animated) {
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
    };

    Cosmolia.prototype.didEndSwitchingSlide = function didEndSwitchingSlide(toIndex, animated) {
        //This logic should be moved inside the renderers
        this.markActiveSlide(toIndex);
    };

    /* @PRAGMA Rendere Controll ============================================= */

    Cosmolia.prototype.haltRendering = function haltRendering() {
        this.rendering = false;
    };

    Cosmolia.prototype.resumeRendering = function resumeRendering() {
        this.rendering = true;
    };

    /* @PRAGMA Mark Active Slide ============================================ */

    Cosmolia.prototype.clearActiveSlide = function clearActiveSlide() {
        //This logic should be moved inside the renderers
        this.html.imagesSpan.find('.cosmolia-active-slide').removeClass('cosmolia-active-slide');
    };

    Cosmolia.prototype.markActiveSlide = function markActiveSlide(index) {
        //This logic should be moved inside the renderers
        var element = this.getSlideFromCache(index);
        if (element) element.addClass('cosmolia-active-slide');
    };

    /* @PRAGMA Slide Caching for The renderer =============================== */

    Cosmolia.prototype.resetSlideCache = function resetSlideCache() {
        this.data.slideCaches = {};
    };

    Cosmolia.prototype.addSlideToCache = function addSlideToCache(index, slide) {
        this.data.slideCaches['cache_' + index] = slide;
    };

    Cosmolia.prototype.getSlideFromCache = function getSlideFromCache(index) {
        if (this.data.slideCaches['cache_' + index]) return this.data.slideCaches['cache_' + index];
    };

    return Cosmolia;
}();

if (jQuery) jQuery.fn.Cosmolia = function (methodOrOptions) {

    if (!jQuery(this).length) {
        return jQuery(this);
    }

    var instance = jQuery(this).data('Cosmolia');

    // CASE: action method (public method on PLUGIN class)        
    if (instance && methodOrOptions.indexOf('_') != 0 && instance[methodOrOptions] && typeof instance[methodOrOptions] == 'function') {

        return instance[methodOrOptions](Array.prototype.slice.call(arguments, 1));

        // CASE: argument is options object or empty = initialise            
    } else if ((typeof methodOrOptions === 'undefined' ? 'undefined' : _typeof(methodOrOptions)) === 'object' || !methodOrOptions) {
        instance = new Cosmolia(jQuery(this), methodOrOptions); // ok to overwrite if this is a re-init
        jQuery(this).data('Cosmolia', instance);
        return jQuery(this);

        // CASE: method called before init
    } else if (!instance) {
        jQuery.error('Cosmolia must be initialised before using method: ' + methodOrOptions);

        // CASE: invalid method
    } else {
        jQuery.error('Method ' + methodOrOptions + ' does not exist.');
    }
};

if (window) window.Cosmolia = Cosmolia;

exports.default = Cosmolia;

},{"./Cosmolia/Directions.js":2,"./Cosmolia/Positions.js":3,"./Cosmolia/Renderers/Scroll.js":4,"./Cosmolia/Renderers/ScrollThumb.js":5}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
/**
 * Direction dictionary that holds the avaliable directions
 * @readonly
 * @enum {number}
 */
exports.default = {
  VERTICAL: 1,
  HORIZONTAL: 2
};

},{}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
/**
 * Position dictionary that holds the avaliable positions
 * @readonly
 * @enum {number}
 */
exports.default = {
  TOP: 1,
  RIGHT: 2,
  BOTTOM: 4,
  LEFT: 8
};

},{}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.default = {

    willRotate: function willRotate(gallery) {
        gallery.html.imagesSpan.css(gallery.directionDictionary.left, '');
    },

    layout: function layout(gallery) {
        gallery.html.imagesSpan.empty();
        var start = 0 - gallery.items;
        var length = gallery.images.length + gallery.items;
        gallery.resetSlideCache();
        for (var i = start; i < length; i++) {
            var slide = gallery.createSlide();
            var realIndex = gallery.moduloIndex(i);
            slide.css(gallery.directionDictionary.width, gallery.itemsWidth + '%');
            slide.css(gallery.directionDictionary.left, i * gallery.itemsWidth + '%');
            gallery.addSlideToCache(i, slide);
            gallery.setSlideData(slide, realIndex);
            gallery.html.imagesSpan.append(slide);
        }
        this.switchTo(gallery, gallery.selectedIndex);
    },

    next: function next(gallery) {
        var oldIndex = gallery.selectedIndex;
        var index = gallery.getNextIndex();
        var through = index <= oldIndex ? oldIndex + 1 : null;
        this.change(gallery, index, true, true, through);
    },

    prev: function prev(gallery) {
        var oldIndex = gallery.selectedIndex;
        var index = gallery.getPreviousIndex();
        var through = index >= oldIndex ? oldIndex - 1 : null;
        this.change(gallery, index, true, true, through);
    },

    moveTo: function moveTo(gallery, index) {
        var index = gallery.moduloIndex(index);
        this.change(gallery, index, true, true);
    },

    switchTo: function switchTo(gallery, index) {
        var index = gallery.moduloIndex(index);
        this.change(gallery, index, false, false);
    },

    change: function change(gallery, index, animated, animate, through) {
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
            hash[gallery.directionDictionary.left] = -1 * (through + gallery.offset) * gallery.itemsWidth + '%';
            gallery.html.imagesSpan.animate(hash, gallery.animationSpeed, callback);
        } else {
            gallery.html.imagesSpan.css(gallery.directionDictionary.left, -1 * (index + gallery.offset) * gallery.itemsWidth + '%');
            gallery.didEndSwitchingSlide(index, animated);
        }
    }

};

},{}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _Scroll = require('./Scroll.js');

var _Scroll2 = _interopRequireDefault(_Scroll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ScrollThumb = Object.create(_Scroll2.default);
ScrollThumb.layout = function (gallery) {
    gallery.html.imagesSpan.empty();
    var start = 0;
    var length = gallery.images.length;
    gallery.resetSlideCache();
    for (var i = start; i < length; i++) {
        var slide = gallery.createSlide();
        var realIndex = gallery.moduloIndex(i);
        gallery.addSlideToCache(i, slide);
        slide.css(gallery.directionDictionary.width, gallery.itemsWidth + '%');
        slide.css(gallery.directionDictionary.left, i * gallery.itemsWidth + '%');
        gallery.setSlideData(slide, realIndex);
        gallery.html.imagesSpan.append(slide);
    }
    this.switchTo(gallery, gallery.selectedIndex);
};

exports.default = ScrollThumb;

},{"./Scroll.js":4}]},{},[1])


//# sourceMappingURL=cosmolia.js.map
