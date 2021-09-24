// http://www.infocellar.com/networks/wireless/spectrum.htm
var labelledBands = [{
       lf: 3,
       uf: 300 * Math.pow(10,9),
       text: 'Radio Frequency, or RF Spectrum (3 Hz to 300 GHz)'
   }, {
       lf: 1 * Math.pow(10,9),
       uf: 110 * Math.pow(10,9),
       text: 'Microwaves (1 to 110 GHz)'
   }, {
       lf: 300 * Math.pow(10,9),
       uf: 400 * Math.pow(10,12),
       text: 'Infrared radiation (300 GHz to 400 THz)'
   }, {
       lf: 405 * Math.pow(10,12),
       uf: 790 * Math.pow(10,12),
       text: 'Visible radiation (light)'
   }, {
       lf: 8 * Math.pow(10,14),
       uf: 3 * Math.pow(10,15),
       text: 'Ultraviolet light (10 to 380 nm)'
   }, {
       lf: 30 * Math.pow(10,15),
       uf: 60 * Math.pow(10,18),
       text: 'X-rays (30PHz-60EHz or 5pm-10 nm)'
   }, {
       lf: 60 * Math.pow(10,18),
       uf: Infinity,
       text: 'Gamma Rays (60 EHz to Infinity or 10 nm to 0 nm)'
   }
];