const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const defaults = require(path.join(libDir, 'defaults'));
const Roll = require('roll');
const roll = new Roll();

// this is the main class for generating genetics

class Genetica {

  // init
  constructor(opts = {}) {
    this.opts = opts;
  }

  // validate the options
  validateOpts(opts = {}) {
    const { races, genders } = defaults;

    // race
    if (opts.race === undefined) opts.race = races.sample();
    if (!races.includes(opts.race)) opts.race = races.sample();

    // gender
    if (opts.gender === undefined) opts.gender = genders.sample();
    if (!genders.includes(opts.gender)) opts.gender = genders.sample();

    return opts;
  }

  // generate chromosomes
  generateChromosomes(race = 'Dragonborn', gender = 'female') {
    const template = defaults.DNA[race];
    const Xdice = template.sex.x;
    const Ydice = template.sex.y;

    const chromosomes = Object.assign({}, template.chromosomes);

    // assign the roles to each chromosome
    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];

      if (dice === 'sex') {
        if (gender === 'female') {
          const res = roll.roll(`2${Xdice}`).rolled;

          chromosomes[c] = `X:${res[0]}=X:${res[1]}`;
          return;
        }

        const XRes = roll.roll(`1${Xdice}`).result;
        const YRes = roll.roll(`1${Ydice}`).result;

        chromosomes[c] = `X:${XRes}=Y:${YRes}`;
        return;
      }

      chromosomes[c] = roll.roll(`2${dice}`).rolled.join('=');
    });

    return chromosomes;
  }

  // generate a person
  generate(opts = {}) {
    const genOpts = this.validateOpts(Object.assign(this.opts, opts));
    const { race, gender } = genOpts;
    const chromosomes = this.generateChromosomes(race, gender);

    return {
      race,
      gender,
      chromosomes,
    };
  }
}

module.exports = Genetica;
