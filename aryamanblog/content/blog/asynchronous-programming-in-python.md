---
title: "Asynchronous Programming in Python"
date: "2023-09-21"
tags: ["asynchronous", "async", "python", "aryaman-batcave"]
newsletter_groups: ["blogs"]
showShareButtons: true
showToc: true
---

### Sync vs Async

***What is synchronous programming?***

[*Synchronous programming*](https://deepsource.com/glossary/synchronous-programming) is a programming paradigm in which operations are executed sequentially, one after the other. In this model, each operation waits for the previous one to complete before moving on to the next step. This sequential execution can lead to 'blocking' operations, where certain tasks may take a significant amount of time to finish. These blocking operations can pause the entire program's execution, forcing it to wait until the time-consuming task is done before it can proceed. Let's understand it with an example:

```python
from time import sleep

def foo():
    print("in foo")
    sleep(10)  # mimicking some blocking operation
    print("end foo")

foo()
print("Termination of the program")
```

![](/images/asynchronous-programming-in-python/image1.png)

Here, you can observe that the program's execution was strictly sequential, and this led to a halt in the entire program due to a blocking operation inside the `foo()` function, which took 10 seconds to complete. After this 10-second delay, the program continued its execution.

This situation isn't ideal because these blocking operations could encompass a wide range of tasks, such as database queries or waiting for API responses, and they unnecessarily delay the execution of unrelated parts of the program. This is precisely where the concept of *asynchronization* becomes valuable.

![Distributed Thoughts: Asynchronous APIs Done Right](/images/asynchronous-programming-in-python/image2.jpg)

***So, what is asynchronization?***

In computer programming, [*asynchrony*](https://en.wikipedia.org/wiki/Asynchrony_(computer_programming)) encompasses events that occur independently of the primary program flow and methods for managing these events. In essence, asynchronization implies that you can proceed with executing other sections of code without the need to wait for a particular task to finish.

The first step in creating an asynchronous program is creating a [*coroutine*](https://docs.python.org/3/library/asyncio-task.html#coroutines).

### What's a coroutine in Python?

A [*coroutine*](https://docs.python.org/3/library/asyncio-task.html#coroutines) is simply a wrapped version of a function that allows it to run asynchronously. I recommend using Python 3.7+ to follow this guide.

```python
import asyncio  # importing async library

async def main():  # defining a coroutine object
    print("hello world")

print(main())  # Output - <coroutine object main at 0x7f013de5fd80>
```

To create a coroutine object, you just need to create a function normally and add an `async` keyword in front of it. What it essentially does is create a wrapper around this function.

So when we call this function, it creates a coroutine object `<coroutine object main at 0x7f013de5fd80>`. This coroutine object works just like a function and can be executed. To execute a coroutine, you need to *await* it.

Wait, WHAT?! <mark>What's </mark> [<mark>awaiting</mark>](https://docs.python.org/3/library/asyncio-task.html#awaitables)<mark>?</mark> Let me show you the output of the above snippet of code.

![](/images/asynchronous-programming-in-python/image3.png)

As we have a coroutine object now, it does not work like a regular Python function.

### Async Event-Loop

Ok. No worries. Let me just await the `main()` function call, and then it should work, right?

```python
import asyncio

async def main():
    print("hello world")

await main()
```

![](/images/asynchronous-programming-in-python/image4.png)

Oh, no! It gave an error. So what's the issue? The reason it's not running our code because we haven't created an [*event-loop.*](https://docs.python.org/3/library/asyncio-eventloop.html)

Whenever we create an asynchronous program in Python, we need to start/create an *event loop*. An *event loop* typically refers to the core mechanism used for managing and handling asynchronous or non-blocking operations. It's a fundamental component of many asynchronous programming frameworks, such as asyncio, which we are using in our study. It is responsible for this simple async syntax we are seeing here in the backend. We must start an **event loop** in whatever thread we are running this asynchronous program in.

```python
import asyncio

async def main():
    print("hello world")

asyncio.run(main())
```

Hence, to start an event loop, we use `asyncio.run()` and pass it a coroutine object, which acts as an *entry point* to the event loop.

### Await keyword

```python
import asyncio

async def main():
    print("awaiting foo...")
    await foo("inside foo")
    print("finished awaiting foo")

async def foo(text):
    print(text)
    await asyncio.sleep(1)

asyncio.run(main())
```

If we look inside the `foo()` function, the [*await keyword*](https://docs.python.org/3/library/asyncio-task.html#awaitables) is required to run an object of coroutine, <mark>because if you just write something like </mark> `asyncio.sleep(1)` <mark>you are just creating a coroutine but not executing it.</mark>

And we are allowed to use await because we are present inside an asynchronous function. So, if we try to see the output of the entire code, it would be as follows:

![](/images/asynchronous-programming-in-python/image5.png)

We can see that we awaited the `foo()` function call, and going inside the `foo()` function we waited for 1 sec and then the execution was back to the `main()` function.

> But this is not entirely useful, as we can see that this seems to be just another way of writing a synchronous program as we are waiting for `foo()` to execute and then we go forward with the execution in the `main()` function.
> 
> The whole point of asynchronization is to run something else while we are waiting for some other part of the execution to finish which is not achieved here. This can be achieved by creating a task.

### asyncio Tasks

```python
import asyncio

async def main():
    print("awaiting foo...")
    task = asyncio.create_task(foo("inside foo"))
    print("finished awaiting foo")

async def foo(text):
    print(text)
    await asyncio.sleep(1)
    print("Ending foo")

asyncio.run(main())
```

If we see the code above, we are creating a task using the `create_task()` function and passing a coroutine object to it. This essentially tells the program to run the task as soon as there is some kind of waiting in the main line of execution.

![](/images/asynchronous-programming-in-python/image6.png)

Analyzing the output, we can see that the execution of the main() function is completed and then the execution of foo() starts.

> **<mark>VERY IMPORTANT RESULT</mark>**
> 
> You can also see that the "Ending foo" never printed and the execution time of the program was only 0.132 sec. Weren't we sleeping for 1 sec, so shouldn't the execution time be at least 1 sec and "Ending foo" should be printed after? What happened here is when the `foo()` function started sleeping for 1 sec, the execution of the program was given back to the `main()` function, and as there weren't any tasks left in the `main()` function, it terminated and as a result terminated the execution of `foo()` as well which never completed its execution.

![Execution flow](/images/asynchronous-programming-in-python/image7.jpeg)

So if I want to wait for the `foo()` to finish it's execution before `main()` terminates I will need to await it, essentially preventing the `main()` function to terminate prior to the completion of the task `foo()`.

```python
import asyncio

async def main():
    print("awaiting foo...")
    task = asyncio.create_task(foo("inside foo"))
    print("finished awaiting foo")
    await task

async def foo(text):
    print(text)
    await asyncio.sleep(1)
    print("Ending foo")

asyncio.run(main())
```

Hence the output would be as follows (note the time taken for execution).

![](/images/asynchronous-programming-in-python/image8.png)

### More Examples

```python
import asyncio

async def fetch_data():
    print('Start fetching')
    await asyncio.sleep(2)  # mimicking fetching data via some request
    print('Done fetching')
    return {'data': 1}

async def print_numbers():
    for i in range(10):
        print(i)
        await asyncio.sleep(0.25)  # mimicking waiting for a response

async def main():
    task1 = asyncio.create_task(fetch_data())
    task2 = asyncio.create_task(print_numbers())
    
    # awaiting task1 to be completed and then using 
    # the value it returned
    value = await task1
    print(value)
    await task2

asyncio.run(main())
```

Imagine the above scenario where I need to get the return value `{'data': 1}` from the `fetch_data()` coroutine executing via task1 in the `main()` function. Hence, I declare the task1 and `print(task1)`. It would have worked in a synchronous environment. But, from what we have learned so far this is counterintuitive.

![](/images/asynchronous-programming-in-python/image9.png)

As we can see in the output of the above code, we never *awaited* for the task to be completed, hence we would never get the return value from the function (can relate to promises in JavaScript).

Hence the correct code should be as follows:

```python
import asyncio

async def fetch_data():
    print('Start fetching')
    await asyncio.sleep(2)  # mimicking fetching data via some request
    print('Done fetching')
    return {'data': 1}

async def print_numbers():
    for i in range(10):
        print(i)
        await asyncio.sleep(0.25)  # mimicking waiting for a response

async def main():
    task1 = asyncio.create_task(fetch_data())
    task2 = asyncio.create_task(print_numbers())
    
    # awaiting for task1 to be completed and then using 
    # the value it returned
    value = await task1
    print(value)
    await task2

asyncio.run(main())
```

![](/images/asynchronous-programming-in-python/image10.png)

As we can see in the output, because we awaited for task1 to finish, we can get the value returned by it and print it later. We can further see that as `fetch_data()` was waiting for 2 sec, for loop in `print_numbers()` executed 8 times (~2 sec) and gave a chance back to fetch\_data() as it's waiting time had ended.

### Conclusion

When we write `async def func_name()`, what we are doing is wrapping another function with an asynchronous version of it. That version is the [*Coroutine*](https://docs.python.org/3/library/asyncio-task.html#coroutines). To run the *coroutine*, you must *await* it in some way or add it to the event loop. You can add it to the event loop by creating a task (`asyncio.create_task(func_name())`). This allows you to start multiple *coroutines* concurrently. Finally, to start your asynchronous program, you must create an [*event loop*](https://docs.python.org/3/library/asyncio-eventloop.html), which can be done by [`asyncio.run(driver_func())`](http://asyncio.run) and passing an entry point coroutine, which is generally the driver function of your program (for example, the main function).

**<mark>One thing to note is that at a time only a single execution is happening, and it is not to be confused with parallel processing or threading.</mark>**

### References

* [deepsource.com/glossary/synchronous-programming](https://deepsource.com/glossary/synchronous-programming)
    
* [en.wikipedia.org/wiki/Asynchrony\_(computer\_programming)](https://en.wikipedia.org/wiki/Asynchrony_(computer_programming))
    
* [asyncio.run/](https://asyncio.run/)
    
* [docs.python.org/3/library/asyncio-task.htm](https://docs.python.org/3/library/asyncio-task.html#coroutines)
    
* [docs.python.org/3/library/asyncio-eventloop.html](https://docs.python.org/3/library/asyncio-eventloop.html)
    
* [youtube.com/@TechWithTim](https://www.youtube.com/@TechWithTim)
