class Event {
  constructor(event, id, eventName, eventLocation) {
    this.id = id;
    this.start = event.start;
    this.end = event.end;
    this.collisions = null;
    this.coordinates = {
      x: null,
      y: null,
      width: null,
      height: null
    }
    this.eventName = eventName || 'Sample item';
    this.eventLocation = eventLocation || 'sample location';
    this.W = null;
  }
}

class Collisions {
  constructor() {
    this.storage = [];
    this.length = null;
    this.maxOverlap = null;
    this.longest = null;
  }

  addCollision(event) {
    this.storage.push(event);
    this.length += 1;
    if (this.longest !== null) {
      this.longest = this.longest.duration <= event.duration
        ? event
        : this.longest;
    } else {
      this.longest = event;
    }
  }
  // func determines the maximum number an event has collided with others
  // the max will be used to divide the width for all collided events;
  findMaxOverlap() {
    let times = [];

    for (let i = 0; i < this.storage.length; i++) {
      times.push({
        time: this.storage[i].start,
        inc: 1
      });
      times.push({
        time: this.storage[i].end,
        inc: -1
      });
    }

    times.sort(function(a, b) {
      return a.time - b.time || a.inc - b.inc;
    });

    let current = 0;
    let max = 0;
    for (let i = 0; i < times.length; i++) {
      current += times[i].inc;
      max = Math.max(max, current);
    }
    this.maxOverlap = max;
  }
  // resolve attempts to set the x coordinate of each collided event
  // as far to left as possible
  resolve() {
    let processed = [];
    let previousXcoordinate = 0;
    let place = 0;
    for (let i = 0; i < this.storage.length; i++) {

      for (let j = 0; j < processed.length; j++) {
        // checks current event with events that have been processed;
        // if current event does not collide with one of the proessed event,
        // set the current's x.coordinate === to that;
        if (this.checkCollision(processed[j], this.storage[i]) === false && j >= place) {
          this.storage[i].coordinates.x = processed[j].coordinates.x;
          place++;
          break;
        }
      }
      if (this.storage[i].coordinates.x === null) {
        this.storage[i].coordinates.x = previousXcoordinate;
      }
      previousXcoordinate = this.storage[i].coordinates.x + this.storage[i].coordinates.width;
      processed.push(this.storage[i]);
    }
  }

  checkCollision(event1, event2) {
    return !(event1.start < event2.start && event1.end <= event2.start);
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
    //transform and replace each event by instantiating Event class;
    for (let i = 0; i < arrayOfEvents.length; i++) {
      //track duration of each event to be used later to find collision in linear time;
      let lengthOfEvent = parseInt(arrayOfEvents[i].end) - parseInt(arrayOfEvents[i].start);
      arrayOfEvents[i] = new Event(arrayOfEvents[i], i);
      arrayOfEvents[i].duration = lengthOfEvent;
    }
    this.events = arrayOfEvents;
  }

  checkCollision(event1, event2) {
    return !(event1.start < event2.start && event1.end <= event2.start);
  }

  handleCollisions() {
    for (let current = 0; current < this.events.length; current++) {
      let next = current + 1;
      //compare two events (current & next) by passing it into checkCollision method;
      if (next < this.events.length && this.checkCollision(this.events[current], this.events[next])) {
        let conflicts = this.events[current].collisions;

        // if current event has already collided with a previous events
        // and next collides with current, add next event to all collisions,
        // so that each event that belongs to the one collision group
        // has a pointer to the same collision datastructure;
        if (this.events[current].collisions !== null && this.events[next].collisions === null) {
          conflicts.addCollision(this.events[next]);
        } else {
          //instantiate a new collision datastructure;
          conflicts = new Collisions();
          conflicts.addCollision(this.events[current]);
          conflicts.addCollision(this.events[next]);
          this.events[current].collisions = conflicts;
        }
        // assign collision data structure to the next event;
        this.events[next].collisions = conflicts;
      } else {
        if (this.events[current].collisions !== null) {
          // if the next event doesn't collide with current, check the longest event (in terms
          // of duration) that is currently in the collision group where current event belongs;
          // if there's a collision, add next event;
          if (next < this.events.length &&
            this.checkCollision(this.events[current].collisions.longest, this.events[next])) {
              this.events[current].collisions.addCollision(this.events[next]);
              this.events[next].collisions = this.events[current].collisions;
          }
        }
      }
    }
  }

  setEventWidth(max) {
    let maximumWidth = max;
    this.events.forEach( event => {
      if (event.collisions === null) {
        event.coordinates.width = maximumWidth;
      } else {
        if (event.collisions.maxOverlap === null) {
          event.collisions.findMaxOverlap();
        }
        event.coordinates.width = maximumWidth / event.collisions.maxOverlap;
      }
      event.W = event.coordinates.width;
    });
  }

  setEventCoordinates() {
    this.events.forEach(event => {
      if (event.collisions === null) {
        event.coordinates.x = 0;
      }
      // if event has unresolved collision with other events;
      if (event.collisions !== null && event.coordinates.x === null) {
        event.collisions.resolve();
      }
      event.coordinates.y = event.start;
      event.coordinates.height = event.end - event.start;
    });
  }

  renderEvents(containerID) {
    this.removeEvents(containerID);
    let container = document.getElementById(containerID);

    this.events.forEach(event => {
      let div = document.createElement('div');
      div.style.left = event.coordinates.x + 10 + 'px';
      div.style.top = event.coordinates.y + 'px';
      div.style.width = (event.coordinates.width - 5) + 'px';
      div.style.height = event.coordinates.height+ 'px';
      div.className = 'events';

      let eventName = document.createElement('p');
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
      parent.removeChild(parent.lastChild);
    }
  }
}

function layOutDay(events){
  let layOut = new SingleDayView();
  layOut.process(events);
  layOut.renderEvents('events');
}

// const testcase = [{start: 30, end: 150},  {start: 540, end: 600}, {start: 560, end: 620},
//                     {start:610, end: 670}]
// const testcase1 = [{start: 0,  end: 60},{start: 30, end: 150},  {start: 540, end: 600}, {start: 560, end: 620},
//                     {start:610, end: 670}, {start: 30, end: 150},  {start: 540, end: 600},
//                     {start: 560, end: 620}, {start:610, end: 670}];
// const testcase2 = [{start: 0, end: 150}, {start: 50, end: 90}, {start: 50, end: 90},
//                     {start: 540, end: 600}, {start: 560, end: 620} ,{start:610, end: 670},
//                     {start: 540, end: 600}, {start: 560, end: 620} ,{start:610, end: 670},
//                     {start: 0, end: 150},  {start: 540, end: 600}, {start: 560, end: 620},
//                     {start:610, end: 670}]
//
// const testcase3 =  [ {start: 550, end: 600}, {start: 600, end: 710},  {start: 600, end: 710},
//                     {start: 0, end: 500 }, {start: 80, end: 250}, {start: 50, end: 100},
//                     {start: 50, end: 100},  {start: 540, end: 600}, {start: 560, end: 620},
//                     {start: 50, end: 100},{start: 90, end: 160}, {start:200 ,end: 250},
//                     {start:190,end: 250}, {start:160,end: 250}];
// layOutDay(testcase0);
