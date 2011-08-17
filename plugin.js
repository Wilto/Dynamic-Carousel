/*! (c) Mat Marquis (@wilto). MIT License. http://wil.to/3a */

(function( $, undefined ) {
	var inst = 0;
	
	$.fn.getPercentage = function() {
		return this.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1);
	};
	
	$.fn.carousel = function(config) {
		
		// Prevent re-init:
		if( this.data( "carousel-initialized" ) ) { return; }
		
		// Carousel is being initialized:
		this.data( "carousel-initialized", true );

		var defaults = {
			slider			: '.slider',
			slide			: '.slide',
			prevSlide		: null,
			nextSlide		: null,
			slideHed		: null,
			addPagination	: false,
			addNav			: ( config != undefined && ( config.prevSlide || config.nextSlide ) ) ? false : true,
			namespace		: 'carousel',
			speed			: 300
		},
		opt = $.extend(defaults, config),
		$slidewrap = this,
		dStyle = document.body.style,
		transitionSupport = dStyle.webkitTransition !== undefined || 
							dStyle.mozTransition !== undefined ||
							dStyle.msTransition !== undefined ||
							dStyle.OTransition !== undefined ||
							dStyle.transition !== undefined,
		carousel = {
			init : function() {
				inst++;
								
				$slidewrap.each(function(carInt) {
						var $wrap = $(this),
							$slider = $wrap.find(opt.slider),
							$slide = $wrap.find(opt.slide),			
							slidenum = $slide.length,
							transition = "margin-left " + ( opt.speed / 1000 ) + "s ease",
							tmp = 'carousel-' + inst + '-' + carInt;

						$wrap
							.css({
								overflow: "hidden",
								width: "100%"
							})
							.attr('role', 'application');

						$slider
							.attr( 'id', ( $slider[0].id || 'carousel-' + inst + '-' + carInt ) )
							.css({
								marginLeft: "0px",
								"float": "left",
								width: 100 * slidenum + "%",
								"-webkit-transition": transition,
								"-moz-transition": transition,
								"-ms-transition": transition,
								"-o-transition": transition,
								"transition": transition
							})
							.bind( 'move', carousel.move )
							.bind( 'nextprev', carousel.nextPrev )
							.bind( 'navstate', carousel.navState );

						$slide
							.css({
								"float": "left",
								width: (100 / slidenum) + "%"				
							})
							.each(function(i) {
								var $el = $(this);

								$el.attr({
									role : "tabpanel document",
									id : tmp + '-slide' + i
								});

								if( opt.addPagination ) {
									$el.attr('aria-labelledby', tmp + '-tab' + i);
								}
							});
	
						// Build and insert navigation/pagination, if specified in the options:
						opt.addPagination 	&& carousel.addPagination();
						opt.addNav 			&& carousel.addNav();
						
						$slider.trigger( "navstate", { current: 0 });
				});
			},
			addNav : function() {
				$slidewrap.each(function(i) {						
					var $oEl = $(this),
						$slider = $oEl.find(opt.slider),
						currentSlider = $slider[0].id,
						navMarkup = [
							'<ul class="slidecontrols" role="navigation">',
							'	<li role="presentation"><a href="#' + currentSlider + '" class="' + opt.namespace + '-next">Next</a></li>',
							'	<li role="presentation"><a href="#' + currentSlider + '" class="' + opt.namespace + '-prev">Prev</a></li>',
							'</ul>'
							].join(''),
						nextprev = {
							nextSlide : '.' + opt.namespace + '-next',
							prevSlide : '.' + opt.namespace + '-prev'
						};

					opt = $.extend(opt, nextprev);
					
					$oEl.prepend(navMarkup);
				});
			},
			addPagination : function() {
				$slidewrap.each(function(i) {
					var $oEl = $(this),
						$slider = $oEl.find(opt.slider),
						$pagination = $('<ol class="' + opt.namespace + '-tabs" role="tablist navigation" />'),
						slides = $oEl.find(opt.slide).length,
						associated = 'carousel-' + inst + '-' + i;
						
					while( slides-- ) {
						var hed = $( $oEl.find( opt.slide )[ slides ] ).find( opt.slideHed ).text() || 'Page ' + ( slides + 1 ),
							tabMarkup = [
								'<li role="presentation">',
									'<a href="#' + associated + '-slide' + slides +'"',
									' aria-controls="' + associated + '-slide' + slides +'"',
									' id="' + associated + '-tab' + slides + '" role="tab">' + hed + '</a>',
								'</li>'
							].join('');
						
						$pagination.prepend(tabMarkup);
					};

					$pagination
						.appendTo( $oEl )
						.find('li').keydown( function(e) {
							var $el = $(this),
								$prevTab = $el.prev().find('a'),
								$nextTab = $el.next().find('a');

							switch( e.which ) {
								case 37:
								case 38:		
									$prevTab.length && $prevTab.trigger('click').focus();
									e.preventDefault();
									break;
								case 39: 
								case 40:
									$nextTab.length && $nextTab.trigger('click').focus();
									e.preventDefault();
									break;
							}
						})
						.find('a').click( function(e) {
							var current = $(this).parent().index(),
								move = -( 100 * ( current ) ),
								$slider = $oEl.find( opt.slider );

							$slider.trigger( "move", { moveTo: move });
							e.preventDefault();
						});
				});
			},
			roundDown : function(oVal) {
				var val = parseInt(oVal, 10);

				return Math.ceil( (val - (val % 100 ) ) / 100) * 100;
			},
			navState : function(e, ui) {
				var $el = $(this),
					$slides = $el.find(opt.slide),
					ind = -(ui.current / 100),
					$activeSlide = $($slides[ind]);
					
				$el.attr('aria-activedescendant', $activeSlide[0].id);

				// Update state of active tabpanel:
				$activeSlide
					.addClass( opt.namespace + "-active-slide" )
					.attr( 'aria-hidden', false )
					.siblings()	
						.removeClass( opt.namespace + "-active-slide" )
						.attr( 'aria-hidden', true );
						
				// Update state of next/prev navigation:
				if( ( !!opt.prevSlide || !!opt.nextSlide ) ) {
					var $target = $('[href="#' + this.id + '"]');
					
					$target.removeClass( opt.namespace + '-disabled' );
					
					switch( ui.current ) {
						case ( -($slides.length - 1) * 100 ):
							$target.filter(opt.nextSlide).addClass( opt.namespace + '-disabled' );
							break;
						case 0:
							$target.filter(opt.prevSlide).addClass( opt.namespace + '-disabled' );
							break;
					}
				}
								
				// Update state of pagination tabs:
				if( !!opt.addPagination ) {
					var tabId = $activeSlide.attr('aria-labelledby'),
						$tab = $('#' + tabId );
					
					$tab
						.parent()
						.addClass(opt.namespace + '-active-tab')
						.siblings()
						.removeClass(opt.namespace + '-active-tab')
						.find('a')
							.attr({
								'aria-selected' : false,
								'tabindex' : -1
							});
							
					$tab.attr({
						'aria-selected' : true,
						'tabindex' : 0
					});
				}
			},
			move : function(e, ui) {
				var $el = $(this);

				$el.trigger(opt.namespace + "-beforemove");
				
				if( transitionSupport ) {
									
					$el.css('marginLeft', ui.moveTo + "%");
					
					$el.one("transitionend webkitTransitionEnd OTransitionEnd", function() {
						$(this).trigger( opt.namespace + "-aftermove" );
					});
					
				} else {					
					$el.animate({ marginLeft: ui.moveTo + "%" }, opt.speed, function() {
						$el.trigger( opt.namespace + "-aftermove" );
					});
				}
			
				$el.trigger("navstate", { current: ui.moveTo });
			},
			nextPrev : function(e, ui) {
				var $el = $(this),
					left = ( $el ) ? $el.getPercentage() : 0,
					$slide = $el.find(opt.slide),
					constrain = ui.dir === 'prev' ? left != 0 : -left < ($slide.length - 1) * 100,
					$target = $( '[href="#' + $el.attr('id') + '"]');

				if (!$el.is(":animated") && constrain ) {

					if ( ui.dir === 'prev' ) {
						left = ( left % 100 != 0 ) ? carousel.roundDown(left) : left + 100;
					} else {
						left = ( ( left % 100 ) != 0 ) ? carousel.roundDown(left) - 100 : left - 100;
					}

					$el.trigger("move", { moveTo: left });

					$target
						.removeClass( opt.namespace + '-disabled')
						.removeAttr('aria-disabled');

					switch( left ) {
						case ( -($slide.length - 1) * 100 ):
							$target.filter(opt.nextSlide)
								.addClass( opt.namespace + '-disabled')
								.attr('aria-disabled', true);
							break;
						case 0:
							$target.filter(opt.prevSlide)
								.addClass( opt.namespace + '-disabled')
								.attr('aria-disabled', true);
							break;
					}
				} else {
					var reset = carousel.roundDown(left);

					$el.trigger("move", { moveTo: reset });
				}

				if (opt.callback) {
				  opt.callback();
				}
			}
		};
	
		carousel.init(this);

		$(opt.nextSlide + ',' + opt.prevSlide)
			.bind('click', function(e) {
				var $el = $(this),
					link = $el.attr('href'),
					dir = ( $el.is(opt.prevSlide) ) ? 'prev' : 'next',
					$slider = $(link);

					if ( $el.is('.' + opt.namespace + '-disabled') ) { 
						return false;
					}

					$slider.trigger('nextprev', { dir: dir });
				
				e.preventDefault();
			})
			.bind('keydown', function(e) {
				var $el = $(this),
					link = this.getAttribute('href');

				switch (e.which) {
					case 37:
					case 38:
						$('#' + link).trigger('nextprev', { dir: 'next' });
						e.preventDefault();
						break;
					case 39:
					case 40:
						$('#' + link).trigger('nextprev', { dir: 'prev' });
						e.preventDefault();
						break;
				}
			});

		$('[data-autorotate]').each(function() {
			var $el = $(this),
				speed = this.getAttribute('data-autorotate'),
				auto,
				autoAdvance = function() {
					var slidenum = $el.find(opt.slide).length,
						active = -($(opt.slider).getPercentage() / 100) + 1;
					
					switch( active ) {
						case slidenum: 
							clearInterval(auto);
					
							auto = setInterval(function() {
								autoAdvance();
								$el.find(opt.prevSlide).trigger('click');
							}, speed);
							
							break;
						case 1:
							clearInterval(auto);

							auto = setInterval(function() {
								autoAdvance();
								$el.find(opt.nextSlide).trigger('click');
							}, speed);
							
							break;
					}
				};

			auto = setInterval(autoAdvance, speed);
			
			$el
				.attr('aria-live', 'polite')
				.bind('mouseenter click touchstart', function() {
					clearInterval(auto);
				});
		});

		var setup = {
			wrap : this,
			slider : opt.slider
		};
		$slidewrap.bind( "dragSnap", setup, function(e, ui){
			var $slider = $(this).find( opt.slider ),
				dir = ( ui.direction === "left" ) ? 'next' : 'prev';
			
			$slider.trigger("nextprev", { dir: dir });	
		});

		return this;
	};
})(jQuery);


