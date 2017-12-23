# genetica
This is a tool for using a simplified genetics system to generate inheritable traits for DnD characters.

## DNA

Each generated character has a set of DNA with chromosomes. These chromosomes go to applying traits.

Inspiration: http://www.chromosomewalk.ch/en/list-of-chromosomes/

* `3=3` Means a roll of 3 is needed from both pairs for the trait to apply
* `3=4` Means that exactly a roll of 3 and a 4 are needed for the trait to apply
* `>=3` Means that if both pairs are greater than or equal to 3 then the trait is applied
* `<=3` Means that if both pairs are less than or equal to 3 then the trait is applied
* `==3` Means that if a 3 is present at all then the trait will apply
* `!=3` Means that anything except for any roll of 3 will apply the trait

The rules are applied from first to last from the above list, whichever qualifies first is the trait that will apply.