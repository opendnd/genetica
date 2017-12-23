const fs = require('fs');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const dataDir = path.join(libDir, 'data');
const defaults = require(path.join(libDir, 'defaults'));

// generate all possible rules for a dice
const generateRules = (dice, doNsqd = true, prepend = '') => {
  const n = parseInt(dice.replace('d', ''), 10);
  const rules = [];

  // iterate on all numbers
  let i = 1;
  while (i <= n) {
    // do n^2 rules
    if (doNsqd) {
      let j = 1;
      while (j <= n) {
        // 1=3
        // 3=3
        rules.push({
          type: 'very rare',
          rule: `${prepend + i}=${prepend + j}`,
        });

        j += 1;
      }
    }

    // >=3
    rules.push({
      type: 'rare',
      rule: `>=${prepend + i}`,
    });

    // <=3
    rules.push({
      type: 'rare',
      rule: `<=${prepend + i}`,
    });

    // ==3
    rules.push({
      type: 'common',
      rule: `==${prepend + i}`,
    });

    // !=3
    rules.push({
      type: 'very common',
      rule: `!=${prepend + i}`,
    });

    i += 1;
  }

  return rules;
};

// generate all rules for all chromosomes
const generateAllRules = (race = 'Dragonborn') => {
  const template = defaults.DNA[race];
  const Xdice = template.sex.x;
  const Ydice = template.sex.y;

  const chromosomes = Object.assign({}, template.chromosomes);

  // create a list of all possible rules for each chromosome
  Object.keys(template.chromosomes).forEach((c) => {
    const dice = template.chromosomes[c];

    chromosomes[c] = generateRules(dice);

    if (dice === 'sex') {
      chromosomes[c] = {
        x: generateRules(Xdice, true, 'X'),
        y: generateRules(Ydice, false, 'Y'), // there can't be a pair of two y's so don't do squared rules
      };
    }
  });

  return chromosomes;
};

// generate rules for all races
defaults.races.forEach((race) => {
  const raceName = race.toLowerCase().replace(' ', '-');
  process.stdout.write(`Saving ${race} rules...\n`);
  fs.writeFileSync(path.join(dataDir, `rules-${raceName}.json`), JSON.stringify(generateAllRules(race)));
});
