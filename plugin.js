(function($){
	$.fn.carousel = function(config) {
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
			move : function($slider, moveTo) {
				if( carousel.transitionSupport() ) {
					$slider.css('marginLeft', moveTo + "%");
				} else {
					$slider.animate({ marginLeft: moveTo + "%" }, opt.speed);
				}
			}
		};
		var defaults = {
			slider: '.slider',
			slide: '.slide',
			prevSlide: '.prev',
			nextSlide: '.next',
			speed: 500
		},
		opt = $.extend(defaults, config),
		nextPrev = function($slider, dir) {
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

				carousel.move($slider, leftmargin);
				$target.removeClass('disabled');

				switch( leftmargin ) {
					case ( -($slide.length - 1) * 100 ):
						$target.filter(opt.nextSlide).addClass('disabled');
						break;
					case 0:
						$target.filter(opt.prevSlide).addClass('disabled');
						break;
				}
			} else {
				var reset = carousel.roundDown(leftmargin);
				
				carousel.move($slider, reset);
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

				nextPrev($slider, dir);
				
			e.preventDefault();
		});
		$(opt.prevSlide).addClass('disabled');

		//swipes trigger move left/right
		$(this).live( "dragSnap", function(e, ui){
			var $slider = $(this).find( opt.slider ),
				dir = ( ui.direction === "left" ) ? 'next' : 'prev';
				
			nextPrev($slider, dir);
		});

		return this.each(function() {
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
				width: 100 * slidenum + "%",
				"-webkit-transition": "margin-left " + speed + "s ease",
				"-moz-transition": "margin-left " + speed + "s ease",
				"-ms-transition": "margin-left " + speed + "s ease",
				"-o-transition": "margin-left " + speed + "s ease",
				"transition": "margin-left " + speed + "s ease"
			});	
				    
			$slide.css({
				float: "left",
				width: (100 / slidenum) + "%"				
			});		
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

					function moveHandler(e) {
						if(!start) {
							return;
						}
											
						var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e;

						stop = {
								time: (new Date).getTime(),
								coords: [ data.pageX, data.pageY ]
						};

						$tEl.css({"margin-left": currentPos + ( ( (stop.coords[0] - start.coords[0]) / start.origin.width() ) * 100 ) + '%' });						

						// prevent scrolling
						if (Math.abs(start.coords[0] - stop.coords[0]) > 10) {
							e.preventDefault();
						}
					};

					$el
						.bind("touchmove", moveHandler)
						.one("touchend", function(e) {

							$el.unbind("touchmove", moveHandler);

							if (start && stop) {
								
								if (Math.abs(start.coords[0] - stop.coords[0]) > 10) {
									e.preventDefault();
								}

								if (Math.abs(start.coords[0] - stop.coords[0]) > 1 && Math.abs(start.coords[1] - stop.coords[1]) < 75) {
									var left = start.coords[0] > stop.coords[0];

								if( -( stop.coords[0] - start.coords[0]) > ( start.origin.width() / 4 ) || ( stop.coords[0] - start.coords[0]) > ( start.origin.width() / 4 ) ) {

									start.origin.css("marginLeft", 0).trigger("dragSnap", {direction: left ? "left" : "right"});

									} else {										
										var currentPos = ( $tEl.attr('style') != undefined ) ? $tEl.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1) : 0,
											leftmargin = (left === false) ? carousel.roundDown(currentPos) - 100 : carousel.roundDown(currentPos);
											
										carousel.move($tEl, leftmargin);
									}

								}
							}
							start = stop = undefined;
						});
				});
		}
	};
})(jQuery);
