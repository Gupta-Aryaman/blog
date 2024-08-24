+++
title = "Breaking Boundaries"
date = "2023-12-17"

description = "This article talks about GIL in python and issues caused by it. It also looks into efforts made to overcome GIL, and how can you make your python code perform the best inspite of these 'issues'."

tags = ["breaking-boundaries","gil","no-gil","python","multithreading",]
newsletter_groups = ["blogs"]
+++

Python faces challenges in fully exploiting the growing capabilities of modern hardware. As hardware continues to advance with more CPU cores, faster processors, and abundant memory, Python's inherent design and execution model can often fall short in taking full advantage of these resources. Its single-threaded nature and certain architectural choices can result in suboptimal performance in scenarios where parallelism and hardware acceleration are vital. This limitation prompts developers to seek alternative solutions, such as integrating Python with external libraries, languages, or technologies, to overcome these hardware-related constraints.

### **NEED OF SIMULTANEOUS EXECUTION IN PYTHON**

We all know that the main advantage of using python is that it is easy to learn, easy to use, and highly versatile, supporting developer productivity. However, Python is also **notoriously slow**. Programs written in languages such as C++, Node. js, and Go can execute as much as 30-40 times faster than equivalent Python programs.

![Table 1.1: Courtesy of github project ](/images/breaking-boundaries/image1.png)

<details data-node-type="hn-details-summary"><summary>Table Details</summary><div data-type="detailsContent">Table 1.1: Courtesy of github project by Kostya M</div></details>

Even though Python is constantly being optimized to work faster, we simply can’t rely on the basic single-threaded execution codes as they are too slow. Hence the need for simultaneous execution.

### **SIMULTANEOUS EXECUTION POSSIBILITIES IN PYTHON**

3 big contenders for dealing with multiple tasks in Python -

