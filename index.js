var _ = require('lodash'),
    fs = require('fs'),
    minimist = require('minimist'),
    request = require('request'),
    Promise = require('bluebird'),
    cheerio = require('cheerio'),
    faker = require('faker'),
    get = Promise.promisify(request.get, {multiArgs: true}),
    post = Promise.promisify(request.post, {multiArgs: true}),
    put = Promise.promisify(request.put, {multiArgs: true}),
    blogDetails = {},
    functions, rootUrl, options;

function requestOpts(apiString, opts) {
    var defaultOpts = {
        uri: rootUrl + 'ghost/api/v0.1/' + apiString
    };

    if (blogDetails.accessToken) {
        _.assign(defaultOpts, {
            headers: {
                'Authorization': 'Bearer ' + blogDetails.accessToken
            }
        });
    }

    _.assign(defaultOpts, opts);
    return defaultOpts;
}

functions = {
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
        var email = options.email || faker.internet.email(),
            password = options.password || faker.internet.password();

        return post(requestOpts('authentication/setup/', {form: {
            setup: [{
                name: options.userName || faker.name.findName(),
                email: email,
                password: password,
                blogTitle: options.blogTitle || faker.lorem.words().join(' ')
            }]
        }})).then(function (result) {
            result = JSON.parse(result[1]);

            blogDetails.email = email;
            blogDetails.password = password;
            blogDetails.authorId = result.users[0].id;
        }).catch(function () {
            console.error('Setup failed, exiting.');
            process.exit(1);
        });
    },

    login: function () {
        return post(requestOpts('authentication/token/', {json: {
            grant_type: 'password',
            username: blogDetails.email,
            password: blogDetails.password,
            client_id: blogDetails.clientId,
            client_secret: blogDetails.clientSecret
        }})).then(function (res) {
            res = res[1];
            blogDetails.accessToken = res.access_token;
        }).catch(function () {
            console.error('Login failed, exiting.');
            process.exit(1);
        });
    },

    posts: function () {
        if (!options.posts) {
            return Promise.resolve();
        }

        if (options.posts === true) {
            options.posts = 5;
        }

        var posts = [];

        for(var i = 0; i < options.posts; i++) {
            var title = (Math.random() + 0.5) > 1 ? faker.lorem.sentence() : faker.lorem.words().join(' '),
                content = (Math.random() + 0.1) > 1 ? faker.lorem.paragraph() : faker.lorem.paragraphs();

            if (options['image'] === false) {
                posts.push(post(requestOpts('posts/?include=tags', {json: {posts: [{
                    author: "" + blogDetails.authorId,
                    featured: false,
                    markdown: content,
                    slug: 'test-post-' + i,
                    title: title,
                    status: 'published'
                }]}})));
            } else {
                posts.push(post(requestOpts('uploads/', {formData: {
                    uploadimage: {
                        value: fs.createReadStream(__dirname + '/images/ghost.png'),
                        options: {
                            filename: 'image-' + i + '.png'
                        }
                    }
                }})).then(function (response) {
                    return post(requestOpts('posts/?include=tags', {json: {posts: [{
                        author: "" + blogDetails.authorId,
                        featured: false,
                        markdown: content,
                        slug: 'test-post-' + (Math.random() * 1000),
                        title: title,
                        status: 'published',
                        image: response[1]
                    }]}}));
                }));
            }
        }

        return Promise.all(posts);
    },

    tags: function () {
        return Promise.resolve();
    },

    users: function () {
        return Promise.resolve();
    }
};

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

    return functions.getIdAndSecret().then(function () {
        return functions.setup();
    }).then(function () {
        return functions.login();
    }).then(function () {
        return Promise.all([
            functions.posts(),
            functions.users(),
            functions.tags()
        ]);
    });
};
