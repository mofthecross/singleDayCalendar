class Event {
  constructor(event, id, eventName, eventLocation) {
    this.id = id;
    this.start = event.start;
    this.end = event.end;
    this.collisions = null;
    this.coordinates = { x: null, y: null, width: null, height: null }
    this.eventName = eventName || 'Sample item';
    this.eventLocation = eventLocation || 'sample location';
  }
}

class Collisions {
  constructor(){
    this.storage = {};
    this.length = 0;
    this.resolved = false;
  }
  addCollision(event) {
    this.storage[event.id] = event;
    this.length++;
  }
  resolve(padding) {
    //resove x coordinates of each collided events in relation to each other;
    let previous = null;

    for (let eventID in this.storage) {
      let event = this.storage[eventID];

      if (previous === null) {
        event.coordinates.x = padding; //first one;
      } else {
        event.coordinates.x = previous + padding;
      }
      previous += event.coordinates.width;
    }
    //set resolved to true;
    this.resolved = true;
  }
}

class SingleDayView {
  constructor(containerID) {
    this.containerID = containerID;
    this.events = null;
  }

  process(arrayOfEvents) {
    this.addEvents(arrayOfEvents)
    this.handleCollisions();
    this.setEventWidth(600);
    this.setEventCoordinates();
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

  handleCollisions() {
    for (let current = 0; current < this.events.length; current++) {
      let next = current + 1;

      //compare two events (current & next) by passing it into checkCollision method;
      if (next < this.events.length && this.checkCollision(this.events[current], this.events[next])) {
        let conflicts = this.events[current].collisions;

        //if current event has already collided with a previous event add next event to all collisions;
        //so that each event that belongs to the one collision group has a pointer to the same Collision datastructure;
        if (this.events[current].collisions !== null && this.events[next].collisions === null) {
          conflicts.addCollision(this.events[next]);
        } else {
          //instantiate a new collision datastructure;
          conflicts = new Collisions();
          conflicts.addCollision(this.events[current]);
          conflicts.addCollision(this.events[next]);
          this.events[current].collisions = conflicts;
        }
        //assign collision data structure to the next event;
        this.events[next].collisions = conflicts;
      }
    }
    return this.events;
  }

  setEventWidth(max) {
    let maximumWidth = max;

    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].collisions !== null) {
        this.events[i].coordinates.width = maximumWidth / this.events[i].collisions.length;
      } else {
        this.events[i].coordinates.width = maximumWidth;
      }
    }
    return this.events;
  }

  setEventCoordinates() {
    let padding = 10; // padding for the green 
    this.events.forEach(event => {
      // no collision;
      if (event.collisions === null) {
        event.coordinates.x = padding;
      }
      // if event has unresolved collision with other events;
      if (event.collisions !== null && event.collisions.resolved === false) {
        event.collisions.resolve(padding);
      }
      event.coordinates.y = event.start;
      event.coordinates.height = event.end - event.start;
    });
  }

}

const testcase = [{start: 100, end: 72},  {start: 0, end: 30}, {start: 0, end: 60}, {start:30, end: 90}, {start: 360, end: 700}, {start: 360, end: 700}]//, {start: 30, end: 150}, {start: 540, end: 600}, {start: 610, end: 670} ]
let singleDayViewTest = new SingleDayView('events');
singleDayViewTest.process(testcase)

console.log(singleDayViewTest);
