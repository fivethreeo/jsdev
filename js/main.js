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
		'text': 'bower_components/text/text',
		'datetimepicker': 'bower_components/bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
		'moment': 'bower_components/moment/moment',
		'moment-nb': 'bower_components/moment/locale/nb'

	}
});
require([
    "jquery", "underscore", "bootstrap", "moment-nb", "datetimepicker"
],
function($, _) {
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
$(document).ready(function() {
	$('#id_dato').datetimepicker({
		calendarWeeks: true,
		format: 'YYYY-MM-DD',
		isValidCallback: function (theMoment) {
		    var isMoment = theMoment.clone().startOf('M').startOf('w').startOf('d').add(2, 'days');
		    return isMoment.format('YYYY-MM-DD') === theMoment.format('YYYY-MM-DD');
		},
		minDate: new Date(new Date().setHours(0,0,0,0))

       });
    })
});