// one helper so I can use this in my templates using h.moment.
exports.moment = require('moment');

// console logging from template
exports.dump = (obj) => JSON.stringify(obj, null, 2);