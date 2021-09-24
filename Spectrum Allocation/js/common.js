function populateRegionSelector(regionList, regionSelectorRef, callback) {
	

	$(regionSelectorRef).append('<optgroup label="Countries" id="countries-optgroup"/>');

	$.each(regionList, function(idx, entry) {
		if (!entry.path.startsWith('itu')) {
			$('#countries-optgroup')
				.append($("<option></option>")
				.attr("value", entry.path)
				.text(entry.region));
		}
	});

	$(regionSelectorRef).on('change', function(event, v) {
		$('#bands tbody').html('');
		callback($(this).val());
		document.location = '#' + $(this).val();
	});


	// Get the hash value, so we automatically load the right table

	var region = 'itu1';
	if (window.location.hash) {
		region = window.location.hash.substring(1);
	}

	$(regionSelectorRef).val(region);

	callback(region);
}

function loadAvailableRegions(regionSelector, callback) {
	var url = baseRestPath + '/tables/index.json';
	$.getJSON(url, function(data) {
	    populateRegionSelector(data, regionSelector, callback);
	});
}