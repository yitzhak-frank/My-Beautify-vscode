# My Beautify README

This extension designed to beautify Javascript code according to my syntax rules.

## Features

- **Spaceify** - Creates equal space between multiple variables declaration and their value.
- **Order Imports** - Order import statements by length from the shortest one to the longest one.
- **Vars Rename** - Replaces all variables declaration declared by 'var' to 'let' as ES6 standards.
- **Constify** - Replaces declaration of all variables that have a constant value to 'const' as ES6 standards.
- **Arrow Shot** - Replaces all functions that do not use 'this' with arrow functions as ES6 standards.

## Extension Settings

- `myBeautify.beautify`: Apply all the beautify fixes.
- `myBeautify.spaceify`: Create equal space between multiple variables declaration and their value.
- `myBeautify.orderImports`: Order import statements by length.
- `myBeautify.varsRename`: Replace all variables declaration declared by 'var' to 'let' as ES6 standards.
- `myBeautify.constify`: Replace declaration of all variables that have a constant value to 'const' as ES6 standards.
- `myBeautify.arrowShot`: Replace all functions that do not use 'this' with arrow functions as ES6 standards.

## Note

- _Order Imports command applies only on one line imports and stops when there is a line brake._
- _Constify command applies only if the declaration is at the beginning of a line and the equal sign is in the same line of the declaration._
- _Arrow Shot command does not work if there are two or more function declarations in the same line._

**Enjoy!**
