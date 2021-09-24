'use strict'


var SpectrumChart = (function(containerElementId, bands) {
	var version = '';
	var snap;
	var boundingBox = {
		x: 0,
		y: 0,
		width: 1024,
		height: 1024
	};

	function drawFullChart() {
		var height, spacing, i, text;

		var ranges = [
			[3 * Math.pow(10, 3), 300 * Math.pow(10, 3)],
			[300 * Math.pow(10, 3), 3 * Math.pow(10, 6)],

			[3 * Math.pow(10, 6), 30 * Math.pow(10, 6)],
			[30 * Math.pow(10, 6), 300 * Math.pow(10, 6)],

			[300 * Math.pow(10, 6), 3 * Math.pow(10, 9)],
			[3 * Math.pow(10, 9), 30 * Math.pow(10, 9)],
			[30 * Math.pow(10, 9), 300 * Math.pow(10, 9)]
		];

		spacing = 30;
		height = (boundingBox.height) / ranges.length;

		for (i = 0; i < ranges.length; i++) {

			var box = {
				x: boundingBox.x,
				y: (height + spacing) * i,
				width: boundingBox.width,
				height: height
			};

			drawChart(ranges[i], box, true);

		}

	};

	function getServiceAndColor(text) {
		var candidate = [''],
			i;

		text = text + '';

		for (i = 0; i < servicesAndColors.length; i++) {
			if (text.toLowerCase().startsWith(servicesAndColors[i][0].toLowerCase()) && servicesAndColors[i][0].length > candidate[0].length) {
				candidate = servicesAndColors[i];
			}
		}
		return (candidate[0] !== '' ? candidate : undefined);
	};

	function drawChart(range, boundingBox, logarithmic) {
		var i, j, width, height, offsetX = 0, offsetY, len, service, services, text;
		var lf, uf, drawOutline = true;


        // draw the chart outline

        if (drawOutline) {
            snap.rect(
                boundingBox.x,
                boundingBox.y,
                boundingBox.width,
                boundingBox.height -30).attr({
                stroke: 'white',
                fill: 'white',
                class: 'outline'
            });
        }

        // draw the range labels under the chart

        height = boundingBox.height - 30;
        width = boundingBox.width;

        text = snap.text(boundingBox.x, boundingBox.y + height + 15, valueToMagnitude(range[0], 'Hz'));
        text = snap.text(boundingBox.x + width, boundingBox.y + height + 15, valueToMagnitude(range[1], 'Hz'));
        text.attr({ x: boundingBox.x + width - text.getBBox().width });

        // calculate the range, depending on whether we are in linear or logarithmic mode

		if (logarithmic) {
			len = Math.log10(range[1]) - Math.log10(range[0]);
		} else {
			len = range[1] - range[0];
		}
        len = len * 1.0;



        // draw the services. currently only support one table at a time.
//        var cumWidth = 0, mLf, mUf =0;

		for (i = 0; i < bands.length; i++) {

// 		    if (bands[i].lf >= range[1]) {
// 		        break;
// 		    }


			if (bands[i].uf >= range[0] && bands[i].lf <= range[1]) {

//                console.log(bands[i].lf, bands[i].uf, JSON.stringify(bands[i].services));

				if (logarithmic) {
					lf = Math.log10(bands[i].lf);
					uf = Math.log10(bands[i].uf);

					if (lf === Infinity || lf === -Infinity) {
						lf = 0;
					}

	                if (lf < Math.log10(range[0])) {
				        lf = Math.log10(range[0]);
				    }
				    if (uf > Math.log10(range[1]))   {
				        uf = Math.log10(range[1]);
				    }
				} else {
				    lf = parseInt(bands[i].lf);
				    uf = parseInt(bands[i].uf);

				    if (lf < range[0]) {
				        lf = range[0];
				    }
				    if (uf > range[1]) {
				        uf = range[1];
				    }
				}

				width = boundingBox.width * ((uf - lf)/len);

				if (bands[i].services && bands[i].services.length > 0) {

					services = bands[i].services;

                    // Sort the entries, so the primary services are displayed first
                    services.sort(function (x, y) {

                        if (y.cat === 'p' && x.cat !== 'p') {
                            return 1;
                        }

                        if (x.cat === 'p' && y.cat !== 'p') {
                            return -1;
                        }

                        return x.desc.localeCompare(y.desc);
                    });

					offsetY = boundingBox.y;
					for (j = 0; j < services.length; j++) {
						height = (boundingBox.height-30) / services.length;
						drawServce(bands[i].services[j], offsetX, offsetY, width, height);
						offsetY = offsetY + height;
					}

				} else {
					snap.rect(offsetX, boundingBox.y, width, height).attr({
						stroke: 'black',
						fill: 'white',
						'class': 'service'
					});
				}

				offsetX = offsetX + width;

			}
		}

	}

	function drawServce(service, x, y, width, height) {
		var rect, text, serviceAndColor;
		var fillColor = 'white';
		var serviceName = '';

		serviceAndColor = getServiceAndColor(service.desc);

		if (serviceAndColor) {
			fillColor = serviceAndColor[1];
			serviceName = serviceAndColor[0];
		} else {
		    if (service.desc !== '-') {
		        serviceName = service.desc;
		    }
		}

		rect = snap.rect(x, y, width, height).attr({
			stroke: 'black',
			fill: fillColor,
			strokeWidth: 1,
			'class': 'service ' + serviceName.replace(' ','')
		});

        text = snap.text(-200, -200, '');

        if (service.cat === 'p') {
            serviceName = serviceName.toUpperCase();
        }

        text.append( Snap.parse('<tspan> ' + serviceName + ' </tspan>') );

        text.attr({
            x: x + (width / 2 - (text.getBBox().width / 2)),
            y: y + (height / 2 + (text.getBBox().height / 2)),
            width: width,
            'class': 'service ' //+ serviceName.replace(' ','')
        });

        var textBBox = text.getBBox();
        if (textBBox.width > width) {
            var transform = '';
            if (width > height) {
                transform = 's' + (width / textBBox.width);
            } else {
                transform += 'r-90';
                if (textBBox.width > height) {
                    transform += ' s' + ((height / textBBox.width) * 0.9);
                } else {
                    transform += ' s' + ((width / textBBox.width) * 0.9);
                }
            }
            text.transform(transform);

        }

	}

	function init() {
		var svgRef = '#' + containerElementId;

		if ($(svgRef).type !== 'svg') {
			boundingBox.width = $(svgRef).width();
			boundingBox.height = $(svgRef).height();

			$(svgRef).html('<svg width="' + $(svgRef).width() + 'px" height="' + $(svgRef).height() + 'px" shape-rendering="crispEdges"/>');
			svgRef = svgRef + ' svg';
		}

		snap = Snap(svgRef);
	}

	init();
	drawFullChart();
});

