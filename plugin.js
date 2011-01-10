(function($){
	$.fn.carousel = function(config) {
		var defaults = {
			slider: '.slider',
			slide: '.slide',
			prevSlide: '.prev',
			nextSlide: '.next',
			speed: 500
		},
		opt = $.extend(defaults, config);
		transitionSupport = document.body.style.webkitTransition !== undefined || 
				    document.body.style.MozTransition !== undefined ||
				    document.body.style.msTransition !== undefined ||
				    document.body.style.OTransition !== undefined ||
				    document.body.style.transition !== undefined;

		$(opt.prevSlide).addClass('disabled');

		function moveNext($slider) {
			var leftmargin = $slider.attr('style').match(/margin\-left: ?(.*)%;/) && parseFloat(RegExp.$1),
				$slide = $slider.find(opt.slide);

			if (!$slider.is(":animated") && (-leftmargin) != (($slide.length - 1) * 100)) {
				leftmargin -= 100;
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
			var leftmargin = $slider.attr('style').match(/margin\-left: ?(.*)%;/) && parseFloat(RegExp.$1);

			if(!$slider.is(":animated") && (leftmargin != 0)) {
				leftmargin += 100;
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
// $target = $(opt.slider).filter("[data-slider='" + $el.attr('data-slider') + "']");

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