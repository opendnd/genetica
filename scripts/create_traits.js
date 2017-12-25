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
const race = process.argv[2] || 'Dragonborn';
const template = defaults.DNA[race];
const Xdice = template.sex.x.replace('d', '');
const Ydice = template.sex.y.replace('d', '');
const worksheets = xlsx.parse(path.join(scriptsDir, `${race}.xlsx`));

// generate genes
let genes = {};

// generate all possible rolls for some dice
const generatePossibleRolls = (diceA, diceB, gender) => {
  diceA = parseInt(diceA, 10);
  diceB = parseInt(diceB, 10);
  let rolls = [];

  // do dice A
  let a = 1;
  while (a <= diceA) {

    // do dice B
    let b = 1;
    while (b <= diceB) {
      if (gender === 'female') {
        rolls.push(`X${a}=X${b}`);
      } else if (gender === 'male') {
        rolls.push(`X${a}=Y${b}`);
      } else {
        rolls.push(`${a}=${b}`);
      }

      b += 1;
    }

    a += 1;
  }

  return rolls;
}

// go through each worksheet
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

    // check dice
    if (legendName !== 'sex') {
      if (parseInt(dice, 10) !== parseInt(DNA.chromosomes[chromosome].replace('d', ''), 10)) throw new Error(`Dice is not defined to the correct amount for ${ws.name}!`);
    }
    if (ws.name === 'sex-male') {
      if (parseInt(dice, 10) !== parseInt(Ydice)) throw new Error('Dice is not defined properly for sex-male!');
    }
    if (ws.name === 'sex-female') {
      if (parseInt(dice, 10) !== parseInt(Xdice)) throw new Error('Dice is not defined properly for sex-female!');
    }

    // generate rolls
    let femaleRolls = generatePossibleRolls(Xdice, Xdice, 'female');
    let maleRolls = generatePossibleRolls(Xdice, Ydice, 'male');
    let rolls = generatePossibleRolls(dice, dice);

    // iterate on the data
    data.forEach((row) => {
      const trait = row[0];
      const dominance = row[1];
      const type = row[2];

      if (trait === undefined) return;
      if (dominance === undefined) return;
      if (type === undefined) return;

      let gene = `C${chromosome}:`;

      // rare
      if (dominance < 1) {
        // handle rare differently for female, male and standard
        if (ws.name === 'sex-female') {
          const randomRoll = femaleRolls.sample();
          gene += randomRoll;
          femaleRolls.splice(rolls.indexOf(randomRoll), 1); // remove from rolls
        } else if (ws.name === 'sex-male') {
          const randomRoll = maleRolls.sample();
          gene += randomRoll;
          maleRolls.splice(rolls.indexOf(randomRoll), 1); // remove from rolls
        } else {
          const randomRoll = rolls.sample();
          gene += randomRoll;
          rolls.splice(rolls.indexOf(randomRoll), 1); // remove from rolls
        }
      // common
      } else {
        // prepend the sex
        if (ws.name === 'sex-female') gene += 'XX';
        if (ws.name === 'sex-male') gene += 'Y';

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