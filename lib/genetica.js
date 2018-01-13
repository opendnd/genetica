const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const defaults = require(path.join(libDir, 'defaults'));
const Saver = require(path.join(libDir, 'saver'));
const Roll = require('roll');
const uuidv1 = require('uuid/v1');
const roll = new Roll();

// this is the main class for generating genetics

class Genetica {

  // init
  constructor(opts = {}) {
    this.opts = opts;
  }

  // return defaults
  static getDefaults() {
    return defaults;
  }

  // load a file and return DNA
  static load(filepath) {
    return Saver.load(filepath);
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

    // check chromosomes
    Object.keys(opts).forEach((opt) => {
      if (opt.includes('chromosome-')) {
        if (!opts[opt].includes('=')) throw new Error('Malformatted chromosome input!');

        // get parts
        const parts = opts[opt].split('=');
        let partA = parts[0];
        let partB = parts[1];

        // get the template
        const template = defaults.DNA[opts.race];
        const c = opt.replace('chromosome-', '');

        // assign dice value unless it's the sex chromosome
        // otherwise set the x and y dice
        let dice;
        let diceValue;
        let Xdice;
        let XdiceValue;
        let Ydice;
        let YdiceValue;

        if (c !== 'sex') {
          dice = template.chromosomes[c];
          diceValue = parseInt(dice.replace('d', ''), 10);
        } else {
          Xdice = template.sex.x;
          XdiceValue = parseInt(Xdice.replace('d', ''), 10);
          Ydice = template.sex.y;
          YdiceValue = parseInt(Ydice.replace('d', ''), 10);
        }

        // check sex chromosomes
        if (opt === 'chromosome-sex') {
          if (opts.gender === 'female') {
            if (!partA.includes('X')) throw new Error(`Malformatted female sex chromosome input "${partA}"!`);
            if (!partB.includes('X')) throw new Error(`Malformatted female sex chromosome input "${partB}"!`);

            partA = parseInt(partA.replace('X', ''), 10);
            partB = parseInt(partB.replace('X', ''), 10);

            if (partA > XdiceValue) throw new Error(`Sex chromosome value "${partA}" higher than possible dice roll of "${XdiceValue}"!`);
            if (partB > XdiceValue) throw new Error(`Sex chromosome value "${partB}" higher than possible dice roll of "${XdiceValue}"!`);
          }
          if (opts.gender === 'male') {
            if (!partA.includes('X')) throw new Error(`Malformatted male sex chromosome input "${partA}"!`);
            if (!partB.includes('Y')) throw new Error(`Malformatted male sex chromosome input "${partB}"!`);

            partA = parseInt(partA.replace('X', ''), 10);
            partB = parseInt(partB.replace('Y', ''), 10);

            if (partA > XdiceValue) throw new Error(`Sex chromosome value "${partA}" higher than possible dice roll of "${XdiceValue}"!`);
            if (partB > YdiceValue) throw new Error(`Sex chromosome value "${partB}" higher than possible dice roll of "${YdiceValue}"!`);
          }
        } else {
          if (partA > diceValue) throw new Error(`Chromosome value "${partA}" higher than possible dice roll of "${diceValue}"!`);
          if (partB > diceValue) throw new Error(`Chromosome value "${partB}" higher than possible dice roll of "${diceValue}"!`);
        }
      }
    });

    this.opts = opts;
    return opts;
  }

  // reset opts
  resetOpts() {
    this.opts = {};
  }

