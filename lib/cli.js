var _ = require('lodash'),
    minimist = require('minimist'),
    request = require('request'),
    Promise = require('bluebird'),
    cheerio = require('cheerio'),
    faker = require('faker'),
    get = Promise.promisify(request.get),
    post = Promise.promisify(request.post),
    put = Promise.promisify(request.put),
    blogDetails = {},
    setupFunctions, rootUrl, options;

function formUrl(apiString) {
    return rootUrl + 'ghost/api/v0.1/' + apiString;
}

setupFunctions = {
    getIdAndSecret: function () {
        return get(rootUrl + 'ghost/setup/one/').then(function (res) {
            var $ = cheerio.load(res[1]);

            blogDetails.clientId = $('meta[name="env-clientId"]').attr('content');
            blogDetails.clientSecret = $('meta[name="env-clientSecret"]').attr('content');
        }).catch(function (e) {
            console.error('Could not connect to server, exiting.');
            process.exit(1);
        });
    },

    setup: function () {
        var email = faker.internet.email(),
            password = faker.internet.password();

        return post(formUrl('authentication/setup/'), {form: {
            setup: [{
                name: faker.name.findName(),
                email: email,
                password: password,
                blogTitle: faker.lorem.words().join(' ')
            }]
        }}).then(function () {
            blogDetails.email = email;
            blogDetails.password = password;
        }).catch(function () {
            console.error('Setup failed, exiting.');
            process.exit(1);
        });
    }
}

module.exports = function (args) {
    var isCli = false;
    if (args.constructor === Array) {
        isCli = true;
        args = minimist(args);
        rootUrl = (args._.length > 0) ? args._[0] : args.u || args.url;
    } else {
        rootUrl = args.url || args.u;
    }

    options = _.omit(args, ['u', 'url', '_']);

    if (!rootUrl) {
        if (!isCli) {
            return false;
        }

        console.error('No url specified, exiting.');
        process.exit(1);
    }

    rootUrl = rootUrl.replace(/\/?$/, '/');

    setupFunctions.getIdAndSecret().then(function () {
        return setupFunctions.setup();
    });
}
