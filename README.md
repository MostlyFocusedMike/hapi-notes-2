# SECTION 2: # SECTION 2: ROUTE HANDLING
--------------------------------------------------------------------------------------------------------------
- [My github for this section](https://github.com/MostlyFocusedMike/hapi-notes-2)
- primary sources: 
    - [Future Studio's main article](https://futurestud.io/tutorials/hapi-route-handling-and-drive-traffic-to-your-server)
    - [Route handler section from this Future Studio article](https://futurestud.io/tutorials/hapi-v17-upgrade-guide-your-move-to-async-await)
    - [routing section in the hapi docs tutorial](https://hapijs.com/tutorials/routing)
    - [hapi docs](https://hapijs.com/api)




-----------------------------------------------------------------------------------------------------------
# Route handler methods 
- In the **route config object** you can pass either one or many HTTP methods to a route
- to pass several, just use an array. You will be fine as long as there are no HTTP verb collisions: 

```
server.route({  
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return 'It is I, the homepage'
    }
})

server.route({  
    method: [ 'POST', 'PUT' ],
    path: '/',
    handler: (request, h) => {
    // process the request’s payload …

    return 'Both POST and PUT will trigger this handler'
    }
})

```
- This isn't super common, but it's good to know about




-----------------------------------------------------------------------------------------------------------
# Path parameters
- Most modern applications will require dynamic routing, where one or more sections of a url will change
- Hapi uses {} to mark what sections of a path are the parameters, and you can access them from the handler's request object like so:

```
server.route({  
    method: 'GET',
    path: '/schools/{schoolName}/users/{username}',
    handler: (request, h) => {
        // these vars keep the line length short
        const user = request.params.username;
        const school = request.params.schoolName;

        return `${user} wishes ${school} wasn't so expensive.`;
    }
});
```

- so when we enter the url http://localhost:3101/schools/harvard/users/tom, our page outputs: 

```
tom wishes harvard wasn't so expensive.
```

- parameters must be valid JS variable names
    - schoolName works, school-name does not

## Optional parameters 
- sometimes, parameters are optional, if that is the case use a '?' at the end
- optional parameters must be the very last parameter 

```
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
```

## Partial and multiple parameters in a url segment 
- Sometimes only part of a parameter needs to be dynamic: 

```
server.route({
    method: 'GET',
    path: '/my-file/{fileName}.jpg',
    handler: function (request, h) {

        const file = encodeURIComponent(request.params.fileName)

        return `Loading up ${file}.jpg!`;
    }
});
```
- other times, you'll want more than one parameter in a segment
- the two parameters (or more) must have valid url charaters between them, you can't just do: 
    - /{param1} {param2}

```
server.route({
    method: 'GET',
    path: '/my-file/{fileName}.{ext}',
    handler: function (request, h) {

        const file = encodeURIComponent(request.params.fileName);
        const ext = encodeURIComponent(request.params.ext);
        return `Loading up ${file}.${ext}!`;
    }
});
```

## Multi-segment parameters 
- A single parameter can span multiple segments, you just have to say how many with '*'
- you just have to split the param with **split('/')**

```
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
```

- so when we visit http://localhost:3101/my-foods/pizza/ice-cream, we get: 

```
pizza and ice-cream are the best!
```


------------------------------------------------------------------------------------------------------------
# Route handler
- the route handler is a function that can accept 2 parameters: the request object and the response toolkit
    - here's the signature:  **function (request, h)**
    - that 'h' is the response toolkit, which is an object that has several useful methods

## The Request Object 
- this contains all the info for request from the end user
- it has things like the payload, parameters, path, headers and much more 
- check out the [docs for the request](https://hapijs.com/api#request) for all its properties

## Response toolkit
- first off, it's called 'h' for Hapi, that's took me too long to figure out 
- Unlike Hapi 16, which needed a **reply()** callback to send anything back to the user, Hapi 17's handlers can send back simple data on their own 
- However, there are still cases where we need some extra methods, like for redirecting or rendering views
- for more info look at the [docs for the response toolkit](https://hapijs.com/api#response-toolkit)
- here are some common ones below, note that some of these methods require plugins, which we will cover in the next section: 

```
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
```




------------------------------------------------------------------------------------------------------------
# Route options
- the route options object is where you configure things like auth, caches, and validation
- it's also where tags, notes, and documentation go. These are used for things like automated logging and documentation, and are quite helpful, so I recommend adding them.
- in hapi 16 this was called 'config', which is still backwards compatible in hapi 17, but you should really call it options moving forward 
- check the [docs for more on options](https://hapijs.com/api#route-options)

```
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
```



------------------------------------------------------------------------------------------------------------
# Basic file organization
- Route handlers can get rather large, so it is not advisable to define them in your server file 
- Let's talk about one way (there are MANY) to organize your files for a project 

## File configuration
**let's layout our project like so:**
- package.json
- README.md
- node_modules/
- src/ 
    - lib/ 
        - routes/ 
            - home.js
            - options.js
            - toolkit.js
            - home.js
            - home.js
            - ...etc.

- each of those routes files is just the **route configuration object** as the export: 

```
// FILE: home.js
 
module.exports = {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return 'It is I, the homepage'
    }
};
```

- to load them into our server, just place them into our **start()** function: 

```
// FILE: server.js 

async function start () {

    // load our routes 
    server.route(require('./lib/routes/home'));
    server.route(require('./lib/routes/options'));
    server.route(require('./lib/routes/toolkit'));
    // etc

    try {
        await server.start(); // the builtin server.start method is async
    } catch (err) {
        console.error(err);
        process.exit(1);
    };

    console.log('Server running at: ', server.info.uri);
}

```

- this is much better, now our handlers don't all get smushed into a single file, however, all those requires aren't super dry
- this is where Hapi's Haute Couture plugin comes in. We'll talk about it very briefly in the next mini section.
- Haute implements a system, much like rails, where if you configure your project in a certain way, Haute will do a lot of the grunt work for you. 
- in this case, if your routes are in **/lib/routes** and match that export shape I listed above, it will automatically load them all into you server for you, no requires() required. 
- Don't feel like you have to load it up, feel free to load your routes however you like, just be sure they are organized in a way that makes sense. 