  // map chromosomes to opts
  mapChromosomesToOpts(chromosomes = {}) {
    const { race } = this.opts;
    const template = defaults.DNA[race];
    const chromosomeOpts = {};

    Object.keys(chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];
      let chromosomeName = `chromosome-${c}`;
      if (dice === 'sex') chromosomeName = 'chromosome-sex';

      chromosomeOpts[chromosomeName] = chromosomes[c];
    });

    return chromosomeOpts;
  }

  // generate child chromosomes
  generateChildChromosomes(motherChromosomes = {}, fatherChromosomes = {}) {
    const { race, gender } = this.opts;
    const template = defaults.DNA[race];
    const chromosomes = Object.assign({}, template.chromosomes);

    // assign chromosome from the mother and the father
    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];

      // get mother chromosome parts
      const motherParts = motherChromosomes[c].split('=');
      const fatherParts = fatherChromosomes[c].split('=');

      // assign the X from the father and a random X from the mother
      if (dice === 'sex') {
        if (gender === 'female') {
          chromosomes[c] = `${motherParts.sample()}=${fatherParts[0]}`;
          return;
        }

        // always assign the way from the father
        chromosomes[c] = `${motherParts.sample()}=${fatherParts[1]}`;
        return;
      }

      // return the random chromosome parts
      chromosomes[c] = `${motherParts.sample()}=${fatherParts.sample()}`;
    });

    return chromosomes;
  }

  // generate parent chromosomes
  generateParentChromosomes(childChromosomes = {}) {
    const { race, gender } = this.opts;
    const template = defaults.DNA[race];
    const Xdice = template.sex.x;
    const Ydice = template.sex.y;
    const motherChromosomes = {};
    const fatherChromosomes = {};

    // generate the other half of chromosomes for the mother and father
    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];
      const parts = childChromosomes[c].split('=');
      const partA = parts[0];
      const partB = parts[1];
      let chromosomeName;

      // handle the sex chromosome differently
      if (dice === 'sex') {
        chromosomeName = 'chromosome-sex';

        if (gender === 'male') {
          const XRes = roll.roll(`1${Xdice}`).result;

          fatherChromosomes[chromosomeName] = `X${XRes}=${partB}`;

          // flip a coins on where to assign the chromosome
          if (roll.roll('1d2').result === 1) {
            motherChromosomes[chromosomeName] = `${partA}=X${XRes}`;
          } else {
            motherChromosomes[chromosomeName] = `X${XRes}=${partA}`;
          }
        } else if (gender === 'female') {
          const XRes = roll.roll(`1${Xdice}`).result;
          const YRes = roll.roll(`1${Ydice}`).result;

          // give one X to the father and the other to the mother
          let fatherX;
          let motherX;
          if (roll.roll('1d2').result === 1) {
            fatherX = partA;
            motherX = partB;
          } else {
            fatherX = partB;
            motherX = partA;
          }

          // set the father X
          fatherChromosomes[chromosomeName] = `${fatherX}=Y${YRes}`;

          // generate chromosomes as normal for the mother
          if (roll.roll('1d2').result === 1) {
            motherChromosomes[chromosomeName] = `X${XRes}=${motherX}`;
          } else {
            motherChromosomes[chromosomeName] = `${motherX}=X${XRes}`;
          }
        }
        return;
      }

      // regular chromosomes
      chromosomeName = `chromosome-${c}`;

      // get a regular roll for the father
      const fatherA = roll.roll(`1${dice}`).result;
      let fatherB;
      const motherA = roll.roll(`1${dice}`).result;
      let motherB;

      // give one to the father and one to the mother
      if (roll.roll('1d2').result === 1) {
        fatherB = partA;
        motherB = partB;
      } else {
        fatherB = partB;
        motherB = partA;
      }

      // generate chromosomes as normal for the father
      if (roll.roll('1d2').result === 1) {
        fatherChromosomes[chromosomeName] = `${fatherA}=${fatherB}`;
      } else {
        fatherChromosomes[chromosomeName] = `${fatherB}=${fatherA}`;
      }

      // generate chromosomes as normal for the mother
      if (roll.roll('1d2').result === 1) {
        motherChromosomes[chromosomeName] = `${motherA}=${motherB}`;
      } else {
        motherChromosomes[chromosomeName] = `${motherB}=${motherA}`;
      }
    });

    return {
      fatherChromosomes,
      motherChromosomes,
    };
  }

  // generate chromosomes
  generateChromosomes() {
    const { race, gender } = this.opts;
    const template = defaults.DNA[race];
    const Xdice = template.sex.x;
    const Ydice = template.sex.y;

    const chromosomes = Object.assign({}, template.chromosomes);

    // assign the roles to each chromosome
    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];

      // check passed opts for sex chromosome
      if (dice === 'sex') {
        if (this.opts['chromosome-sex']) {
          chromosomes[c] = this.opts['chromosome-sex'];
          return;
        }
      }

      // check for other passed chromosomes
      if (this.opts[`chromosome-${c}`]) {
        chromosomes[c] = this.opts[`chromosome-${c}`];
        return;
      }

      // do special roll for sex chromosomes
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

      // standard do here
      chromosomes[c] = roll.roll(`2${dice}`).rolled.join('=');
    });

    return chromosomes;
  }

  // generate traits from chromosomes
  generateTraits(chromosomes = {}) {
    const { race, gender } = this.opts;
    const template = defaults.DNA[race];
    const traits = {};

    // exit if the genes aren't defined yet
    if (template.genes === undefined) return traits;

    // 3=9
    // X1=Y3
    // iterate on the legends
    Object.keys(template.legend).forEach((legendName) => {
      const chromosome = template.legend[legendName];
      const rolls = chromosomes[chromosome];
      const parts = rolls.split('=');
      const partA = parts[0];
      const partB = parts[1];
      let a = parts[0];
      let b = parts[1];
      let dominant = partB;
      let commonGene = `${legendName}:C${chromosome}:`;
      let rareGene = `${legendName}:C${chromosome}:`;

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

  // generate a child
  generateChild(opts = {}, motherDNA = {}, fatherDNA = {}) {
    this.opts.race = motherDNA.race;
    this.validateOpts(Object.assign(this.opts, opts));
    const { race, gender } = this.opts;
    const chromosomes = this.mapChromosomesToOpts(this.generateChildChromosomes(motherDNA.chromosomes, fatherDNA.chromosomes));

    const childOpts = Object.assign({
      race,
      gender,
    }, chromosomes);

    return this.generate(childOpts);
  }

  // generate parents
  generateParents(DNA) {
    const { race, gender, chromosomes } = DNA;
    this.opts = {
      race,
      gender,
    };

    // generate mother and father chromosomes
    const { motherChromosomes, fatherChromosomes } = this.generateParentChromosomes(chromosomes);

    // generate mother
    const motherOpts = {
      gender: 'female',
      race,
    };
    this.resetOpts();
    const motherDNA = this.generate(Object.assign(motherOpts, motherChromosomes));

    // generate father
    const fatherOpts = {
      gender: 'male',
      race,
    };
    this.resetOpts();
    const fatherDNA = this.generate(Object.assign(fatherOpts, fatherChromosomes));

    return {
      motherDNA,
      fatherDNA,
    };
  }

  // generate a person
  generate(opts = {}) {
    this.validateOpts(Object.assign(this.opts, opts));
    const { race, gender } = this.opts;
    const chromosomes = this.generateChromosomes();
    const traits = this.generateTraits(chromosomes);
    const uuid = uuidv1();

    return {
      uuid,
      race,
      gender,
      chromosomes,
      traits,
    };
  }
}

module.exports = Genetica;
