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

		function move($slider, direction) {
			var leftmargin = $slider.attr('style').match(/margin\-left: ?(.*)%;/) && parseFloat(RegExp.$1),
				$slide = $slider.find(opt.slide);

			if(!$slider.is(":animated")) {	
				if(direction == 'next') {
					leftmargin -= 100;
				} else {
					leftmargin += 100;
				}
				
				if(transitionSupport) {
					$slider.css('marginLeft', leftmargin + "%");
				} else {
					$slider.animate({ marginLeft: leftmargin + "%" }, opt.speed);
				}
								
				if((-leftmargin) == ($slide.length - 1) * 100 || leftmargin == 0) {
					return false;
				}
			}
		}


		$(opt.nextSlide + ',' + opt.prevSlide).click(function(e) {
			var $el = $(this),
				link = $el.attr('href'),
				$target = $(opt.slider).filter(link);
				
				if(!$el.hasClass('disabled')) {
					$(opt.nextSlide).each(function() {
						 if(this == $el[0]) {
							if(move($target, 'next') === false) {
								$el.addClass('disabled');
							};
							$(opt.prevSlide).filter(function() { 
								return this.getAttribute('href') === link;
							}).removeClass('disabled');
						}
					});

					$(opt.prevSlide).each(function() {
						 if(this == $el[0]) {
							if(move($target, 'prev') === false) {
								$el.addClass('disabled');
							};
							$(opt.nextSlide).filter(function() {
								return this.getAttribute('href') === link;
							}).removeClass('disabled');
						}
					});
				}
			e.preventDefault();
		});

		return this.each(function() {
			var $wrap = $(this),
				$slider = $wrap.find(opt.slider),
				$slide = $wrap.find(opt.slide),			
				slidenum = $slide.length,
				speed = opt.speed / 1000;

			$wrap.css({
				float: "left",
				overflow: "hidden"
			});
			$slider.css({
				marginLeft: "0px",
				styleFloat: "left",
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
})(jQuery);