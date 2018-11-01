/* eslint-disable */
import * as path from 'path';

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const dataDir = path.join(srcDir, 'data');

// load DNA data
const Dragonborn = require(path.join(dataDir, 'dna-dragonborn.json'));
const Dwarf = require(path.join(dataDir, 'dna-dwarf.json'));
const Elf = require(path.join(dataDir, 'dna-elf.json'));
const Gnome = require(path.join(dataDir, 'dna-gnome.json'));
const HalfElf = require(path.join(dataDir, 'dna-half-elf.json'));
const HalfOrc = require(path.join(dataDir, 'dna-half-orc.json'));
const Halfling = require(path.join(dataDir, 'dna-halfling.json'));
const Human = require(path.join(dataDir, 'dna-human.json'));
const Tiefling = require(path.join(dataDir, 'dna-tiefling.json'));

// default values
const defaults = {
  genders: ['male', 'female'],

  // DNA
  DNA: {
    Dragonborn,
    Dwarf,
    Elf,
    Gnome,
    'Half-Elf': HalfElf,
    Halfling,
    'Half-Orc': HalfOrc,
    Human,
    Tiefling,
  },
};

export default defaults;
