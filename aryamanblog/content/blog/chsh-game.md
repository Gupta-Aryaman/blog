---
title: "CHSH Game"
date: "2024-12-18T19:44:38+05:30"
draft: true
# description: "An introduction to the CHSH game and its role in proving Bell's Theorem, demonstrating the non-local nature of quantum mechanics."
tags: ["quantum-computing", "physics", "bells-theorem", "aryaman-batcave"]
showShareButtons: true
showToc: true
---

Bell's theorem is a term encompassing a number of closely related results in physics, all of which determine that quantum mechanics is incompatible with **local hidden-variable theories**, given some basic assumptions about the nature of measurement. 

**"Local"** here refers to the **principle of locality**, the idea that a particle can only be influenced by its immediate surroundings, and that interactions mediated by physical fields cannot propagate faster than the speed of light. 

**"Hidden variables"** are supposed properties of quantum particles that are not included in quantum theory but nevertheless affect the outcome of experiments. 

In the words of physicist John Stewart Bell, for whom this family of results is named, *"If [a hidden-variable theory] is local it will not agree with quantum mechanics, and if it agrees with quantum mechanics it will not be local."*


# CHSH Game
The CHSH (after Clauser, Horne, Shimony, and Holt) game helps to prove the Bells's Theorem by showing that no classical local hidden-variable theory can explain the correlations that can result from entanglement.

## The Setup
The CHSH game is an example of **nonlocal game**. The setup is as follows - 
* The players are *Alice* and *Bob*, who corporate as a team. Meaning that they either win together or they lose together.
* The game is run by a *referee*.
* Alice andd Bob can prepare for the game however they choose, but once the game starts they are **forbidden from communicating**.

![](/images/chsh-game/setup.png)

## The Referee
The referee determines whether the pair of answers (a, b) **wins or loses** for the question pair (x, y) according to some fixed rule.

![](/images/chsh-game/referee.png)

* The questions and answers are all bits `x, y, a, b ∈ {0, 1}`
* The questions x and y are chosen uniformly at random.
* A pair of answers (a, b) **wins** for (x, y) if - 
![alt text](/images/chsh-game/winning-cond.png)
and loses otherwise.


![alt text](/images/chsh-game/win-cond-table.png)


## Strategies to Win
### Deterministic Strategy
No deterministic strategy can win every time. Even if we consier `(x, y) = (0, 0)`, we can only win maximum of 3/4 times == 0.75 probability.
![alt text](/images/chsh-game/image.png)

### Probabilistic Strategy 
It turns out that using probabilistic strategy can't help them as well, because every probabilistic strategy can be viewed as a random selection of a deterministic strategy just like probabilistic operations can be viewed as random selections of deterministic operations.

### Quantum Strategy