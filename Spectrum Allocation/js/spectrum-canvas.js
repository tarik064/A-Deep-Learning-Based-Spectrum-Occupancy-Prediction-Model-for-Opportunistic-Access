'use strict'

var scale = 30;
var leftOffset = 15;

function drawSpectrum (elementId) {
	var canvasDiv, canvas, ctx, i;
	
	
// 	drawSpectrum.
    canvasDiv = document.getElementById(elementId);
    
    console.log('xxx', canvasDiv, canvasDiv.offsetWidth, canvasDiv.height);
    
    canvasDiv.innerHTML =
        '<canvas id="spectrumCanvas" width="' + canvasDiv.offsetWidth + ' " height="' + canvasDiv.offsetHeight + '"></canvas>'
        ;
        
	canvas = document.getElementById("spectrumCanvas");      
	
	console.dir(canvas);
	
	ctx = canvas.getContext("2d");
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	ctx.font = "12px arial,sans";
	
	highlightRegulatedBand(ctx, 0, 1000000000000);
		
	ctx.fillStyle = 'black';
	ctx.strokeStyle = 'black';
	
	for (i=0; i<26; i+=1) {
		ctx.beginPath(); 
		
		if ( i % 2 === 0 ) {
			var x = (i * scale) + leftOffset;
			ctx.moveTo(x, 20);
			ctx.lineTo(x, canvas.height - 10);
			ctx.lineWidth = 1;
			ctx.stroke();
		
			var text = '10 '+ superscriptNumber(i);		
			var metrics = ctx.measureText(text);
		
			ctx.fillText(text, x-(metrics.width/3), 15);

		} else {
// 				var x = (i * scale) + leftOffset;			
// 				var waveLength = wavelengthInMetres(Math.pow(10,i));
// 				waveLength = waveLength * 1000;
// 				
// 				var exp = getBaseLog(10, waveLength);
// 				text = '10 '+ superscriptNumber(exp);		
// 				metrics = ctx.measureText(text);
// 			
// 				ctx.fillText(text, x-(metrics.width/3), 80);		    
		}
		
	}
	
// 	drawWave(ctx, 0, 0, 600, 80);

	highlightVisibleBand(ctx);
	

}


function highlight(ctx, startFreq, endFreq, color, text) {
   var x1 = (startFreq!==0?getBaseLog(10, startFreq):0);       
   var x2 = 0;
   if (endFreq === Infinity) {
        x2 = ctx.canvas.width;
   } else {
        x2 = getBaseLog(10, endFreq);
        x2 = (x2 * scale) + leftOffset;
   }

   x1 = (x1 * scale) + leftOffset;
   
   var height = 79;
   var width = x2 - x1;
   
   ctx.beginPath(); 
   ctx.rect(x1 ,0, width, height);
   
   ctx.fillStyle = color;
   ctx.fill(); 
   ctx.strokeStyle = color;       
   ctx.stroke(); 
   
   if (text && text.trim().length > 0) {
   console.log('a: ' + text);
       ctx.fillStyle = 'black';
	   ctx.strokeStyle = 'black';
       var metrics = ctx.measureText(text);
       console.log('xxxx');
       ctx.font = "12px sans";
       fontHeight = 12 * 1.2;
       console.log('xxxx')
       var fx = width / 2 - metrics.width / 2;
       var fy = 80;//100 / 2 - fontHeight / 2;
       console.log('zz', fx, fy, metrics);       
       ctx.fillText(text, x1 + fx, fy / 2);
       // http://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
   }      
}

function highlightRegulatedBand(ctx) {
   var startFreq, endFreq;
   
   startFreq = 0;
   endFreq = 1000000000000;   
   highlight(ctx, 0, 1000000000000, 'rgba(240,240,240,0.5)'); 
}   


function highlightVisibleBand(ctx) {
   var start = 4.8 *  Math.pow(10,14);
   var end = 7.0 * Math.pow(10,14);  
	
   var x1 = getBaseLog(10,start);
   var x2 = getBaseLog(10,end);
   x1 = (x1 * scale) + leftOffset;
   x2 = (x2 * scale) + leftOffset;                         

   var alpha = ctx.globalAlpha;
   ctx.globalAlpha=0.7;
   
   var grad = ctx.createLinearGradient(x1,0,x2,0);
   grad.addColorStop(0, "red");
   grad.addColorStop(0.4, "yellow");
   grad.addColorStop(0.6, "green");
   grad.addColorStop(1, "blue");
   
   highlight(ctx, start, end, grad);
}

function getBaseLog(x, y) {
   return Math.log(y) / Math.log(x);
}

function superscriptNumber(intNumber) {
	var text = '', number, supers, digit;
	number = Math.round(intNumber);
	supers = '⁰¹²³⁴⁵⁶⁷⁸⁹'.split('');
	if (intNumber === 0) {
		text = supers[0];
	} else {
		while (Math.floor(number) > 0) {
			digit = number % 10;
			number = Math.floor(number / 10);
			text =  supers[digit] + text;
		}        
	}
	return text;
}