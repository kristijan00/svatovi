var typeNumber = 30;
var errorCorrectionLevel = 'Q';
var qr = qrcode(typeNumber, errorCorrectionLevel);
qr.addData('https://www.dropbox.com/request/oIawNDy9GLkXIrU4dJtP');
qr.make();
document.getElementById('placeHolder').innerHTML = qr.createImgTag();