const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const defaults = require(path.join(libDir, 'defaults'));

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

  // generate a person
  generate(opts = {}) {
    const genOpts = this.validateOpts(Object.assign(this.opts, opts));

    return {
      genOpts,
    };
  }
}

module.exports = Genetica;
