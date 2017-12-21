/* eslint-disable */

const expect = require('chai').expect;
const path = require('path');
const rootDir = path.join(__dirname, '..', '..');
const libDir = path.join(rootDir, 'lib');
const Genetica = require(path.join(libDir, 'genetica'));
let genetica, genes;

describe('Genetica', () => {
  before(() => {
    genetica = new Genetica();
  });

  it('can generate', () => {
    genes = genetica.generate();

    expect(genes).to.be.an('object');
  });
});
