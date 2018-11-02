/* eslint-disable */
import * as fs from 'fs';
import * as path from 'path';

import defaultsDefault from './defaults-default';
import { Genders } from 'opendnd-core';

const home = process.env.HOME || process.env.USERPROFILE;
const userPath = path.join(home, '.dnd', 'genetica', 'defaults.js');
let defaults;

// get from the user path
if (fs.existsSync(userPath)) {
  defaults = require(userPath);
} else {
  defaults = defaultsDefault;
}

declare global {
  interface Array<T> {
    pushUnique(element: T): void;
    sample(): T;
  }
}

// only push unique elements
Array.prototype.pushUnique = function(element) { 
  if (this.indexOf(element) === -1) {
    this.push(element);
  }
};

// grab a random element
Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)]
}

defaults.races = Object.keys(defaults.DNA);

// TODO: update this codebase to use the genders types instead of this mapping
defaults.genderMapping = {
  'male': Genders.Male,
  'female': Genders.Female,
}

export default defaults;
