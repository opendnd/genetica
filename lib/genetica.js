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

          chromosomes[c] = `X${res[0]}=X${res[1]}`;
          return;
        }

        const XRes = roll.roll(`1${Xdice}`).result;
        const YRes = roll.roll(`1${Ydice}`).result;

        chromosomes[c] = `X${XRes}=Y${YRes}`;
        return;
      }

      chromosomes[c] = roll.roll(`2${dice}`).rolled.join('=');
    });

    return chromosomes;
  }

  // generate traits from chromosomes
  generateTraits(race = 'Dragonborn', gender = 'female', chromosomes = {}) {
    const template = defaults.DNA[race];
    const traits = {};

    // exit if the genes aren't defined yet
    if (template.genes === undefined) return traits;

    // 3=9
    // X1=Y3
    Object.values(chromosomes).forEach((rolls, index) => {
      const chromosome = Object.keys(chromosomes)[index];
      const legendName = template.legend[chromosome];
      const parts = rolls.split('=');
      const partA = parts[0];
      const partB = parts[1];
      let a = parts[0];
      let b = parts[1];
      let dominant = partB;
      let commonGene = `C${chromosome}:`;
      let rareGene = `C${chromosome}:`;

      // don't give facial hair to females
      if ((gender === 'female') && (legendName === 'hair-facial')) return;

      // female
      if (gender === 'female') {
        a = a.replace('X', '');
        b = b.replace('X', '');
      // male
      } else if (gender === 'male') {
        a = a.replace('X', '');
        b = b.replace('Y', '');
      }

      // convert to int
      a = parseInt(a, 10);
      b = parseInt(b, 10);

      // set a to dominant if it's higher
      if (a > b) dominant = partA;

      // add an extra X for female dominant genes
      if ((gender === 'female') && (legendName === 'sex')) commonGene += 'X';
      commonGene += dominant;
      rareGene += rolls;

      // look for a rare trait
      if (Object.keys(template.genes).indexOf(rareGene) >= 0) {
        traits[legendName] = {
          gene: rareGene,
          trait: template.genes[rareGene],
        };
        return;
      }

      // look for a common trait
      if (Object.keys(template.genes).indexOf(commonGene) >= 0) {
        traits[legendName] = {
          gene: commonGene,
          trait: template.genes[commonGene],
        };
      }
    });

    return traits;
  }

  // generate a person
  generate(opts = {}) {
    const genOpts = this.validateOpts(Object.assign(this.opts, opts));
    const { race, gender } = genOpts;
    const chromosomes = this.generateChromosomes(race, gender);
    const traits = this.generateTraits(race, gender, chromosomes);

    return {
      race,
      gender,
      chromosomes,
      traits,
    };
  }
}

module.exports = Genetica;
