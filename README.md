# Ghost-Faker

A simple script to set up a [Ghost](https://ghost.org/) blog and enter fake data (posts, users, etc.).

---

## Usage:

#### As a CLI:

```bash
npm install -g ghost-faker

ghostfaker http://localhost:2368/ # The url of your Ghost instance
```

#### As an NPM module:

```bash
npm install --save-dev ghost-faker
```

```javascript
var ghostFaker = require('ghost-faker');

ghostFaker(options);
```

---

## Options

Ghost-faker can use an options hash, either passed in via command line args or as the only argument to the ghostFaker function.

Allowed options are:

- url (or 'u for short') - This is the URL of your ghost instance.

*Note: when using ghost-faker through the command line, the url can also be passed as the second argument after 'ghost-faker', e.g.* `ghostfaker <url>`

- email - This is the email that the blog owner account will be setup with (default is a randomly generated email)

- password - The password of the main owner account (default is a randomly generated password)

- userName - The full name of the owner user (default is a randomly generated name)

- blogTitle - The title of the blog (default is a randomly generated word sequence)

- posts - If you wish to generate posts, specify the number of posts here (default number if --posts argument is supplied is 5)

- image - If you don't want images to be added to posts, either set this to false or supply `--no-image`

More options coming soon...
