const timeFormat = [
                  { '0': { time: [ '9:00', 'AM']}},
                  { '30': { time: [ '9:30', 'AM']}},
                  { '60': { time: [ '10:00', 'AM']}},
                  { '90': { time: [ '10:30', 'AM']}},
                  { '120': { time: [ '11:00', 'AM']}},
                  { '150': { time: [ '11:30', 'AM']}},
                  { '180': { time: [ '12:00', 'PM']}},
                  { '210': { time: [ '12:30', 'PM']}},
                  { '240': { time: [ '1:00', 'PM']}},
                  { '270': { time: [ '1:30', 'PM']}},
                  { '300': { time: [ '2:00', 'PM']}},
                  { '330': { time: [ '2:30', 'PM']}},
                  { '360': { time: [ '3:00', 'PM']}},
                  { '390': { time: [ '3:30', 'PM']}},
                  { '420': { time: [ '4:00', 'PM']}},
                  { '450': { time: [ '4:30', 'PM']}},
                  { '480': { time: [ '5:00', 'PM']}},
                  { '510': { time: [ '5:30', 'PM']}},
                  { '540': { time: [ '6:00', 'PM']}},
                  { '570': { time: [ '6:30', 'PM']}},
                  { '600': { time: [ '7:00', 'PM']}},
                  { '630': { time: [ '7:30', 'PM']}},
                  { '660': { time: [ '8:00', 'PM']}},
                  { '690': { time: [ '8:30', 'PM']}},
                  { '720': { time: [ '9:00', 'PM']}}
              ];

function renderTime(timeArray) {
  const timeContainer = document.getElementById('time');

  timeArray.forEach( (timeObject, index) => {
    for (let key in timeObject) {

      let div = document.createElement('div');
      div.className = 'timeLabel';
      div.style.top = key + 'px';

      let p = document.createElement('p');
      //hour intervval
      if (index % 2 === 0) {
        p.innerText = document.createTextNode(timeObject[key].time[0]).textContent;
        p.className = 'hour';

        let span = document.createElement('span');
        span.innerText = document.createTextNode(timeObject[key].time[1]).textContent;
        span.className = 'ampm'

        p.appendChild(span);
      //half-hour interval
      } else {
        p.innerText = document.createTextNode(timeObject[key].time[0]).textContent;
        p.className = 'half-hour';
      }
      div.appendChild(p);
      timeContainer.appendChild(div);
    }
  });
}
renderTime(timeFormat);
