class Event {
  constructor(event, id, eventName, eventLocation) {
    this.id = id;
    this.start = event.start;
    this.end = event.end;
    this.collisions = null;
    this.coordinates = { width: null, x: null, y: null }
    this.eventName = eventName || 'Sample item';
    this.eventLocation = eventLocation || 'sample location';
  }
}

class SingleDayView {
  constructor(containerID) {
    this.containerID = containerID;
    this.events = null;
  }
  addEvents(arrayOfEvents){
    //reassign and sort events in chronological order;
    arrayOfEvents = arrayOfEvents.sort(function(a, b) {
      return a.start - b.start;
    });

    //replace each event with a reformatted version via Event class instantiation;
    for (let i = 0; i < arrayOfEvents.length; i++) {
      arrayOfEvents[i] = new Event(arrayOfEvents[i], i);
    }
    this.events = arrayOfEvents;
  }

  checkCollision(event1, event2) {
    if (event1.start < event2.start && event1.end <= event2.start) {
      return false;
    } else {
      return true;
    }
  }

}

const testcase = [{start: 100, end: 72},  {start: 0, end: 30}, {start: 0, end: 60}, {start:30, end: 90}, {start: 360, end: 700}, {start: 360, end: 700}]//, {start: 30, end: 150}, {start: 540, end: 600}, {start: 610, end: 670} ]
let singleDayViewTest = new SingleDayView('events');
singleDayViewTest.addEvents(testcase);
console.log(singleDayViewTest.checkCollision( {start: 0, end: 30}, {start:60, end: 90}))

//console.log(singleDayViewTest);
