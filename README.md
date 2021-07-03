# My Beautify README

This extension designed to beautify Javascript code according to my syntax rules.

## Features

- **Spaceify** - Creates equal space between multiple variables declaration and their value.
- **Order Imports** - Order import statements by length from the shortest one to the longest one.
- **Loneline** - Changes all control flows (arrow functions, if, else, for, etc...) that have only one line to one line with no curly brackets.
- **Vars Rename** - Replaces all variables declaration declared by 'var' to 'let' as ES6 standards.
- **Constify** - Replaces declaration of all variables that have a constant value to 'const' as ES6 standards.
- **Arrow Shot** - Replaces all functions that do not use 'this' with arrow functions as ES6 standards.

## Extension Settings

- `myBeautify.beautify`: Apply all the beautify fixes.
- `myBeautify.spaceify`: Create equal space between multiple variables declaration and their value.
- `myBeautify.loneline`: Change all control flows (arrow functions, if, else, for, etc...) that have only one line content, to one line with no curly brackets.
- `myBeautify.orderImports`: Order import statements by length.
- `myBeautify.varsRename`: Replace all variables declaration declared by 'var' to 'let' as ES6 standards.
- `myBeautify.constify`: Replace declaration of all variables that have a constant value to 'const' as ES6 standards.
- `myBeautify.arrowShot`: Replace all functions that do not use 'this' with arrow functions as ES6 standards.

## Note

- **_Order Imports_** _command applies only on one line imports and stops when there is a line brake._
- **_Constify command_** _applies only if the declaration is at the beginning of a line and the equal sign is in the same line of the declaration._
- **_Arrow Shot_** _command does not work if there are two or more function declarations in the same line._
- **_Loneline_** _command does not work if the length of the new line will be higher than 135._

- _All comands does not apply when it will cause an error._
  _For exsample if you call a function before initialize, arrow shot command will not replace that with arrow function._
  _So if some command does not work, make sure your code suitable to the changes you want_

---

_I tried my best to calculate all errors That might happen during the fixes above and prevent it, and I hope everything was taken into account, even so, there is no perfect code and if you find an error I would love to get feedback so I can try to fix it._

**Enjoy!**
