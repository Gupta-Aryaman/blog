+++
title = "DECORATORS IN PYTHON"
date = "2023-05-31"

description = "An all-you-need-to-know blog about decorators in python."

tags = ["decorators","decorators-in-python","python","aryaman-batcave",]
newsletter_groups = ["blogs"]

[cover]
image = "images/decorators-in-python/cover.avif"
+++

## What on earth are decorators???

Decorators are essentially single reusable functions that take a *"function"* as input and return a modified version of it. Decorators are just a bit different from regular functions because they **wrap** the "*input function*" to extend its functionality without modifying it.

**What does wrapping mean?**

```python
import time

start_time = time.time()
**call your function**    #calling your function
end_time = time.time()
print("Time Taken = ", end_time-start_time)
```

Here you can see that your function call is being "wrapped" between lines of code.

## How are functions getting into another function - First Class Citizens

A **first-class citizen** (also **type**, **object**, **entity**, or **value**) in a given [programming language](https://en.wikipedia.org/wiki/Programming_language) is an entity that supports all the operations generally available to other entities. These operations typically include being passed as an [argument](https://en.wikipedia.org/wiki/Parameter_(computer_programming)), returned from a [function](https://en.wikipedia.org/wiki/Function_(computer_programming)), and assigned to a [variable](https://en.wikipedia.org/wiki/Variable_(computer_science)).

Apart from data types like integers, floating type, strings etc., functions and classes are also First Class Citizens in Python.

```python
def compose(f,g,x):
	return f(g(x)) 

>> compose(print, len, "abc") #passing print, len functions in function-call
3
```

In the above example, we can see that passing functions into another function as an argument is no biggie as functions are First Class Citizens in Python (and so are classes).

***You might wonder what does this have to do with decorators?***

Only because functions are first-class citizens do decorators work. The existence of decorators is based on the fact that Python allows functions to be supplied as arguments and returned from functions, as you will see in the following sections of this article.

## Moving towards Decorators

Decorators start with an *@* symbol.

There are 3 types of decorators in total -

1. Function decorators (decorators wrapping functions)
    
2. Class decorators (decorators wrapping classes)
    
3. Method decorators (decorators wrapping methods ~ *functions belonging to an object*)
    

Let us consider an example-

```python
def wrapper(a):
    def x(*args, **kwargs):
        print("start")
        a(*args, **kwargs)
        print("end")
    return x

def print_sum(a,b,c):
    print(a+b+c)
```

What are we doing here?

1. Created a function named "print\_sum" which takes 3 input arguments and prints their sum
    
2. Creating a nested function named "wrapper" which takes a function as an input and returns a function "x" which wraps that function call of its input function between 2 lines of print statement
    
3. (\*args, \*\*kwargs) just takes all the arguments presented during the function call, it doesn't have any other role here
    

Playing around with the above code -

```python
>>> print(wrapper(print_sum))
<function wrapper.<locals>.x at 0x000001EB1087B0D0>
```

As we can see, I passed the "print\_sum" function into the wrapper function "wrapper", which returns us with another function.

Let us try assigning this function to a variable and then calling it -

```python
>>> print_sum(3,4,1)    #normal print_sum function
8
>>> wrapped_fun = wrapper(print_sum) #print_sum function wrapped in wrapper
>>> wrapped_fun(3,4,1)    #calling the new function
start
8
end
```

What can we deduce from the above execution?

1. Just calling "print\_sum(3, 4, 1)" gives us an output of 8. But when wrapped around by the wrapper function the final output changes
    
2. The wrapper function prints "start", calls the "print\_sum" with arguments (3, 4, 1) and then prints "end" ~ all happening as stated inside the nested wrapper function
    

Now instead of writing throw-away code like above, we can use @ symbol to wrap the function like so -

```python
def wrapper(a):
    def x(*args, **kwargs):
        print("start")
        a(*args, **kwargs)
        print("end")
    return x

@wrapper    #decorator
def print_sum(a,b,c):
    print(a+b+c)
```

Now simply calling the "print\_sum" function gives us the wrapped output, as desired.

```python
>>> print_sum(4,3,1)
start
8
end
```

## Looking into a more practical example

```python
import math
import time

def calc_time(func):
    def x(*args, **kwargs):
        time_start = time.time()
        func(*args, **kwargs)
        time_end = time.time()
        print("\nTime Taken = ", time_end - time_start)
    return x

@calc_time
def primeFactors(n):
    while n % 2 == 0:
        print(2, end=" ")
        n = n / 2
    for i in range(3,int(math.sqrt(n))+1,2):
        while n % i== 0:
            print(i, end= " ")
            n = n / i
    if n > 2:
        print(n, end=" ")
```

Here we have created a function to print all the prime factors of a number and give its running time.

```python
>>> primeFactors(99999999900)
2 2 3 3 3 3 5 5 37 333667.0
Time Taken =  0.021126508712768555
```

We get the prime factors of the number and also its running time.

## Decorators with arguments

Decorators with arguments have a bit different syntax. The decorator with arguments should return a function that will take a function and return another function ~ basically, we are to create a function which returns a decorator.

Let's see it with an example -

```python
import math
import time

def main_wrapper(num): #function which takes an argument and returns the wrapper function
    def calc_time(func):
        def x(*args, **kwargs):
            time_start = time.time()
            func(*args, **kwargs)
            time_end = time.time()
            print("\nTime Taken = ", time_end - time_start)
            print(num) #using the input argument here
        return x
    return calc_time #returning the wrapper function

@main_wrapper(2)    #wrapper function with an argument
def primeFactors(n):
    while n % 2 == 0:
        print(2, end=" ")
        n = n / 2
    for i in range(3,int(math.sqrt(n))+1,2):
        while n % i== 0:
            print(i, end= " ")
            n = n / i
    if n > 2:
        print(n, end=" ")


>>> primeFactors(99999999900)
2 2 3 3 3 3 5 5 37 333667.0
Time Taken =  0.02055978775024414
2
```

## Conclusion

In conclusion, decorators in Python provide a powerful mechanism to extend the functionality of functions and classes without modifying their code directly. By using decorators, you can encapsulate common behaviours, and add logging, timing, authentication, or any other cross-cutting concerns to your functions or classes.

Decorators leverage the concept of first-class citizens in Python, treating functions and classes as objects that can be passed as arguments, returned from other functions, and assigned to variables. This flexibility allows decorators to wrap and modify the behaviour of functions or classes seamlessly.

Overall, decorators are a powerful feature of Python that allows you to easily extend the behaviour of functions and classes, making your code more modular, flexible, and expressive. By mastering decorators, you can unlock a wide range of possibilities and improve the quality of your Python projects. 

## References

* [geeksforgeeks.org/decorators-with-parameters-in-python/](https://www.geeksforgeeks.org/decorators-with-parameters-in-python/)

* [youtube.com/@socratica](https://www.youtube.com/@socratica)

* [stackoverflow.com/questions/5929107/decorators-with-parameters](https://stackoverflow.com/questions/5929107/decorators-with-parameters)

* [en.wikipedia.org/wiki/First-class\_citizen](https://en.wikipedia.org/wiki/First-class_citizen)
