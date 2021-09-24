var Spectrum = (function (elementId, frequencyRange) {

    Spectrum.version = "0.0.1";
    var containerWidth = 900;
    var containerHeight = 90;
    var displayFreqRange = [3,3];
    var graphBoundingBox;
    var snap;

    function init(elementId) {
        var element, elementRef, snap;

        elementRef = '#' + elementId;
        element = $(elementRef);

        containerWidth = element.width();
        containerHeight = element.height();


        html = '<svg style="width: ' + element.width() + 'px; height: ' + element.height() + 'px; border: solid 1px black" shape-rendering="crispEdges"/>';

        element.append(html);

        return Snap(elementRef + ' svg');
    }

    function drawSpectrum (snap) {
        drawGraph(this.snap, 40, 5, containerWidth, containerHeight - 10, this.freqRange);

    }

    function drawGraph (snap, x, y, width, height, range) {

        var markerXInterval = 100;
        var markerXCount = 10;

        displayFreqRange = range;
        middleLineY = height / 2;

        exponentAdjust = 0;
        var baseExp = Math.log10(range[0]);

    //     rangeLen = range[1] - range[0];
        if (range[0] === 0) {
             rangeLen = Math.log10(range[1]) - (-3);
             exponentAdjust = -3;
        } else {
             rangeLen = Math.log10(range[1]) - Math.log10(range[0]);
        }
//         console.log(rangeLen);

    //     rangeLen = range[1] - range[0];
        markerXInterval = width / markerXCount;

        var prevFrequencyTextBox, prevWavelengthTextBox;

        prevValue = -1

        graphBoundingBox = { x: x, y: y, width: width, height: height};

        highlightVisibleBand(snap, graphBoundingBox);

        for (i=0; i<labelledBands.length; i++) {
            highlight(snap, labelledBands[i].lf, labelledBands[i].uf, 'rgba(0,0,0,0.1)', undefined, labelledBands[i].text, 'labelledRange');
        }

        for (xOffset=0; xOffset <= width; xOffset++) {

             exponent = ((xOffset/width) * rangeLen) + baseExp;
             frequency = Math.pow(10,exponent + exponentAdjust);

             if (xOffset % markerXInterval === 0) {
                  lineLen = 5;

                  frequencyLine = y + 25;
                  lineLen = 10;

                  var val = frequency + '';
                  var str =  Math.round(frequency, 2) + '';

                  str = Math.round(Math.log10(val),2);
                  str = valueToMagnitude( frequency, 'Hz', 2);

                  text = snap.text((x + xOffset), frequencyLine - (lineLen + 5), str).attr({
                         'font-size': 10
                     });
                  text.attr('x', (x + xOffset) - text.getBBox().width / 2);

                  if (text.getBBox().x < 0) {
                     text.remove();
                  } else if (prevFrequencyTextBox &&
                      (prevFrequencyTextBox.x + prevFrequencyTextBox.width) > text.getBBox().x) {
                      text.remove();
                  } else {
                     prevFrequencyTextBox = text.getBBox();
                     //lineLen = 10;
                  }

                  line = snap.line((x + xOffset), frequencyLine, (x + xOffset), frequencyLine - lineLen).attr({
                    'stroke': 'black',
                    'stroke-width': '1px'
                  });

            }
    //          console.log( frequencyToWavelength(frequency), Math.log10(frequencyToWavelength(frequency)), valueToMagnitude(frequencyToWavelength(frequency), 'm', 2) );

            if ((xOffset + (markerXInterval/2)) % markerXInterval === 0) {
                  var str = valueToMagnitude(
                       frequencyToWavelength(frequency), 'm', 2);


                  wavelengthLine = height - 20;
                  lineLen = 10;

                  text = snap.text((x + xOffset), wavelengthLine + lineLen + 15, str).attr({
                         'font-size': 10
                     });
                  text.attr('x', (x + xOffset) - text.getBBox().width / 2);

                  if (text.getBBox().x < 0) {
                     text.remove();
                  } else if (prevWavelengthTextBox &&
                      (prevWavelengthTextBox.x + prevWavelengthTextBox.width) > text.getBBox().x) {
                      text.remove();
                  } else {
                     prevWavelengthTextBox = text.getBBox();
                     lineLen = 10;
                  }

                  line = snap.line((x + xOffset), wavelengthLine, (x + xOffset), wavelengthLine + lineLen).attr({
                    'stroke': 'black',
                    'stroke-width': '1px'
                  });
            }

    //         if (frequencyToWavelength(
            prevValue = (xOffset/width) * rangeLen;
        }


    }

    function highlightDisplayedRange(startFreq, endFreq) {
        highlight(snap, startFreq, endFreq, 'rgba(240,240,100,0.5)', '', 'selected range', 'regulatedspectrum', 'filteredRangeRect',

        {
                x: graphBoundingBox.x,
                y: graphBoundingBox.y + 26,
                width: graphBoundingBox.width,
                height: graphBoundingBox.height - 52
             });
    }


    function highlightVisibleBand(snap) {
        var gradient, start, end, x1, x2;

        start = 4.0 * Math.pow(10, 14);
        end = 7.9 * Math.pow(10, 14);

        gradient = snap.gradient('l(0, 0, 1, 0)red-orange-yellow-green-blue-indigo-violet');
        highlight(snap, start, end, gradient, '', 'visible spectrum', undefined);
    }


    function highlight(snap, startFreq, endFreq, color, text, title, cssClass, elementId, boundingBox) {
        var textElem, height, width, text, x1, x2, scale, rect;
        var leftOffset = 0;
    // console.log('zzz', displayFreqRange[0], displayFreqRange[1], startFreq, endFreq);


//         console.log(startFreq, endFreq, valueToMagnitude(startFreq,'Hz',2), valueToMagnitude(endFreq,'Hz',2));

        if (!boundingBox) {
            boundingBox = graphBoundingBox;
        }

        if ( startFreq > displayFreqRange[1] || endFreq < displayFreqRange[0] ) {
            return;
        }


        if ( endFreq < startFreq ) {
            if (rect) {
                rect.hide();
            }
            return;
        }

        if (startFreq < displayFreqRange[0]) {
            startFreq = displayFreqRange[0];
        }

        if (endFreq > displayFreqRange[1]) {
            endFreq = displayFreqRange[1];
        }

        scale = boundingBox.width / (Math.log10(displayFreqRange[1]) - Math.log10(displayFreqRange[0]));
    //     scale = containerWidth / (displayFreqRange[1] - displayFreqRange[0]);

        x1 = (Math.log10(startFreq)) - (Math.log10(displayFreqRange[0]));
        x1 = (x1 * scale) + boundingBox.x;


        x2 = (Math.log10(endFreq)) - (Math.log10(displayFreqRange[0]));
        x2 = (x2 * scale) + boundingBox.x;


        height = boundingBox.height;

        width = (x2 - x1);

        if (Snap.select('#'+elementId)) {
             Snap.select('#'+elementId).attr({
                x: x1,
                y: boundingBox.y,
                width: width,
                height: height
             });
        } else {
            rect = snap.rect(x1, boundingBox.y, width, height);

            rect.attr("fill", color);
            rect.attr("stroke", color);
            rect.attr('title', title);

            if (cssClass && cssClass.trim().length > 0) {
                rect.addClass(cssClass);
            }

            if (elementId && elementId.trim().length > 0) {
                rect.attr('id',elementId);
            }

            if (title) {
                rect.append(Snap.parse('<title>' + title + '</title>'));
            }
        }




        return rect;
    }


//     function drawWave(snap, x, y, width, height, range) {
//         var pathCoords = [];
//         for (xOffset=0; xOffset <= width; xOffset++) {
//         console.log('xxx', (xOffset/markerXInterval));
//
//     //         valX = (xOffset+100)/width * rangeLen;
//             z = Math.sin( Math.pow(10, (xOffset/width) * rangeLen) * (width/markerXInterval) );
//             console.log(x, z);
//             pathCoords.push([x + xOffset, (z*40) + 40]);
//         }
//         console.log(pathCoords);
//         drawPath(snap, pathCoords);
//     }
//
//     function drawPath(snap, coords) {
//         var pathStr, i;
//         pathStr = 'M' + coords[0][0] + ' ' + coords[0][1];
//         for  (i=0; i < coords.length; i++) {
//             pathStr += 'L' + coords[i][0] + ' ' + coords[i][1];
//         }
//         return snap.path(pathStr).attr({ 'fill': 'none', 'stroke': 'black' });
//     }


    snap = init(elementId);

    Spectrum.prototype.highlightDisplayedRange = highlightDisplayedRange;
    Spectrum.prototype.snap = snap;
    Spectrum.prototype.containerWidth = 900;
    Spectrum.prototype.containerHeight = 90;
    Spectrum.prototype.freqRange = frequencyRange;
    Spectrum.prototype.drawSpectrum = drawSpectrum;

    var inset = 10;
    Spectrum.prototype.graphBoundingBox = { x: 0 + inset, y: 0 + inset, width: containerWidth + (inset * 2), height: containerHeight + (inset * 2)}

    Spectrum.prototype.drawSpectrum();


    return Spectrum.prototype;
});