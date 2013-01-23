/*! (c) Mat Marquis (@wilto). MIT License. http://wil.to/3a */
(function( $, undefined ) {

	var inst = 0;

	$.fn.getPercentage = function() {
		var oPercent = this.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1);

		return oPercent;
	};

	$.fn.adjRounding = function(slide) {
		var $el = $(this),
			$slides = $el.find( slide ),
			diff = $el.parent().width() - $slides.eq(0).width();

		if (diff !== 0) {
			$slides.css( "position", "relative" );
			
			for (var i = 0; i < $slides.length; i++) {
				$slides.eq(i).css( "left", (diff * i) + "px" );
			}
		}

		return this;
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
			speed			: 600,
			backToStart		: true
		},
		opt               = $.extend(defaults, config),
		$slidewrap        = this,
		dBody            = (document.body || document.documentElement),
		transitionSupport = function() {
		    dBody.setAttribute('style', 'transition:top 1s ease;-webkit-transition:top 1s ease;-moz-transition:top 1s ease;');
			var tSupport = !!(dBody.style.transition || dBody.style.webkitTransition || dBody.style.msTransition || dBody.style.OTransition || dBody.style.MozTransition )

			return tSupport;
		},
		carousel = {
			init : function() {
				inst++;

				$slidewrap.each(function(carInt) {
						var $wrap      = $(this),
							$slider    = $wrap.find(opt.slider),
							$slide     = $wrap.find(opt.slide),
							slidenum   = $slide.length,
							transition = "margin-left " + ( opt.speed / 1000 ) + "s ease",
							tmp        = 'carousel-' + inst + '-' + carInt;

						if( $slide.length <= 1 ) {
							return; /* No sense running all this code if the carousel functionality is unnecessary. */
						}

						$wrap
							.css({
								"overflow"           : "hidden",
								"width"              : "100%"
							})
							.attr('role' , 'application');

						$slider
							.attr( 'id', ( $slider[0].id || 'carousel-' + inst + '-' + carInt ) )
							.css({
								"marginLeft"         : "0px",
								"float"              : "left",
								"width"              : 100 * slidenum + "%",
								"-webkit-transition" : transition,
								"-moz-transition"    : transition,
								"-ms-transition"     : transition,
								"-o-transition"      : transition,
								"transition"         : transition
							})
							.bind( 'carouselmove' , carousel.move )
							.bind( 'nextprev'     , carousel.nextPrev )
							.bind( 'navstate'     , carousel.navState );

						$slide
							.css({
								"float": "left",
								width: (100 / slidenum) + "%"
							})
							.each(function(i) {
								var $el = $(this);

								$el.attr({
									"role" : "tabpanel document",
									"id"   : tmp + '-slide' + i
								});

								if( opt.addPagination ) {
									$el.attr('aria-labelledby', tmp + '-tab' + i);
								}
							});

						// Build and insert navigation/pagination, if specified in the options:
						opt.addPagination   && carousel.addPagination();
						opt.addNav 			&& carousel.addNav();

						$slider.trigger( "navstate", { "current": 0 });
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
					var $oEl        = $(this),
						$pagination = $('<ol class="' + opt.namespace + '-tabs" role="tablist navigation" />'),
						$slider     = $oEl.find(opt.slider),
						$slides     = $oEl.find(opt.slide)
						slideNum    = $slides.length,
						associated  = 'carousel-' + inst + '-' + i;

					while( slideNum-- ) {
						var hed = $slides.eq(slideNum).find( opt.slideHed ).text() || 'Page ' + ( slideNum + 1 ),
							tabMarkup = [
								'<li role="presentation">',
									'<a href="#' + associated + '-slide' + slideNum +'"',
									' aria-controls="' + associated + '-slide' + slideNum +'"',
									' id="' + associated + '-tab' + slideNum + '" role="tab">' + hed + '</a>',
								'</li>'
							].join('');

						$pagination.prepend(tabMarkup);
					};

					$pagination
						.appendTo( $oEl )
						.find('li').keydown( function(e) {
							var $el      = $(this),
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
							var $el = $(this);

							if( $el.attr('aria-selected') == 'false' ) {
								var current = $el.parent().index(),
									move    = -( 100 * ( current ) ),
									$slider = $oEl.find( opt.slider );

								$slider.trigger( 'carouselmove', { moveTo: move });
							}
							e.preventDefault();
						});
				});
			},
			roundDown : function(oVal) {
				var val = parseInt(oVal, 10);

				return Math.ceil( (val - (val % 100 ) ) / 100) * 100;
			},
			navState : function(e, ui) {
				var $el          = $(this),
					$slides      = $el.find(opt.slide),
					ind          = -(ui.current / 100),
					$activeSlide = $slides.eq(ind);

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
					var $target = $('[href*="#' + this.id + '"]');

					$target.removeClass( opt.namespace + '-disabled' );
					if(!opt.backToStart) {
						if( ind == 0 ) {
							$target.filter(opt.prevSlide).addClass( opt.namespace + '-disabled' );
						} else if( ind == $slides.length - 1 ) {
							$target.filter(opt.nextSlide).addClass( opt.namespace + '-disabled' );
						}
					}
				}

				// Update state of pagination tabs:
				if( !!opt.addPagination ) {
					var tabId = $activeSlide.attr('aria-labelledby'),
						$tab  = $('#' + tabId );

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

				$el
					.trigger(opt.namespace + "-beforemove")
					.trigger("navstate", { current: ui.moveTo });

				if( transitionSupport() ) {

					$el
						.adjRounding( opt.slide ) /* Accounts for browser rounding errors. Lookinâ€™ at you, iOS Safari. */
						.css('marginLeft', ui.moveTo + "%")
						.one("transitionend webkitTransitionEnd OTransitionEnd", function() {
							$(this).trigger( opt.namespace + "-aftermove" );
						});

				} else {
					$el
						.adjRounding( opt.slide )
						.animate({ "marginLeft": ui.moveTo + "%" }, { "duration" : opt.speed, "queue" : false }, function() {
							$(this).trigger( opt.namespace + "-aftermove" );
						});
				}
			},
			nextPrev : function(e, ui) {
				var $el = $(this),
					left = ( $el ) ? $el.getPercentage() : 0,
					$slide = $el.find(opt.slide),
					constrain = ui.dir === 'prev' ? left != 0 : -left < ($slide.length - 1) * 100,
					$target = $( '[href="#' + this.id + '"]');
					
				if (!$el.is(":animated") && constrain ) {
					
					if ( ui.dir === 'prev' ) {
						left = ( left % 100 != 0 ) ? carousel.roundDown(left) : left + 100;
					} else {
						left = ( ( left % 100 ) != 0 ) ? carousel.roundDown(left) - 100 : left - 100;
					}
					
					$el.trigger('carouselmove', { 'moveTo': left });

					$target
						.removeClass( opt.namespace + '-disabled')
						.removeAttr('aria-disabled');

					if(!opt.backToStart) {
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
					}
				} else {
					var reset = carousel.roundDown(left);
					
					if(opt.backToStart) {					
						if ( ui.dir === 'next' ) {
							left = 0;
						} else if ( ui.dir === 'prev' && ui.event === 'notauto' ) {
							left = -($slide.length - 1) * 100;
						}
						$el.trigger('carouselmove', { 'moveTo': left });
					} else {
						$el.trigger('carouselmove', { 'moveTo': reset });
					}
				}

			}
		};

		carousel.init(this);

		$(opt.nextSlide + ',' + opt.prevSlide)
			.bind('click', function(e) {
				var $el = $(this),
					link = this.hash,
					dir = ( $el.is(opt.prevSlide) ) ? 'prev' : 'next',
					$slider = $(link),
					event = '';

					if ( $el.is('.' + opt.namespace + '-disabled') ) {
						return false;
					}

					if(opt.backToStart) {
						event = 'notauto';
					} else {
						event = '';
					}
					
					$slider.trigger('nextprev', { 'dir': dir, 'event': event });

				e.preventDefault();
			})
			.bind('keydown', function(e) {
				var $el = $(this),
			            link = this.hash,
				    event = '';
				
				if(opt.backToStart) {
					event = 'notauto';
				} else {
					event = '';
				}
				
				switch (e.which) {
					case 37:
					case 38:
						$('#' + link).trigger('nextprev', { 'dir': 'next', 'event': event });
						e.preventDefault();
						break;
					case 39:
					case 40:
						$('#' + link).trigger('nextprev', { 'dir': 'prev', 'event': event });
						e.preventDefault();
						break;
				}
			});

		var setup = {
			'wrap' : this,
			'slider' : opt.slider
		};
		$slidewrap.bind( "dragSnap", setup, function(e, ui){
			var $slider = $(this).find( opt.slider ),
			    dir = ( ui.direction === "left" ) ? 'next' : 'prev',
			    event = '';

			if (opt.backToStart) {
				event = 'notauto';
			} else {
				event = '';
			}

			$slider.trigger("nextprev", { 'dir': dir, 'event': event });
		});


		$slidewrap.filter('[data-autorotate]').each(function() {
			var auto,
				$el         = $(this),
				speed       = $el.attr('data-autorotate'),
				slidenum    = $el.find(opt.slide).length,
				autoAdvance = function() {
					var $slider  = $el.find(opt.slider),
						active   = -( $(opt.slider).getPercentage() / 100 ) + 1;
						
					switch( active ) {
						case slidenum:
							clearInterval(auto);
							
							auto = setInterval(function() {
								autoAdvance();
								$slider.trigger("nextprev", { 'dir': 'prev' });
							}, speed);

							break;
						case 1:
							clearInterval(auto);

							auto = setInterval(function() {
								autoAdvance();
								$slider.trigger("nextprev", { 'dir': 'next' });
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

		return this;
	};

	$.event.special.dragSnap = {
		setup: function(setup) {

			var $el = $(this),
				transitionSwap = function($el, tog) {
					var speed = .3,
						transition = ( tog ) ? "margin-left " + speed + "s ease" : 'none';

					$el.css({
						"-webkit-transition" : transition,
						"-moz-transition"    : transition,
						"-ms-transition"     : transition,
						"-o-transition"      : transition,
						"transition"         : transition
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
						dBody = document.body,
						transitionSupport = function() {
						    dBody.setAttribute('style', 'transition:top 1s ease;-webkit-transition:top 1s ease;-moz-transition:top 1s ease;');
							var tSupport = !!(dBody.style.transition || dBody.style.webkitTransition || dBody.style.MozTransition )

							return tSupport;
						};

					transitionSwap($el, true);

					if( transitionSupport() ) {
						$el.css('marginLeft', left + "%");
					} else {
						$el.animate({ marginLeft: left + "%" }, opt.speed);
					}
				};

			$el
				.bind("snapback", snapBack)
				.bind("touchstart", function(e) {
					var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
						$target = $(e.target),
						start = {
							'time': +new Date,
							'coords': [ data.pageX, data.pageY ],
							'origin': $target.closest( setup.wrap ),
							'interacting': false
						},
						stop,
						$tEl = $target.closest( setup.slider ),
						currentPos = ( $tEl.attr('style') != undefined ) ? $tEl.getPercentage() : 0;

					transitionSwap($tEl, false);

					function moveHandler(e) {
						var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
							stop = {
								'time': +new Date,
								'coords': [ data.pageX, data.pageY ]
							},
							deltaX = Math.abs( start.coords[0] - data.pageX ),
							deltaY = Math.abs( start.coords[1] - data.pageY );

						if( !start || deltaX < deltaY || deltaX < 55 ) {
							return;
						}

						// prevent scrolling
						if ( deltaX >= 55 ) {
							start.interacting = true;
							$tEl.css({"margin-left": currentPos + ( ( (stop.coords[0] - start.coords[0]) / start.origin.width() ) * 100 ) + '%' });
							e.preventDefault();
						} else {
							return;
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
						    var deltaX = Math.abs(start.coords[0] - stop.coords[0]),
								deltaY = Math.abs(start.coords[1] - stop.coords[1]),
								left = start.coords[0] > stop.coords[0],
								jumppoint;

								if( deltaX > 20 && ( deltaX > deltaY ) ) {
									e.preventDefault();
								} else {
									if( start.interacting ) {
										$el.trigger('snapback', { 'target': $tEl, 'left': left });
									}
									return;
								}

								jumppoint = start.origin.width() / 4;

								if( -deltaX > jumppoint || deltaX > jumppoint ) {
									start.origin.trigger("dragSnap", {'direction': left ? "left" : "right"});
								} else {
									$el.trigger('snapback', { 'target': $tEl, 'left': left });
								}
						}
						start = stop = undefined;
					});
			});
		}
	};

})(jQuery);
/*! End of homepage and product carousel */
