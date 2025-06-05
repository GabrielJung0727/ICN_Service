import API_KEY from 'dotenv';
API_KEY.config();

var xhr = new XMLHttpRequest();
var url = 'http://apis.data.go.kr/B551177/PassengerNoticeKR/getfPassengerNoticeIKR'; /*URL*/
var queryParams = '?' + encodeURIComponent('serviceKey') + '='+{API_KEY}; /*Service Key*/
queryParams += '&' + encodeURIComponent('selectdate') + '=' + encodeURIComponent('0'); /**/
queryParams += '&' + encodeURIComponent('type') + '=' + encodeURIComponent('xml'); /**/
xhr.open('GET', url + queryParams);
xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
        alert('Status: '+this.status+'nHeaders: '+JSON.stringify(this.getAllResponseHeaders())+'nBody: '+this.responseText);
    }
};

xhr.send('');