var allocationData;
$(document).ready(function() {
    var i;

	$('#allocationChart').html('loading...');

	$('#legend').append('<ul></ul>');
	for (i=0; i<servicesAndColors.length; i++) {
        $('#legend ul').append(
            '<li class="key" id="' + servicesAndColors[i][0].replace(' ','') + '"><div class="colorbox" style="background: ' +
            servicesAndColors[i][1] + '"></div><div>' + servicesAndColors[i][0] + '</div></li>'
            );
	}

    var clickActive = false;
    var activeService = undefined;
	$('li.key').on('mouseenter', function () {

         if (clickActive) {
             return;
         }

	     Snap.selectAll('.outline').forEach( function (element, b) {
	     	 element.addClass('outlineActive');
	     });

	     Snap.selectAll('.service').forEach( function (element, b) {
	     	 element.addClass('rectHidden');
	     });

	     Snap.selectAll('.' + $(this).attr('id')).forEach( function (element, b) {
	     	 element.removeClass('rectHidden');
	     });

	     Snap.selectAll('.' + $(this).attr('id')).forEach( function (element, b) {
	     	 element.addClass('rectHighlight');
	     });

	});

	$('li.key').on('mouseleave', function () {

         if (clickActive) {
             return;
         }

	     Snap.selectAll('.outline').forEach( function (element, b) {
	     	 element.removeClass('outlineActive');
	     });

	     Snap.selectAll('.service').forEach( function (element, b) {
	     	 element.removeClass('rectHidden');
	     });

	     Snap.selectAll('.service').forEach( function (element, b) {
	     	 element.removeClass('rectHighlight');
	     });

	});

	$('li.key').on('click', function () {

         if (clickActive) {

            if ( $(this).attr('id') === activeService ) {
                 $(this).removeClass('legendItemActive');

                 Snap.selectAll('.outline').forEach( function (element, b) {
                     element.removeClass('outlineActive');
                 });

                 Snap.selectAll('.service').forEach( function (element, b) {
                     element.removeClass('rectHidden');
                 });

                 Snap.selectAll('.service').forEach( function (element, b) {
                     element.removeClass('rectHighlight');
                 });

                 activeService = undefined;
                 clickActive = false;
             }
         } else {

             $(this).addClass('legendItemActive');

             Snap.selectAll('.outline').forEach( function (element, b) {
                 element.addClass('outlineActive');
             });

             Snap.selectAll('.service').forEach( function (element, b) {
                 element.addClass('rectHidden');
             });

//              Snap.selectAll('text').forEach( function (element, b) {
//                  element.addClass('rectHidden');
//              });

             Snap.selectAll('.' + $(this).attr('id')).forEach( function (element, b) {
                 element.removeClass('rectHidden');
             });

             Snap.selectAll('.' + $(this).attr('id')).forEach( function (element, b) {
                 element.addClass('rectHighlight');
             });

             activeService = $(this).attr('id');
             clickActive = true;

         }


	});

	$('select[name=\'activity\']').on('change', function() {
	    var tableIdx = $(this).val();
	    $('#allocationChart').html('loading...');
	    setTimeout(function() {
    	    SpectrumChart('allocationChart', allocationData.tables[tableIdx].bands);
    	    }, 0);
	});


    loadAvailableRegions('#regionSelector', function(region) {
        var url = baseRestPath + '/tables/' + region + '/index.json';

        $.getJSON(url, function(data) {
            var i, activitySelect;

            allocationData = data;
            $('.region').html(data.metadata.name_en);

            activitySelect = $('select[name=\'activity\']');
            if (data.tables.length === 1) {
                activitySelect.html('<option>All</option>');
                activitySelect.attr('disabled',true);
            } else {
                activitySelect.html('');
                for (i=0; i<data.tables.length; i++) {
                    activitySelect.append('<option value="' + i + '">' + data.tables[i].name + '</option>');
                }
                activitySelect.attr('disabled',false);
            }

            $('#allocationChart').html('loading...');

            setTimeout(function() {
                var spectrumChart = SpectrumChart('allocationChart', data.tables[0].bands);
                }, 0);
        });
    });


});