$.event.special.dragSnap = {
	setup: function(setup) {

		var $el = $(this),
			transitionSwap = function($el, tog) {
				var speed = .3,
					transition = ( tog ) ? "margin-left " + speed + "s ease" : 'none';

				$el.css({
					"-webkit-transition": transition,
					"-moz-transition": transition,
					"-ms-transition": transition,
					"-o-transition": transition,
					"transition": transition
				});
			},
			roundDown = function(left) {
				var left = parseInt(left, 10);
				
				return Math.ceil( (left - (left % 100 ) ) / 100) * 100;
			},
			snapBack = function(e, ui) {
				var $el = ui.target,
					currentPos = ( $el.attr('style') != undefined ) ? $el.getPercentage() : 0,
					left = (ui.left === false) ? roundDown(currentPos) - 100 : roundDown(currentPos),
					dStyle = document.body.style,
					transitionSupport = dStyle.webkitTransition !== undefined || 
						dStyle.mozTransition !== undefined ||
						dStyle.msTransition !== undefined ||
						dStyle.oTransition !== undefined ||
						dStyle.transition !== undefined;

				transitionSwap($el, true);
				
				if( transitionSupport ) {
					$el.css('marginLeft', left + "%");
				} else {
					$el.animate({ marginLeft: left + "%" }, opt.speed);
				}
			};

		$el
			.bind("snapback", snapBack)
			.bind("touchstart", function(e) {
				var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
					start = {
						time: (new Date).getTime(),
						coords: [ data.pageX, data.pageY ],
						origin: $(e.target).closest( setup.wrap )
					},
					stop,
					$tEl = $(e.target).closest( setup.slider ),
					currentPos = ( $tEl.attr('style') != undefined ) ? $tEl.getPercentage() : 0;
				
				transitionSwap($tEl, false);

				function moveHandler(e) {
					var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
					stop = {
							time: (new Date).getTime(),
							coords: [ data.pageX, data.pageY ]
					};
					
					if(!start || Math.abs(start.coords[0] - stop.coords[0]) < Math.abs(start.coords[1] - stop.coords[1]) ) {
						return;
					}

					$tEl.css({"margin-left": currentPos + ( ( (stop.coords[0] - start.coords[0]) / start.origin.width() ) * 100 ) + '%' });						

					// prevent scrolling
					if (Math.abs(start.coords[0] - stop.coords[0]) > 10) {
						e.preventDefault();
					}
					
				};

				$el
					.bind("gesturestart", function(e) {
						$el
							.unbind("touchmove", moveHandler)
							.unbind("touchend", moveHandler);
					})
					.bind("touchmove", moveHandler)
					.one("touchend", function(e) {

						$el.unbind("touchmove", moveHandler);
						
						transitionSwap($tEl, true);
						
						if (start && stop ) {

							if (Math.abs(start.coords[0] - stop.coords[0]) > 10
								&& Math.abs(start.coords[0] - stop.coords[0]) > Math.abs(start.coords[1] - stop.coords[1])) {
								e.preventDefault();
							} else {
								$el.trigger('snapback', { target: $tEl, left: true });
								return;
							}

							if (Math.abs(start.coords[0] - stop.coords[0]) > 1 && Math.abs(start.coords[1] - stop.coords[1]) < 75) {
								var left = start.coords[0] > stop.coords[0];

							if( -( stop.coords[0] - start.coords[0]) > ( start.origin.width() / 4 ) || ( stop.coords[0] - start.coords[0]) > ( start.origin.width() / 4 ) ) {

								start.origin.trigger("dragSnap", {direction: left ? "left" : "right"});

								} else {								
									$el.trigger('snapback', { target: $tEl, left: left });
								}

							}
						}
						start = stop = undefined;
					});
			});
	}
};