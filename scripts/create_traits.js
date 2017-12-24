/* eslint-disable */

const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const scriptsDir = path.join(rootDir, 'scripts');
const defaults = require(path.join(libDir, 'defaults'));

const searchWorksheets = ['general', 'eye-color', 'hair-general', 'hair-color', 'skin-general', 'skin-color', 'eye-shape', 'face-shape', 'face-nose', 'hair-facial', 'face-mouth', 'eye-brows', 'skin-aging', 'sex'];

// Parse a file
const race = 'Dragonborn';
const worksheets = xlsx.parse(path.join(scriptsDir, `${race}.xlsx`));

// generate genes
let genes = {};

worksheets.forEach((ws) => {
  let legendName = ws.name;
  if ((legendName === 'sex-male') || (legendName === 'sex-female')) legendName = 'sex';

  if (searchWorksheets.includes(legendName)) {
    const data = ws.data.slice(5, ws.data.length);
    const dice = ws.data[1][1];

    const DNA = defaults.DNA[race];
    const chromosomeIndex = Object.values(DNA.legend).indexOf(legendName);
    const chromosome = Object.keys(DNA.legend)[chromosomeIndex];

    if (dice === undefined) throw new Error('Dice not defined!');

    let rolls = [];
    // generate all possible dice rolls
    let i = 1;
    while (i <= dice) {
      let j = 1;
      while (j <= dice) {
        rolls.push(`${i}=${j}`);
        j += 1;
      }
      i += 1;
    }

    // iterate on the data
    data.forEach((row) => {
      const trait = row[0];
      const dominance = row[1];
      const type = row[2];

      if (trait === undefined) return;
      if (dominance === undefined) return;
      if (type === undefined) return;

      let gene = `C${chromosome}:`;

      // prepend the sex
      if (ws.name === 'sex-female') gene += 'XX:';
      if (ws.name === 'sex-male') gene += 'Y:';

      // rare
      if (dominance < 1) {
        const randomRoll = rolls.sample(); // get a random roll
        gene += randomRoll;
        rolls.splice(rolls.indexOf(randomRoll), 1); // remove from rolls

      // common
      } else {
        gene += dominance;
      }

      // common
      genes[gene] = trait;
    });
  } else {
    throw new Error('Unknown worksheet found!');
  }
});

console.log(JSON.stringify(genes));