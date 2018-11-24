/* eslint-disable */
import * as fs from 'fs';
import * as path from 'path';

import { 
  SRD,
  ILinkRace,
  IRace,
  Genders,
} from 'opendnd-core';

export interface IGeneticaDefaults {
  races: {
    [uuid:string]: ILinkRace
  }

  raceOptions?: string[];

  racesDict: {
    [uuid:string]: IRace
  }

  genderOptions?: string[];
}

const {
  races,
  racesDict,
} = SRD;

const home = process.env.HOME || process.env.USERPROFILE;
const userPath = path.join(home, '.dnd', 'genetica', 'defaults.js');
let defaults:IGeneticaDefaults;

// get from the user path
if (fs.existsSync(userPath)) {
  defaults = require(userPath);
} else {
  defaults = {
    races,
    racesDict,
  };
}

defaults.raceOptions = Object.values(races).map((race) => {
  return race.name;
});

defaults.genderOptions = Object.keys(Genders);

export default defaults;
