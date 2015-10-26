# Ghost-Faker

A simple script to set up a Ghost blog and stub out dummy data.

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

More options coming soon...
