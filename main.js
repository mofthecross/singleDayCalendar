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
