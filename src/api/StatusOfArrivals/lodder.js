import API_KEY from 'dotenv';
API_KEY.config();

var xhr = new XMLHttpRequest();
var url = 'http://apis.data.go.kr/B551177/StatusOfArrivals/getArrivalsCongestion'; /*URL*/
var queryParams = '?' + encodeURIComponent('serviceKey') + '='+ {API_KEY}; /*Service Key*/
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /**/
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
queryParams += '&' + encodeURIComponent('terno') + '=' + encodeURIComponent('T1'); /**/
queryParams += '&' + encodeURIComponent('airport') + '=' + encodeURIComponent('HAN'); /**/
queryParams += '&' + encodeURIComponent('type') + '=' + encodeURIComponent('xml'); /**/
xhr.open('GET', url + queryParams);
xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
        alert('Status: '+this.status+'nHeaders: '+JSON.stringify(this.getAllResponseHeaders())+'nBody: '+this.responseText);
    }
};

xhr.send('');
