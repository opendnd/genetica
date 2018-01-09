/* eslint-disable */
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const dataDir = path.join(libDir, 'data');

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
  races: ['Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Halfling', 'Half-Orc', 'Human', 'Tiefling'],
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

module.exports = defaults;
