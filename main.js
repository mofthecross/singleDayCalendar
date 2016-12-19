class Event {
  constructor(event, id, eventName, eventLocation) {
    this.id = id;
    this.start = event.start;
    this.end = event.end;
    this.collisions = null;
    this.coordinates = { x: null, y: null, width: null, height: null }
    this.eventName = eventName || 'Sample item';
    this.eventLocation = eventLocation || 'sample location';
    this.W = null;
  }
}

class Collisions {
  constructor(){
    this.storage = {};
    this.length = 0;
    this.offset = null;
    this.resolved = { width: false, 'xCoord': false }
  }

  addCollision(event) {
    this.storage[event.id] = event;
    this.length++;
  }

  resolveWidth(maxwidth) {
    let conflict = this.length;
    let earliestEndtime = null;
    //doing another scan on each collision to see if we can fit
    //other events to the left;
    for (let event in this.storage) {
      if (earliestEndtime === null)  {
        earliestEndtime = this.storage[event].end;
      } else {
        if (this.storage[event].start >= earliestEndtime) {
          conflict -= 1;
        }
        earliestEndtime = Math.min(earliestEndtime, this.storage[event].end);
      }
    }
    this.offset = conflict;
    this.resolved.width = true;
  }

  resolveXcoord(padding) {
    //resove x coordinates of each collided events in relation to each other;
    let previousXcoordinate = null;
    let previousEndTime;

    for (let eventID in this.storage) {
      let event = this.storage[eventID];

      if (previousXcoordinate === null) {
        event.coordinates.x = padding; //first one;
        previousEndTime = event.end;
      } else {
        if (event.start >= previousEndTime) {
          event.coordinates.x = padding;
        } else {
          event.coordinates.x = previousXcoordinate + padding;
        }
        previousEndTime = event.start;
      }
      previousXcoordinate += event.coordinates.width;
    }
    //set resolved to true;
    this.resolved.xCoord = true;
  }
}

class SingleDayView {
  constructor() {
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
      let current = this.events[i];
      if (current.collisions !== null) {
        if (current.collisions.resolved.width === false) {
          current.collisions.resolveWidth()
        }
        current.coordinates.width = maximumWidth / current.collisions.offset;
      } else {
        current.coordinates.width = maximumWidth;
      }
      current.W = current.coordinates.width;
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
      if (event.collisions !== null && event.collisions.resolved.xCoord === false) {
        event.collisions.resolveXcoord(padding);
      }
      event.coordinates.y = event.start;
      event.coordinates.height = event.end - event.start;
    });
  }

  renderEvents(containerID) {
    let container = document.getElementById(containerID);
    this.events.forEach(event => {
      let div = document.createElement('div');
      div.style.left = event.coordinates.x + 'px';
      div.style.top = event.coordinates.y + 'px';
      div.style.width = (event.coordinates.width - 5) + 'px';
      div.style.height = (event.coordinates.height -2)+ 'px';
      div.className = 'events';

      let eventName = document.createElement('p')
      eventName.className = 'eventName';
      eventName.innerText = document.createTextNode(event.eventName).textContent;

      let eventLocation = document.createElement('p');
      eventLocation.className ='eventLocation';
      eventLocation.innerText = document.createTextNode(event.eventLocation).textContent;

      div.appendChild(eventName);
      div.appendChild(eventLocation);

      container.appendChild(div);
    });
  }
  removeEvents(containerID) {
    let parent = document.getElementById(containerID);
    while (parent.hasChildNodes()) {
      parent.removeChild(parent.lastChild)
    }
  }
}

function layOutDay(events){
  let layOut = new SingleDayView();
  layOut.removeEvents('events');
  layOut.process(events);
  layOut.renderEvents('events');
}

// const testcase = [{start: 30, end: 150},  {start: 540, end: 600}, {start: 560, end: 620}, {start:610, end: 670}];
// let singleDayViewTest = new SingleDayView('events');
// singleDayViewTest.process(testcase)
// singleDayViewTest.renderEvents('events');
