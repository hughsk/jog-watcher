var hb = require('handlebars'),
	fs = require('fs');

function ISODateString(d){
 function pad(n){return n<10 ? '0'+n : n}
 return d.getFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z'}

hb.registerHelper('isotime', function(time) {
	return ISODateString(new Date(time));
});

hb.registerHelper('html', function(text) {
	return new hb.SafeString(text);
});

module.exports = hb.compile(fs.readFileSync(__dirname + '/../template/index.html', 'utf8'));
module.exports['body-template'] = fs.readFileSync(__dirname + '/../template/body.html', 'utf8');

hb.registerPartial('body', module.exports['body-template']);