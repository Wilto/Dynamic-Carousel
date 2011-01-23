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
				    dStyle.MozTransition !== undefined ||
				    dStyle.msTransition !== undefined ||
				    dStyle.OTransition !== undefined ||
				    dStyle.transition !== undefined;

		$(opt.prevSlide).addClass('disabled');

		function moveNext($slider) {
			var leftmargin = $slider.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1),
				$slide = $slider.find(opt.slide);
			
			if (!$slider.is(":animated") && (-leftmargin) != (($slide.length - 1) * 100)) {
				leftmargin -= 100;
				
				alert(leftmargin);
				alert($slider.attr('style'));
				
				if(transitionSupport) {
					$slider.css('marginLeft', leftmargin + "%");
				} else {
					$slider.animate({ marginLeft: leftmargin + "%" }, opt.speed);
				}
				if((-leftmargin) == ($slide.length - 1) * 100) {
					return false;
				}
			}
		}

		function movePrev($slider) {
			var leftmargin = $slider.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1);

			if(!$slider.is(":animated") && (leftmargin != 0)) {
				leftmargin += 100;

				alert(leftmargin);
				alert($slider.attr('style'));

				if(transitionSupport) {
					$slider.css('marginLeft', leftmargin + "%");
				} else {
					$slider.animate({ marginLeft: leftmargin + "%" }, opt.speed);
				}					
				if(leftmargin == 0) {
					return false;
				}
			}
		}

		$(opt.nextSlide + ',' + opt.prevSlide).click(function(e) {
			var $el = $(this),
				link = $el.attr('href'),
				$target = $(opt.slider).filter(link);

				$(opt.nextSlide).each(function() {
					if($(this)[0] == $el[0]) {
						if(moveNext($target) === false) {
							$el.addClass('disabled');
						};
						$(opt.prevSlide).filter(function() { 
							return this.getAttribute('href') === link;
						}).removeClass('disabled');
					}
				});

				$(opt.prevSlide).each(function() {
					if($(this)[0] == $el[0]) {
						if(movePrev($target) === false) {
							$el.addClass('disabled');
						};
						$(opt.nextSlide).filter(function() {
							return this.getAttribute('href') === link;
						}).removeClass('disabled');
					}
				});

			e.preventDefault();
		});


		//swipes trigger move left/right
		$(this).live( "swipe", function(e, ui){
			(ui.direction === "left" ? moveNext : movePrev)($(this).find( opt.slider ));
		});

		return this.each(function() {
			var $wrap = $(this),
				$slider = $wrap.find(opt.slider),
				$slide = $wrap.find(opt.slide),			
				slidenum = $slide.length,
				speed = opt.speed / 1000;

			$wrap.css({
				overflow: "hidden",
				width: '100%'
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
			
			$el
				.bind("touchstart", function(e) {
					var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
						start = {
							time: (new Date).getTime(),
							coords: [ data.pageX, data.pageY ],
							origin: $(e.target)
						},
						stop;
					
					function moveHandler(e) {
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
					}
					
					$el
						.bind("touchmove", moveHandler)
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