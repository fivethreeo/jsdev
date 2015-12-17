/**
 * Main app initialization and initial auth check
 */
// Require.js allows us to configure shortcut alias
require.config({
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
	'shim': {
		'underscore': {
			'exports': '_'
		},
		'backbone': {
			'deps': [
				'underscore',
				'jquery'
			],
			'exports': 'Backbone'
		}
	},
	'paths': {
		'jquery': 'bower_components/jquery/dist/jquery',
		'underscore': 'bower_components/underscore/underscore',
		'backbone': 'bower_components/backbone/backbone',
		'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap',
		'text': 'bower_components/text/text'
	}
});
require([
    "jquery", "underscore", "bootstrap"
],
function($, _, B$) {
$(window).scroll(function() {
if ($(this).scrollTop() > 1){  
    $('.navbar').addClass("white");
  }
  else{
    $('.navbar').removeClass("white");
  }
});
$("a[href^='#']").on('click', function(event) {
  var target;
  target = this.hash;

  event.preventDefault();

  var navOffset;
  navOffset = $('.navbar').height();

  return $('html, body').animate({
    scrollTop: $(this.hash).offset().top - navOffset
  }, 300, function() {
    return window.history.pushState(null, null, target);
  });
});
});