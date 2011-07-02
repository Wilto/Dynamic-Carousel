(function($){
	$.fn.carousel = function(config) {
		var defaults = {
			slider: '.slider',
			slide: '.slide',
			pagination: false,
			prevSlide: '.prev',
			nextSlide: '.next',
			speed: 500
		},
		opt = $.extend(defaults, config);
		
		carousel = {
			roundDown : function(leftmargin) {
				var leftmargin = parseInt(leftmargin, 10);
				
				return Math.ceil( (leftmargin - (leftmargin % 100 ) ) / 100) * 100;
			},
			transitionSupport : function() {
				var dStyle = document.body.style;
				
				return dStyle.webkitTransition !== undefined || 
						dStyle.mozTransition !== undefined ||
						dStyle.msTransition !== undefined ||
						dStyle.oTransition !== undefined ||
						dStyle.transition !== undefined;
			},
			transitionSwap : function($el, tog) {
				var speed = opt.speed / 1000,
					transition = ( tog ) ? "margin-left " + speed + "s ease" : 'none';

				$el.css({
					"-webkit-transition": transition,
					"-moz-transition": transition,
					"-ms-transition": transition,
					"-o-transition": transition,
					"transition": transition
				});
			},
			snapBack : function($el, left) {
				var currentPos = ( $el.attr('style') != undefined ) ? $el.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1) : 0,
					leftmargin = (left === false) ? carousel.roundDown(currentPos) - 100 : carousel.roundDown(currentPos);

				carousel.transitionSwap($el, true);
				carousel.move($el, leftmargin);	
			},
			nextPrev : function($slider, dir) {
				var leftmargin = ( $slider ) ? $slider.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1) : 0,
					$slide = $slider.find(opt.slide),
					constrain = dir === 'prev' ? leftmargin != 0 : -leftmargin < ($slide.length - 1) * 100,
					$target = $( '[href="#' + $slider.attr('id') + '"]');
									
				if (!$slider.is(":animated") && constrain ) {
					if ( dir === 'prev' ) {
						leftmargin = ( leftmargin % 100 != 0 ) ? carousel.roundDown(leftmargin) : leftmargin + 100;
					} else {
						leftmargin = ( ( leftmargin % 100 ) != 0 ) ? carousel.roundDown(leftmargin) - 100 : leftmargin - 100;
					}
				} else {
					var leftmargin = carousel.roundDown(leftmargin);
				}
				carousel.move($slider, leftmargin);
			},
			createPagination : function($slider) {
				$slider.each(function(i) {
					var $oEl = $(this),
						$pagination = $('<ol class="carousel-tabs" role="tablist" />'),
						slides = $oEl.find(opt.slide).length,
						current = $oEl.index() + 1;

					while( slides-- ) {
						var i = slides + 1;

						$pagination.prepend('<li><a href="#carousel' + current + '-slide' + i +'" id="carousel' 
						+ current + '-tab' + i + '" role="tab" tabindex="-1" aria-selected="false">Page ' + i + '</a></li>');

/* 
	I don’t like that the above links don’t contain meaningful text. I’m thinking about introducing
	a data- attribute or user-controllable selector that could be used to pull in a heading’s text—even if that heading 
	is hidden in a screen-reader accessible kind of way, something like:

	.a11y-only {
		position: absolute;
		left: -9999px;
	}

	<h1 class="panel-hed a11y-only">A Meaningful Tabpanel Heading</h1>

	And then grab the contents of .panel-hed and use it to populate the link accordingly.
*/
					}

					$pagination.find("li").keydown(function(e) {
						var $el = $(this),
							$prevTab = $el.prev().find('a'),
							$nextTab = $el.next().find('a');
						
						switch (e.which) {
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
					}).find('a').click(function(e) {
						var $el = $(this),
							current = $el.parent().index(),
							move = -(100 * (current)),
							$slider = $oEl.find(opt.slider);
								
						carousel.move($slider, move);

						e.preventDefault();
					});

					$oEl.append($pagination);
				});
			},
			move : function($slider, moveTo) {
				if( carousel.transitionSupport() ) {
					$slider.css('marginLeft', moveTo + "%");
				} else {
					$slider.animate({ marginLeft: moveTo + "%" }, opt.speed);
				}
				carousel.navState($slider, moveTo);
			},
			activeSlide : function($slider, current) {
				var $slides = $slider.find(opt.slide),
					$activeSlide = $($slides[current]),
					activeId = $slides[current].id;

				$slider.attr('aria-activedescendant', activeId);

				$activeSlide
					.addClass("active")
					.attr('aria-hidden', false)
						.find('*') // Until aria-activedescendant support is better, here we are. I know—it makes me nauseous too.
						.removeAttr('tabindex')
					.end()
					.siblings()	
						.removeClass("active")
						.attr('aria-hidden', true)
							.find('*')
							.attr('tabindex', -1);
			},
			navState : function($slider, moveTo) {
				var $target = $( '[href="#' + $slider.attr('id') + '"]');
					$slides = $slider.find(opt.slide),
					current = -(moveTo / 100),
					$pagination = $slider.parent().find('.carousel-tabs');

				$target.removeClass('disabled');

				carousel.activeSlide($slider, current);

				if( $pagination.length ) {
					$pagination
						.find('li:nth-child(' + (current + 1 ) + ')')
						.addClass('current')
							.find('a')
							.attr({
								'tabindex' : 0,
								'aria-selected' : true
							})
						.end()
						.siblings()
							.removeClass('current')
							.find('a')
							.attr({
								'tabindex' : -1,
								'aria-selected' : false
							})
				}

				switch( moveTo ) {
					case ( -($slides.length - 1) * 100 ):
						$target.filter(opt.nextSlide).addClass('disabled');
						break;
					case 0:
						$target.filter(opt.prevSlide).addClass('disabled');
						break;
				}
			}
		};

		$(opt.nextSlide + ',' + opt.prevSlide).click(function(e) {
			var $el = $(this),
				link = $el.attr('href'),
				dir = ( $el.is(opt.prevSlide) ) ? 'prev' : 'next',
				$slider = $(link);

				if ( $el.is('.disabled') ) { 
					return false;
				}

				carousel.nextPrev($slider, dir);
				
			e.preventDefault();
		})
		.keydown(function(e) {
			var $el = $(this),
				link = $el.attr('href');

			switch (e.which) {
				case 37:
				case 38:
					$(opt.prevSlide).filter('[href="' + link + '"]').trigger('click').focus();
					break;
				case 39:
				case 40:
					$(opt.nextSlide).filter('[href="' + link + '"]').trigger('click').focus();
					break;
			}
		});

		$(opt.prevSlide).addClass('disabled');

		//swipes trigger move left/right
		this.live( "dragSnap", function(e, ui){
			var $slider = $(this).find( opt.slider ),
				dir = ( ui.direction === "left" ) ? 'next' : 'prev';
				
			carousel.nextPrev($slider, dir);
		});
		
		if( opt.pagination ) {
			carousel.createPagination(this);
		}

		return this.each(function(carInt) {
			var $wrap = $(this),
				$slider = $wrap.find(opt.slider),
				$slide = $wrap.find(opt.slide),			
				slidenum = $slide.length,
				speed = opt.speed / 1000;

			$wrap.css({
				overflow: "hidden",
				width: "100%"
			});
			
			$slider.css({
				marginLeft: "0px",
				float: "left",
				width: 100 * slidenum + "%"
			});
				    
			$slide
				.css({
					float: "left",
					width: (100 / slidenum) + "%"				
				})
				.each(function(i) {
					var $el = $(this),
						tmp = 'carousel' + ( carInt + 1 ),
						i = i + 1;

					$el.attr({
						role : "tabpanel",
						id : tmp + '-slide' + i
					});
					
					if( opt.pagination ) {
						$el.attr('aria-labelledby', tmp + '-tab' + i);
					}
				});

			carousel.navState($slider, 0);
			carousel.transitionSwap($slider, true);
		});

	};
		
	$.event.special.dragSnap = {
		setup: function() {
			var $el = $(this);

			$el
				.bind("touchstart", function(e) {
					var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
						start = {
							time: (new Date).getTime(),
							coords: [ data.pageX, data.pageY ],
							origin: $(e.target).closest('.slidewrap')
						},
						stop,
						$tEl = $(e.target).closest('.slider'),
						currentPos = ( $tEl.attr('style') != undefined ) ? $tEl.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1) : 0;

					carousel.transitionSwap($tEl, false);

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
							carousel.transitionSwap($tEl, true);

							if (start && stop ) {

								if (Math.abs(start.coords[0] - stop.coords[0]) > 10
									&& Math.abs(start.coords[0] - stop.coords[0]) > Math.abs(start.coords[1] - stop.coords[1])) {
									e.preventDefault();
								} else {
									carousel.snapBack($tEl, true);
									return;
								}

								if (Math.abs(start.coords[0] - stop.coords[0]) > 1 && Math.abs(start.coords[1] - stop.coords[1]) < 75) {
									var left = start.coords[0] > stop.coords[0];

								if( -( stop.coords[0] - start.coords[0]) > ( start.origin.width() / 4 ) || ( stop.coords[0] - start.coords[0]) > ( start.origin.width() / 4 ) ) {

									start.origin.css("marginLeft", 0).trigger("dragSnap", {direction: left ? "left" : "right"});

									} else {								
										carousel.snapBack($tEl, left);
									}

								}
							}
							start = stop = undefined;
						});
				});
		}
	};
})(jQuery);