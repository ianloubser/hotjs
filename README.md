# HotJS
The smallest intentionally-reactive, declarative javascript UI framework. No compiling needed, no crazy state management. Supports SSR.

## Why
I know, we don't really need another JS framework in world, but it sure was fun building this :) In all seriousness, sometimes you need something that operates directly on the DOM, no virtual DOM, code compiling and transpiling etc. I've used this to build small browser extensions, widgets etc. Have not really tested on a big SaaS product yet, could probably work but not sure it's the best approach.

## How
Vanilla JS has come far over the past 5 years, module support, ES6 syntax natively support in browsers etc. These things were the most reasons for needing things like babel. Yes babel still has it's place, but probably not as often needed anymore as it was (don't quote me on this).

HotJS at it's core is essentially "syntactic sugar" for the HTMLElement API in browser javascript, or a more friendly interface for HTMLElement API if you will.

### What is intentionally-reactive ?
It's a term I use to define the paradigm where any UI reactivity is intentionally declared instead of some black magic or Virtual DOM trying to determine when your UI should update based on state changes. Intentional reactivity allows you to build components by defining their render rules, and intentionally triggering that component UI to update with a physical statement of code. This allows HotJS to cut down on massive amounts of code. HotJS doesn't try to cater for the plethora of cases which would require a UI change, nor try to be smart enough to keep the whole process optimized. Instead, it leaves the developer in charge of defining rules for reactivity and keeping the UI smooth by manually envoking a UI re-render.

Enough talk, let me show some code.

## Samples

First step would be to initialize hotJS
```javascript
var hot = HotJS()
```

Let's define a simple counter UI updating the elapsed time after every second elapses, the code would look like this:
```javascript
  const Timer = () => {
    let elapsed = 0;
    setInterval(() => {
      elapsed++;
      hot.flush(['timer'])
    }, 1000)

    return hot.span({
      id: 'timer',
      style: {
      	padding: '10px'
      },
      child: () => elapsed
    })
  }
  
  var app = hot.div([
    hot.span('Seconds elapsed: '),
    Timer
  ])

  document.body.appendChild(app)
```

There you have it. No long dependency list, no setups of state or hooks and no compiler needed, just plain ol' javascript. You use declarative syntax to define your Element's properties and rules through `hot.<element_type>(options)`. Where `options` can be another element, a list of elements, a function, plaintext or an object to pass as props to the underlying `Element` object. 

What's amazing is that `hot.span`, `hot.div` etc is just a Proxy around the native javascript `Element` object, which means the following is equivalent:
```javascript
// with hot.js
var el1 = hot.span('some text')

// with vanilla JS
var el2 = document.createElement('span')
el2.innerHTML = 'some text'
```

and subsoquently also:
```javascript
// with hot.js
var el1 = hot.span({
  style: {
    padding: '10px',
    backgroundColor: 'blue',
  },
  id: 'element-id',
  child: 'some text'
})

// with vanilla JS
var el2 = document.createElement('span')
el.id = 'element-id'
el.style.padding = '10px'
el.style.backgroundColor = 'blue'
el2.innerHTML = 'some text'
```

At first glance the above doesn't necessarily look too much like an improvement. But the key improvement introduced by HotJS is the `child` property. This allows us to nest as many elements as we'de like to get more advanced tree structures, take for example a basic todo app:
```javascript
  const CreateTodo = (todos) => {
	  let inputState = '';
    
    const todoRemove = () => {
      todos.push(inputState)
      inputState = ''
      hot.flush(['todos', 'todo-input'])
    }
    
    const todoChange = (e) => {
      inputState = e.target.value;
    }
    
  	return () => hot.div([
    	hot.input({
	      id: 'todo-input',
      	onkeyup: todoChange,
        value: inputState,
        child: ''
      }),
      hot.button({
      	onclick: todoRemove,
      	child: 'Save TODO'
      })
    ])
  }
  
  const TodoItem = (t, todos) => {
    const onTodoRemove = () => {
      todos.splice(todos.indexOf(t), 1)
      hot.flush(['todos'])
    }
    
  	return () => hot.li([
      hot.span(t),
      hot.button({
        onclick: onTodoRemove,
        style: {
          marginLeft: '20px'
        },
        child: 'Remove'
      })    
    ])
  }
  
  const TodoList = (todos) => {
	  console.log("Updating todos....")
  	return () => hot.ul({
	    id: 'todos',
    	child: () => todos.map(t => TodoItem(t, todos))
    })
  }
  
  var todos = []
  var app = hot.div([
    hot.h4('Todo sample'),
    TodoList(todos),
    CreateTodo(todos)
  ])

  document.body.appendChild(app)
```