1. Asyncio - **In computer programming,** [***asynchrony***](https://en.wikipedia.org/wiki/Asynchrony_(computer_programming)) **encompasses events that occur independently of the primary program flow and methods for managing these events. In essence, asynchronization implies that you can proceed with executing other sections of code without the need to wait for a particular task to finish.**
    
    For example, asynchronous programming is beneficial to use where multiple database interactions are there, database read/write operations generally take a lot of time hence the flow of execution can be changed instead of the database call to get completed.
    
    * Cooperative pausing/waiting
        
    * Good for I/O bound processes
        
2. Threading -
    
    1. Python runs on single thread on single CPU
        
    2. GIL is a global lock around the entire Python interpreter. In order to advance the interpreter state and run the python code a thread must require the GIL. Hence, it is possible to have multiple python threads in the same process, only one of them can be executing the python code. While this happens, rest of them must wait to receive the GIL.
        
    3. Non-cooperative pausing/interrupting
        
    4. Good for I/O bound
        
    5. Good to do long-running ops w/o blocking (example GUI application)
        
3. **Multiprocessing -**
    
    1. Create different processes which have their own GIL
        
    2. Better where all processes are completely independent of each other
        

### **Threading**

Let's take a for loop as an example, this loop is a CPU intensive task.

```python
### Code 4.1: CPU Intensive task example

DO = 100000000
ans = 1

def foo(n):
   global ans
   for i in range(n):
       ans += 2
foo(DO)
print(ans)
```

![](/images/breaking-boundaries/image2.png)

As this was a simple single threaded task, it took around 5 secs and was 99% CPU intensive.

Okay, so if I have 2 loops like this running on a single thread, it would take around 10s. This is very bad.

```python
### Code 4.2: Extension of Code 4.1, 2 CPU Intensive tasks

DO = 100000000
ans = 1

def foo(n):
  global ans
  for i in range(n):
      ans += 2
foo(DO)
foo(DO)
print(ans)
```

![](/images/breaking-boundaries/image3.png)

No issues, as these are CPU intensive tasks, we can run both the tasks on different threads. Hence, simultaneous execution would help us run 2 threads simultaneously and concurrently and the time would be reduced by half.

```python
### Code 4.3: CPU Intensive tasks executed in different threads

from threading import Thread

DO = 100000000
ans = 1

def foo(n):
   global ans
   for i in range(n):
       ans += 2

t1 = Thread(target=foo, args=(DO//2,))
t2 = Thread(target=foo, args=(DO//2,))

t1.start()
t2.start()
t1.join()
t2.join()

print(ans)
```

If this was true multithreading, the time taken for a for loop of half the range of the previous example should be half of the previous time taken, i.e. around 2.5 sec.

![](/images/breaking-boundaries/image4.png)

But we can see it again took roughly the same time. Why is this happening? To understand this we need to look into the core concept of Cpython - GIL.

### **GIL?! What is GIL?**

Before discussing GIL, it is important to note that we are discussing this in terms of Cpython.

* **Python** - definition of programming language we know, PEP - python enhancement proposals
    
* **Cpython** - physical implementation of the ideas in “Python” in C language
    

Generally when we talk about python, we refer to the Cpython implementation of the language only.

Moving forward -

![](/images/breaking-boundaries/image5.png)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Code 4.1.1: foo function</div></details>

I created a function foo() where I allocated a = 50.

50 will be stored in memory and the variable a would be pointing to it. So the *reference count* of the memory where 50 is stored would be 1. But now, when the function is finished, the memory location has to be cleared/dereferenced. Hence, the reference count would be decreased by 1.

> *Reference counting in CPython - At a very basic level,* ***a Python object's reference count is incremented whenever the object is referenced, and it's decremented when an object is dereferenced***\*.\*

The memory deallocation is done in different ways in different languages but in python when the reference count of a memory location becomes 0, python knows that that memory location can be used for storing something else.

Example - Garbage collectors is used by java

![](/images/breaking-boundaries/image6.png)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Code 4.1.2a: Reference Counting</div></details>

Then, why do we get a *reference count* of ‘a’ as 3 here?

![](/images/breaking-boundaries/image7.png)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">FIgure 4.1.1: Reference Counting explanation</div></details>

This is the reason.

![](/images/breaking-boundaries/image8.png)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Code 4.1.2b: Reference Counting</div></details>

The main issue comes, when there is concurrency involved in python threads -

![](/images/breaking-boundaries/image9.png)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Figure 4.1.2: Issue in concurrency&nbsp; in python due to reference counting</div></details>

Imagine 2 threads are running simultaneously, in CPython. Reference Count of memory location pointed by variable ‘a’ is 3. Thread 1 and 2 ask what is the reference count of ‘a’ and both get 3. Now I do ‘b=a’ in thread 1 so the reference count increases to 4. At the same time I do ‘c=a’ in thread 2 and it also updates the reference count to 4.

**<mark>But shouldn’t the reference count be 5? Race conditions occur in such cases.</mark>** **Hence, the requirement for concurrency management or GIL (Global Interpreter Lock) is required**

![](/images/breaking-boundaries/image10.png)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Figure 4.1.3: The GLOBAL INTERPRETER LOCK helps maintain reference count</div></details>

In a real scenario if I have 4 threads running concurrently, thread 1 acquires the GIL, does some computation and waits for some I/O. In that time, the GIL is transferred to thread 2 which again does some task and starts waiting for something, for example a mouse click in the GUI. Again the GIL is transferred to a different thread. That’s why multithreading works in cpython.

But if I have 2 different threads and both want to work with the CPU, then GIL is not a good option.

> Python 1.0 (1994): Python was initially designed without the GIL. In its early versions, Python used a simple reference counting mechanism for memory management. However, this approach had limitations, especially when dealing with circular references, which could lead to memory leaks.
> 
> Python 1.5 (1999): With Python 1.5, Guido van Rossum, the creator of Python, introduced the Global Interpreter Lock (GIL) as a solution to the multi-threading problems.

Referring back to the example code 4.3-

```python
### Code 4.3: CPU Intensive tasks executed in different threads

from threading import Thread

DO = 100000000
ans = 1

def foo(n):
   global ans
   for i in range(n):
       ans += 2

t1 = Thread(target=foo, args=(DO//2,))
t2 = Thread(target=foo, args=(DO//2,))

t1.start()
t2.start()
t1.join()
t2.join()

print(ans)
```

![](/images/breaking-boundaries/image11.png)

If this was true multithreading, **the time taken for a for loop of half the range of the previous example should be half of the previous time taken, i.e. around 2.5 sec.**

But this didn’t happen. This means that as both are around 99-100% CPU bound, both require **GIL** to execute. Hence, when 1 thread acquires the GIL, the **other thread waits** to receive the GIL back… hence the time required was roughly the same. Practically they never ran truly parallelly.

So, how do we run threads truly concurrently in Cpython? Many times we don't even realize the bottleneck capacity of Cpython as majority of times we are not working with purely python code, for example working with numpy array, numba etc. we can get away with using multithreading/without acquiring GIL as once GIL is acquired, python calls a C program which runs in the background, and hence in that time the GIL can be given to other thread.

### **GIL HISTORY AND REMOVAL EFFORTS**

GIL was first introduced in 1999, and had several positive and negative ramification-

1. Positives -
    
    1. Simple
        
    2. Easy to get right
        
    3. No deadlocks as there is only 1 lock
        
    4. Single threading is fast!
        
    5. Good for i/o bound threads
        
2. Negatives -
    
    1. Bad for CPU bound tasks, as execution will always be on a single core. This was fine in 1992 as we would rarely see multi core CPUs back then. But the WORLD HAS CHANGED!
        

Unfortunately until and unless GIL is present this limitation would always be there, hence GIL removal has been a huge topic of discussion in the Cpython implementation.

![](/images/breaking-boundaries/image12.png)

![](/images/breaking-boundaries/image13.png)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Figure 4.2.2: https://peps.python.org/pep-0703/</div></details>

In PEP - Python Enhancement Proposals - a [proposal](https://peps.python.org/pep-0703/) was made, to make the GIL optional, proposing to adding a build configuration and to let it run Python code without the global interpreter lock and with the necessary changes needed to make the interpreter thread-safe.

Over the years, various efforts have been made to overcome the limitations posed by the GIL:

1. **Free-Threading (1996):** An early attempt to address the GIL was called "free-threading," but it didn't fully remove the GIL and had its own set of complexities.
    
2. **Gilectomy (2015):** This initiative aimed to remove the GIL from CPython entirely. However, it turned out to be a challenging task due to the intricacies of Python's memory management and extensive use of C libraries.
    
3. **Recent Developments:** "**nogil**" have been proposed, which explore ways to make Python more thread-friendly and possibly eliminate the GIL. These proposals aim to allow more parallelism in certain scenarios.
    

In the following sections, we would compare the performance improvements of these efforts done by other people and see how much improvements they actually give and at what costs.

There are **three important aspects** of Python to consider if we want fast, free-threading in CPython:

1. **Single-threaded performance**
    
2. **Parallelism**
    
3. **Mutability** (the ability to change the state or content of objects in a programming language, meaning that mutable objects can be modified after they are created)
    

The last of these, mutability, is key.

Almost all of the work done on speeding up dynamic languages stems from original work done on the *self programming language,* but with many refinements. Most of this work has been on Javascript, which is single-threaded and less mutable than Python, but PyPy has also made some significant contributions. PyPy has a GIL.

*Self is an object-oriented programming language based on the concept of prototypes,*

There is also work on Ruby. Ruby is even more mutable than Python, but also has a GIL. Work on Ruby mirrors that on Javascript.

The JVM supports free threading, but Java objects are almost immutable compared to Python objects, and the performance of Python, Javascript and Ruby implementations on the JVM has been disappointing, historically.

Performing the optimizations necessary to make Python fast in a free-threading environment will **need some original research**. That makes it more costly and a lot more risky.

There are three options available to the Steering Council (with regard to PEP  703:

1. Choose single-threading performance: We ultimately expect a 5x speedup over 3.10
    
2. Choose free-threading: NoGIL appears to scale well, but expect worse single threaded performance.
    
3. Choose both.
    

#### **The pros and cons of the three options**

Option 1:

* Pros: We know how to do this. We have a plan. It will happen. Sub-interpreters allow some limited form of parallelism.
    
* Cons: It keeps the GIL, preventing free-threading.
    

Option 2:

* Pros: Free threading; much better performance for those who can use multiple threads effectively.
    
* Cons: Some unknowns. Worse performance for most people, as single threaded performance will be worse. We don’t know how much worse.
    

Option 3:

* Pros: Gives us the world class runtime that the world’s number one programming language should have.
    
* Cons: More unknowns and a large cost.
    

### **FREE-THREADING Patch -** [link](http://www.python.org/ftp/python/contrib-09-Dec-1999/System/threading.tar.gz)

> *Released in 1996, the Free Threading patch was built for Python 1.4 by Greg Stein. Unfortunately, Python 1.4 is very old and cannot be built on modern systems of today’s times. Hence, we would be looking into* [*benchmarkings done by Dave Beazley*](http://dabeaz.blogspot.com/2011/08/inside-look-at-gil-removal-patch-of.html) *in 2011.*

First, he wrote a simple spin-loop and see what happened:

![](/images/breaking-boundaries/image14.png)

Using the original version of Python-1.4 (with the GIL), this code ran in about 1.9 seconds. Using the patched GIL-less version, it ran in about 12.7 seconds. **That's about 6.7 times slower**. Yow!

Just to further confirm his findings, he ran the included Tools/scripts/[pystone.py](http://www.python.org/ftp/python/contrib-09-Dec-1999/System/threading.tar.gz) benchmark (modified to run slightly longer in order to get more accurate timings).

First, with the GIL:

![](/images/breaking-boundaries/image15.png)

Now, without the GIL:

![](/images/breaking-boundaries/image16.png)

Here, the **GIL-less Python is only about 4 times slower.**

To test threads,he wrote a small sample that subdivided the work across two worker threads is an embarrassingly parallel manner (note: this code is a little wonky due to the fact that Python-1.4 doesn't implement thread joining--meaning that we have to do it ourselves with the included binary-semaphore lock).

![](/images/breaking-boundaries/image17.png)

If we run this code with the GIL, the execution time is **about 2.5 seconds or approximately 1.3 times slower than the single-threaded version** (1.9 seconds). Using the **GIL-less Python, the execution time is 18.5 seconds or approximately 1.45 times slower than the single-threaded version** (12.7 seconds). <mark>Just to emphasize, the GIL-less Python running with two-threads is running more than</mark> **<mark>7 times slower</mark>** <mark>than the version with a GIL.&nbsp;</mark> 

*Ah, but what about preemption you ask? If we return to the example above in the section about reentrancy, we will find that removing the GIL, does indeed, allow free threading and long-running calculations to be preempted. Success! Needless to say, there might be a few reasons why the patch quietly disappeared.*

### **GILECTOMY *by Larry Hastings* -** [**link**](https://github.com/larryhastings/gilectomy)

The earlier effort of removing GIL was more of a failure, as it worsened single thread performance as well as the multi threaded program ran slower compared running the same on single thread.

Hence, **3 political considerations** Larry Hastings tried to keep in mind while building Gilectomy were -

* Don’t hurt single threaded performance
    
* Don’t break c extensions
    
* Don’t make it too complicated
    

So, the things he did were -

1. **Keep reference counting** - It is a core functionality of Cpython and changing it would mean writing all the C APIs.
    
    1. Used atomic incr/decr which comes free with Intel Processor. But is 30% slower off the top
        
2. **Global and static variables**
    
    1. **Shared singletons - all variables (in thread implementation) are public everytime**
        
3. **Atomicity** - This is where the one big lock (GIL) would be replaced by smaller locks
    
    1. Hence, a new lock api was introduce
        

![](/images/breaking-boundaries/image18.jpeg)

Here is a benchmarking code given by  *Larry Hastings* himself, as the Gilectomy implementation has a lot of things like “str” etc. which don't work as intended.

To benchmark, this code was run using both, Cpython (GIL) and Gilectomy (noGIL), on a **8 core, 2.80GHz system**.

```python
### Code 4.4.1: Benchmarking Code of Gilectomy - 
### https://github.com/larryhastings/gilectomy/blob/gilectomy/x.py

import threading
import sys

def fib(n):
   if n < 2: return 1
   return fib(n-1) + fib(n-2)
def test():
   print(fib(30))

threads = 1 #changing number of threads here

if len(sys.argv) > 1:
   threads = int(sys.argv[1])

for i in range(threads - 1):
   threading.Thread(target=test).start()

if threads > 0:
   test()
```

This code performs a CPU intensive task of calculating fibonacci of a large number (30 in this case) and running that CPU heavy task on multiple threads.

**This code was ran on both Cpython-3.11 and Gilectomy-3.6.0a1**

> The reason for providing a benchmarking code by Larry was that many \*\*features in Cpython did not work as it is in this Gilectomy’\*\*s implementation of python. Something as simple as ‘str’ (string) had a very ambiguous behavior hence, he had to provide a code which could run on both Cpython and Gilectomy.

![](/images/breaking-boundaries/image19.jpg)

![](/images/breaking-boundaries/image20.jpg)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Output 4.4.1 - Output for Benchmarking Code 4.4.1</div></details>

![](/images/breaking-boundaries/image21.png)

<details data-node-type="hn-details-summary"><summary>Graph Details</summary><div data-type="detailsContent">Graph 4.4.1 - Cpyton(GIL) vs Gilectomy(no GIL) Wall Time taken by code to complete execution - comparison on multithreaded code</div></details>

This graph represents the Wall Time difference in time taken by both the versions of Python. We can see the Gilectomy implementation is **2x times slower**, which is not bad.

![](/images/breaking-boundaries/image22.png)

<details data-node-type="hn-details-summary"><summary>Graph Details</summary><div data-type="detailsContent">Graph 4.4.2 - Cpyton(GIL) vs Gilectomy(no GIL) CPU Time taken by code to complete execution - comparison on multithreaded code</div></details>

But here we can see that in terms of CPU time, Gilectomy is nearly 2x slower at 1 thread, but **jumps to 10x slower at 2 threads** and from there it keeps going up and up. At 17 cores, it is **nearly 19-20 times slower**.

> *In the context of this code, more CPU time is typically considered "bad" or inefficient.* If you're running multiple threads and each thread consumes a lot of CPU time, it can lead to high CPU utilization, potentially causing the system to become unresponsive for other tasks.

**What happened to Gilectomy later?**

The last update in Pycon 2019 was that after significant work *Larry Hastings* was still able to get the performance of his non-GIL version to match that of to Python with the GIL, but with a significant caveat; the default Python version ran only on a single core (as expected) - the non-GIL version needed to run on 7 cores to keep up. Larry Hastings later admitted that work has stalled, and he needs a new approach since the general idea of trying to maintain the general reference counting system, but protect the reference counts without a Global lock is not tenable.

### nogil by *Sam Gross* - [link](https://github.com/colesbury/nogil)

*nogil* is a **proof-of-concept implementation** of CPython that supports multithreading without the global interpreter lock (GIL). The purpose of this project was to show -

1. That it is feasible to remove the GIL from Python.
    
2. That the tradeoffs are manageable and the effort to remove the GIL is worthwhile.
    
3. That the main technical ideas of this project (reference counting, allocator changes, and thread-safety scheme) should serve as a basis of such an effort.
    

![](/images/breaking-boundaries/image23.png)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Figure 4.5.1: nogil speed-up on the pyperformance benchmark suite compared to Python 3.9.0a3. Benchmarking across existing Cpython modules in nogil Python implementation to check speedup/speeddown</div></details>

Let’s test on the same code, but calculating fib of 40 now -

```python
### Code 4.5.1: Benchmarking code of CPU intensive task of calculating 
###             fibonacci of a large number, code ran on both  Cpython-3.11 
###             and nogil-3.9.10-1

import threading
import sys

def fib(n):
   if n < 2: return 1
   return fib(n-1) + fib(n-2)
def test():
   print(fib(40))  # test function that calculates fibonacci number
threads = 7 # number of threads
if len(sys.argv) > 1:
   threads = int(sys.argv[1])
for i in range(threads - 1):
   threading.Thread(target=test).start()
if threads > 0:
   test()
```

![](/images/breaking-boundaries/image24.jpg)

![](/images/breaking-boundaries/image25.jpg)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Output 4.5.1 - Output for Benchmarking Code 4.5.1</div></details>

As we can see here, running code on *nogil* python implementation helped us to utilize **more than 1 core at the same time without any restrictions**, and all the 7 threads created are **utilizing 100%** of the respective **CPU**s.

In the same multithreaded process in a shared-memory multiprocessor environment, **each thread in the process can run concurrently on a separate processor**, resulting in parallel execution, which is true simultaneous execution.

![](/images/breaking-boundaries/image26.png)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Figure 4.5.2: nogil multithreaded execution - htop view of CPU utilization (7 threads)</div></details>

Meanwhile, creating 7 threads on Cpython implementation gives really poor performance, as even though 7 threads exist, only 1 of them is running truly at a particular moment.

![](/images/breaking-boundaries/image27.png)

<details data-node-type="hn-details-summary"><summary>Figure Details</summary><div data-type="detailsContent">Figure 4.5.3: Cpython multithreaded execution - htop view of CPU utilization (7 threads)</div></details>

The shear performance improvement in nogil implementation over Cpython is mind blowing, making us wonder the highs MultiThreading in Python can touch -

![](/images/breaking-boundaries/image28.png)

<details data-node-type="hn-details-summary"><summary>Graph Details</summary><div data-type="detailsContent">Graph 4.5.1: Cpyton(GIL) vs nogil CPU Time taken by code to complete execution - comparison on multithreaded code</div></details>

As it is clearly visible, nogil completely outperforms the Cpython, even giving better performance in a single threaded program.

![](/images/breaking-boundaries/image29.png)

<details data-node-type="hn-details-summary"><summary>Graph Details</summary><div data-type="detailsContent">Graph 4.5.2: Cpyton(GIL) vs nogil ratio of improvement in execution time - (nogil / Cpython)</div></details>

As clearly shown above, **nogil can achieve upto 5x better performance** in multithreaded programs, and gives slightly better performance in single thread as well.

### **Multiprocessing**

The multiprocessing library allows Python programs to start and communicate with Python sub-processes. This allows for parallelism because each sub-process has its own Python interpreter (i.e there’s a GIL per-process).

**Communication between processes is limited and generally more expensive than communication between threads**.

Objects generally need to be serialized or copied to shared memory. Starting a sub-process is also more expensive than starting a thread, especially with the “spawn” implementation.

> Starting a thread takes ~100 µs, while spawning a sub-process takes ~50 ms (50,000 µs) due to Python re-initialization.

```python
### Code 5.1: Multiprocessing demonstration in python

import multiprocessing

def fib(n):
  if n < 2: return 1
  return fib(n-1) + fib(n-2)
def test():
  print(fib(50))

if __name__ == "__main__":
   p1 = multiprocessing.Process(target=test)    # creating processes
   p2 = multiprocessing.Process(target=test)
   p1.start()    # starting processes
   p2.start()
   p1.join()      # waiting for processes to finish
   p2.join()

   # both processes finished
   print("Done!")
```

![](/images/breaking-boundaries/image30.png)

The multiprocessing library has a number of downsides.

1. The “fork” implementation is prone to deadlocks.
    
2. Multiple processes are harder to debug than multiple threads. Sharing data between processes can be a performance bottleneck. For example, in PyTorch, which uses multiprocessing to parallelize data loading, copying Tensors to inter-process shared-memory is sometimes the most expensive operation in the data loading pipeline.
    
3. Additionally, many libraries don’t work well with multiple processes: for example CUDA doesn’t support “fork” and has limited IPC support.
    

### Conclusion

Seeing the level of improvement nogil is able to achieve, this is a big proof of a plausible world having a GIL-Free python which increases multithreaded performance by many folds, having no negative impact on single threading. Even though there is lot of work is still pending, there is no doubt that the PEP 703 will be accepted in the near future, but only time will tell.

### References -

* [discuss.python.org/t/a-fast-free-threading-python/27903](https://discuss.python.org/t/a-fast-free-threading-python/27903)
    
* [python.org/ftp/python/contrib-09-Dec-1999/System/threading.README](https://discuss.python.org/t/a-fast-free-threading-python/27903)
    
* [stackify.com/python-garbage-collection/](https://discuss.python.org/t/a-fast-free-threading-python/27903)
    
* [Larry Hastings - Removing Python's GIL: The Gilectomy - PyCon 2016](https://www.youtube.com/watch?v=P3AyI_u66Bw)
    
* [dabeaz.blogspot.com/2011/08/inside-look-at-gil-removal-patch-of.html](https://discuss.python.org/t/a-fast-free-threading-python/27903)
    
* [pythoncapi.readthedocs.io/gilectomy.html](https://discuss.python.org/t/a-fast-free-threading-python/27903)
    
* [github.com/larryhastings/gilectomy](https://discuss.python.org/t/a-fast-free-threading-python/27903)
    
* [github.com/colesbury/nogil](https://discuss.python.org/t/a-fast-free-threading-python/27903)
    
* [docs.google.com/document/d/18CXhDb1ygxg-YXNBJNzfzZsDFosB5e6BfnXLlejd9l0](https://discuss.python.org/t/a-fast-free-threading-python/27903)