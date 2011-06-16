(function($){
	$.fn.carousel = function(config) {
		var defaults = {
			slider: '.slider',
			slide: '.slide',
			prevSlide: '.prev',
			nextSlide: '.next',
			speed: 500
		},
		opt = $.extend(defaults, config),
		dStyle = document.body.style,
		transitionSupport = dStyle.webkitTransition !== undefined || 
				    dStyle.mozTransition !== undefined ||
				    dStyle.msTransition !== undefined ||
				    dStyle.oTransition !== undefined ||
				    dStyle.transition !== undefined,
				
		move = function($slider, dir) {
			var leftmargin = $slider.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1),
				$slide = $slider.find(opt.slide),
				constrain = ( dir === 'prev' ? leftmargin != 0 : -leftmargin != ($slide.length - 1) * 100 ),
				$target = $( '[href="#' + $slider.attr('id') + '"]');

			if (!$slider.is(":animated") && constrain ) {
				leftmargin = ( dir === 'prev' ) ? leftmargin + 100 : leftmargin - 100;
				
				if(transitionSupport) {
					$slider.css('marginLeft', leftmargin + "%");
				} else {
					$slider.animate({ marginLeft: leftmargin + "%" }, opt.speed);
				}
				
				$target.removeClass('disabled');
				switch( leftmargin ) {
					case ( -($slide.length - 1) * 100 ):
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

				move($slider, dir);
				
			e.preventDefault();
		});
		$(opt.prevSlide).addClass('disabled');

		//swipes trigger move left/right
		$(this).live( "swipe", function(e, ui){
			var $slider = $(this).find( opt.slider ),
				dir = ( ui.direction === "left" ) ? 'next' : 'prev';

			move($slider, dir);
		});

		return this.each(function() {
			var $wrap = $(this),
				$slider = $wrap.find(opt.slider),
				$slide = $wrap.find(opt.slide),			
				slidenum = $slide.length,
				speed = opt.speed / 1000;

			$wrap.css({
				overflow: "hidden"
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
		
	//modified swipe events from jQuery Mobile
	// also handles swipeleft, swiperight
	$.event.special.swipe = {
		setup: function() {
			var $el = $(this);
			
			$el.bind("touchstart", function(e) {
					var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
						start = {
							time: (new Date).getTime(),
							coords: [ data.pageX, data.pageY ],
							origin: $(e.target)
						},
						stop,
						moveHandler = function(e) {
							if(!start) {
								return;
							}
						
							var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
							stop = {
									time: (new Date).getTime(),
									coords: [ data.pageX, data.pageY ]
							};
						
							// prevent scrolling
							if (Math.abs(start.coords[0] - stop.coords[0]) > 10) {
								e.preventDefault();
							}
						};
					
					$el.bind("touchmove", moveHandler)
						.one("touchend", function(e) {
							$el.unbind("touchmove", moveHandler);
							if (start && stop) {
								if (stop.time - start.time < 1000 && 
										Math.abs(start.coords[0] - stop.coords[0]) > 30 &&
										Math.abs(start.coords[1] - stop.coords[1]) < 75) {
										var left = start.coords[0] > stop.coords[0];
									start.origin
										.trigger("swipe", {direction: left ? "left" : "right"})
										.trigger(left ? "swipeleft" : "swiperight" );
								}
							}
							start = stop = undefined;
						});
			});
		}
	};
})(jQuery);