(function($, undefined) {
	$(document).ready(function() {
		var socket = io.connect(window.location.pathname),
			$total = $('[data-jogger-total]').first(),
			$jogger = $('[data-jogger]'),
			totalLogs = $total.data('jogger-total');

		/**
		 * Isotime helper for use with $.timeago
		 */
		Handlebars.registerHelper('isotime', function(time) {
	  		return (function (d){
				 function pad(n){return n<10 ? '0'+n : n}
				 return d.getFullYear()+'-'
				      + pad(d.getUTCMonth()+1)+'-'
				      + pad(d.getUTCDate())+'T'
				      + pad(d.getUTCHours())+':'
				      + pad(d.getUTCMinutes())+':'
				      + pad(d.getUTCSeconds())+'Z'}(new Date(time)));
	  	});
	  	// Converts timestamps into readable text
		$('.jog-entry time').timeago();

		/**
		 * Handlebars template for log entries
		 */
		Handlebars.templates = Handlebars.templates || {};
	  	Handlebars.templates['body.html'] = Handlebars.compile(
	  		$('#body-template').html()
	  	);


		/**
		 * Process incoming data from jog-watcher
		 */
		socket.on('data', function(data) {
			if (!Array.isArray(data)) {
				data = [data];
			}

			// Increment the log count
			totalLogs += data.length;
			$total.text(totalLogs);

			var $content = $(Handlebars.templates['body.html']({
				queue: data
			}));

			$jogger.each(function() {
				var $this = $(this),
					$entries = $('.jog-entry', $this);

				// Append the new log entry
				$this.prepend($content.hide());
				$('time', $content).timeago();
				$content.slideDown();

				// Remove the old log entry if it's above the limit
				if ($entries.size() >= $this.data('jogger')) {
					$entries.last()
						.slideUp(400)
						.fadeOut(400, function() {
							$(this).remove();
						});
				}
			});
		});

		/**
		 * Readme slide-down
		 */
		$('.more-info').click(function(event) {
			$('.info').slideToggle(500);
			$('.more-info').toggleClass('viewing');

			event.preventDefault();
			return false;
		})
	});
}(jQuery));