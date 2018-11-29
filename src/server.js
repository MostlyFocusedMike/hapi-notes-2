const Hapi = require('hapi');

// create a server with a host and port
const server = new Hapi.Server({
    host: 'localhost',
    port: 3101
});

// how to use multiple methods
server.route({  
    method: [ 'POST', 'PUT' ],
    path: '/',
    handler: (request, h) => {
        // process the request’s payload …

        return 'Both POST and PUT will trigger this handler';
    }
});

// how to use and access params
server.route({  
    method: 'GET',
    path: '/schools/{schoolName}/users/{username}',
    handler: (request, h) => {
        // these vars keep the line length short
        const user = encodeURIComponent(request.params.username);
        const school = encodeURIComponent(request.params.schoolName);

        return `${user} wishes ${school} wasn't so expensive.`;
    }
});

// how to use optional params
server.route({
    method: 'GET',
    path: '/my-age/{age?}',
    handler: function (request, h) {

        const age = request.params.age ?
            encodeURIComponent(request.params.age) :
            'not telling you how old I am';

        return `I'm ${age}!`;
    }
});
  
// use partial params 
server.route({
    method: 'GET',
    path: '/my-file/{fileName}.jpg',
    handler: function (request, h) {

        const file = encodeURIComponent(request.params.fileName)

        return `Loading up ${file}.jpg!`;
    }
});

// use multiple params per segment 
server.route({
    method: 'GET',
    path: '/my-file/{fileName}.{ext}',
    handler: function (request, h) {

        const file = encodeURIComponent(request.params.fileName);
        const ext = encodeURIComponent(request.params.ext);
        return `Loading up ${file}.${ext}!`;
    }
});

// use multi segment params 
server.route({
    method: 'GET',
    path: '/my-foods/{favFoods*2}',
    handler: function (request, h) {

        const foods = request.params.favFoods.split('/');
        const food1 = encodeURIComponent(foods[0]);
        const food2 = encodeURIComponent(foods[1]);
        return `${food1} and ${food2} are the best!`;
    }
});

// some of the response toolkit methods 
server.route({
    method: 'GET',
    path: '/response-toolkit',
    handler: function (request, h) {
        /* no need for h when returning a string */
        // return '<h1>html is just a string</h1>';

        /* no need for h when returning json */
        //return { hello: 'there' };

        /* redirects DO need to use h */
        // return h.redirect('/404');

        /* rendering views takes a plugin and h */
        // return h.view('index', { name: 'vision' });

        /* use h to create a custom response */
        return h
            .response('<h1>Hello hello</h1>')
            .type('text/html')
            .header('key-name', 'value')
            .code(201);
    }
});

// example of the options 
server.route({  
    method: 'GET',
    path: '/my-options',
    // handler: (request, h) => 'duplicate',
    options: {
        description: 'Just a page that shows all the options',
        notes: 'This page is really just for my notes',
        tags: ['api', 'tutorial'],
        // auth: auth strategies go here 
        // validation: validation checks go here
        handler: (request, h) => {
            return 'Check the code for all the options'
        }
    }
});

// define server start function
async function start () {

    // load our routes from lib
    server.route(require('./lib/routes/home'));

    try {
        await server.start(); // the builtin server.start method is async
    } catch (err) {
        console.error(err);
        process.exit(1);
    };

    console.log('Server running at: ', server.info.uri);
}

// start your server
start();