/* eslint-disable */

const expect = require('chai').expect;
const path = require('path');
const rootDir = path.join(__dirname, '..', '..');
const libDir = path.join(rootDir, 'lib');
const defaults = require(path.join(libDir, 'defaults'));

describe('defaults', () => {
  it('loads from default', () => {
    expect(defaults).to.be.an('object');
  });

  it('has races', () => {
    expect(defaults.races).to.be.an('array');
  });

  it('has genders', () => {
    expect(defaults.genders).to.be.an('array');
  });
});
