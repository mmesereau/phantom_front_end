'use strict';
var output = [];
for (var i = 0; i < 1440; i++) {
  if (i % 28 === 0 || i % 28 === 27) {
    output.push(6);
  }
  else {
    output.push(1);
  }
  console.log(output[i]);
}
