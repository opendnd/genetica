declare global {
  // tslint:disable-next-line
  interface Array<T> {
    pushUnique(element: T): void;
    sample(): T;
  }
}

// only push unique elements
Array.prototype.pushUnique = function(element) {
  if (this.indexOf(element) === -1) { this.push(element); }
};

// grab a random element
Array.prototype.sample = function() {
  return this[Math.floor(Math.random() * this.length)];
};

export default {};
