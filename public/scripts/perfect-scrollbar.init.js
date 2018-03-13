// SCROLL BAR
$(document).ready(function(e) {

	function changeSize() {
		var width = parseInt($("#Width").val());
		var height = parseInt($("#Height").val());
		var Ps = require('perfect-scrollbar');
	
		$(".st-perfectscrollbar").width(width).height(height);
	
		// update scrollbars
		$('.st-perfectscrollbar').perfectScrollbar('update');
	}
	
	$(function() {
		$('.st-perfectscrollbar').perfectScrollbar();
	});

});
