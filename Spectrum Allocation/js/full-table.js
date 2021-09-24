'use strict'

var currentRegion;
var baseRestPath = 'rest';
var allocationTable = {};
var spectrum;


function getService(text) {
	var candidate = '' , i;

	text = text + '';

	for (i = 0; i < services.length; i++) {
		if (text.toLowerCase().startsWith(services[i].toLowerCase()) && services[i].length > candidate.length) {
			candidate = services[i];
		}
	}
	return (candidate?candidate:'');
}

function capitaliseService(text) {
	var service = getService(text);
	if (service) {
		return service.toUpperCase() + text.substring(service.length, text.length);
	}
}


// TODO look into moving this information into the metadata files


function loadAllocationTable(region) {
	var url = baseRestPath + '/tables/' + region + '/index.json';

    currentRegion = region;

	$.getJSON(url, function(data) {

		allocationTable = data;

		$('#official').html('<a href="' + data.metadata.official + '">' + data.metadata.official + '</a>');
		$('#message').html('Displaying information for region: ' + data.metadata.name_en);
		$('#edition').html(data.metadata.edition);

		renderAllocationsTable(true);
	});
}



function isInFilteredRange(band, startFreq, endFreq) {
	return (band.uf > startFreq && band.lf < endFreq);
}

function renderAllocationsTable(reloaded) {
	var startFreq, endFreq, bands, filteredActvitities, filteredServices, tableIdx, displayBand, region;
	var i, j, k, cellText, services, service, primary, footnotes, freqBand, activity, activities = [];

    // Clear error states

	$('input[name=\'startFreq\']').removeClass('error');
	$('input[name=\'endFreq\']').removeClass('error');

    // Deal with the start/lower Frequency

	startFreq = $('input[name=\'startFreq\']').val();

	if (!startFreq || startFreq.trim().length === 0) {
		startFreq = 0;
	} else {
		startFreq = parseFloat(startFreq.trim());
		startFreq = startFreq * Math.pow(10,$('select[name=\'unitLF\']').val());
	}

    // Deal with the end/upper Frequency

	endFreq = $('input[name=\'endFreq\']').val();

	if (!endFreq || endFreq.trim().length === 0) {
		endFreq = Infinity;
	} else {
		endFreq = parseFloat(endFreq.trim());
		endFreq = endFreq * Math.pow(10,$('select[name=\'unitUF\']').val());
	}

    // Deal with the selects

    filteredActvitities = $('select[name=\'activity\']').val();
    filteredServices = $('select[name=\'service\']').val();

    // Adjust the displayed highlighted range

	spectrum.highlightDisplayedRange(startFreq, endFreq);

	// Clear the table rows

	$('#bands tbody').html('');

    // Highlight any erros in the manually inputed values

	if ( endFreq < startFreq ) {
	    $('input[name=\'startFreq\']').addClass('error');
	    $('input[name=\'endFreq\']').addClass('error');
	}

    // Now display the data

    for (tableIdx = 0; tableIdx < allocationTable.tables.length; tableIdx++) {

        activity =  allocationTable.tables[tableIdx].name;

        if ( allocationTable.tables[tableIdx].name ) {
        	activities.push(allocationTable.tables[tableIdx].name);
        } else {
            activities.push('Activity ' + (tableIdx+1) );
        }

		// if we are filtering on activity, then apply the filter. Assumes single select
        if (!reloaded && (filteredActvitities && filteredActvitities.trim().length > 0)) {
			if (parseInt(filteredActvitities) !== tableIdx) {
			     continue;
			}
        }


		bands = allocationTable.tables[tableIdx].bands;

		for (i = 0; i < bands.length; i++) {
		    displayBand = true;
			freqBand = bands[i];

			if (!isInFilteredRange(freqBand, startFreq, endFreq)) {
				continue;
			}

			if (filteredServices && filteredServices.trim().length > 0) {
			    displayBand = false;
			}

			cellText = '';
			services = freqBand.services;
			if (services) {

			    // Sort the entries, so the primary services are displayed first
			    services.sort(function (x, y) {
			        if (y.cat === 'p') {
			            return 1;
			        }

			        if (x.cat === 'p') {
			            return -1;
			        }

			        return 0;
			    });

				for (j = 0; j < services.length; j++) {
					primary = false;
					service = services[j].desc;
					if (services[j].cat === 'p') {
						service = capitaliseService(service);
						primary = true;
					}

					if (filteredServices && filteredServices.trim().length > 0) {
						if (getService(services[j].desc).toLowerCase() === filteredServices.toLowerCase()) {
							displayBand = true;
						}
					}

					cellText += '<span class="' + (primary ? 'primary' : 'secondary') + '">' + service + '</span>';

					footnotes = freqBand.services[j].footnotes;

					if (footnotes && footnotes.length > 0) {
						for (k = 0; k < footnotes.length; k++) {
							cellText += ' <a href="' + footnoteLink(footnotes[k]) + '">' + footnotes[k] + '</a>'
						}
					}

					cellText += '<br/>';
				}
			}

			footnotes = freqBand.footnotes;
			if (footnotes && footnotes.length > 0) {
				for (j = 0; j < footnotes.length; j++) {
					cellText += '<a href="' + footnoteLink(footnotes[j]) + '">' + footnotes[j] + '</a> ';
				}
			}

			if (displayBand) {
				$('#bands tbody').append(
					'<tr class="activity-' + (activities.length + 1) +'"><td>' +
					'<span title="' + spacify(freqBand.lf, ' ') + ' Hz" >' + valueToMagnitude(freqBand.lf, 'Hz', 2) + '</span>' +
					' - ' +
					'<span title="' + spacify(freqBand.uf, ' ') + ' Hz" >' + valueToMagnitude(freqBand.uf, 'Hz', 2) + '</span>' +
					'</td>' +
					'<td>' + activity + '</td>' +
					'<td>' + cellText + '</td></tr>');
			}
		}
	}

    if (reloaded) {
        $('select[name=\'activity\']').html('<option value="">All</option>');
        if (activities.length > 1) {
            for (i=0; i<activities.length; i++) {
	            $('select[name=\'activity\']').append('<option value="'  + i + '">' + activities[i] + '</option>');
	        }
        } else {
        	$('select[name=\'activity\'] option').attr('title', 'only one activity table available');
        }
        $('select[name=\'activity\']').attr('disabled',  activities.length < 2);
    }
}


function applyFilter () {
    renderAllocationsTable(false);
}

var spectrum;

$(document).ready(function() {
 	var i;

	spectrum = Spectrum('spectrum', [ 3 * Math.pow(10,0), Math.pow(10,23)]);

	loadAvailableRegions('#regionSelector', loadAllocationTable);

	for (i=0; i<services.length; i++) {
		$('select[name=\'service\']').append('<option value="'  + services[i] + '">' + services[i] + '</option>');
	}

	$('#applyFilter').on('click', function() {
		applyFilter();
	});
});