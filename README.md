# genetica
This is a tool for using a simplified genetics system to generate inheritable traits for DnD characters.

## DNA

Each generated character has a set of DNA with chromosomes. These chromosomes go to applying traits.

Inspiration: http://www.chromosomewalk.ch/en/list-of-chromosomes/

* `3=3` Means a roll of 3 is needed from both pairs for the trait to apply.
* `3=4` Means that exactly a roll of 3 and a 4 are needed for the trait to apply.
* `>=3` Means that if both pairs are greater than or equal to 3 then the trait is applied.
* `<=3` Means that if both pairs are less than or equal to 3 then the trait is applied.
* `==3` Means that if a 3 is present at all then the trait will apply.
* `!=3` Means that anything except for any roll of 3 will apply the trait.

Sex chromosome rules are generated slightly differently, all the same previous rules still exist except include the X or Y letter before it.

For example:

* `3=3` becomes `X3=X3`
* `>=3` becomes `>=X3`
* etc.

There is also a way to denote that this rule only applies for double X chromosomes (to help with common female only traits):

* `==3` becomes `==XX3` which means a 3 is present in either of the X chromosomes.

The same works for XY pairs as well:

* `!=3` becomes `!=XY3` which means anything except for a 3 being present in the X or the Y.
* `3=3` becomes `X3=Y1`