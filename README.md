# 3D Bin Packing Problem Solution with FFD Algorithm

## Purpose

Purpose of the project is to find a solution to the problem of fitting a set of packages into containers and 
try to find the minimum amount of needed containers.

To solve the problem, I have used _**First-Fitting Decreasing**_ approach.

I have created a simple NodeJS application which calculates minimum amount of needed containers to fit a set
of packages into.

No dependencies or sample from other solutions used in this project. Only some devDependencies to make development
smooth and clean, such as `babel`, `eslint`, `prettier`, etc.

## First-Fit Decreasing Algorithm

Essentially, the algorithm is about sorting the packages from largest to smallest and then start placing them in order.
After getting a point where no more package can fit into the current container, you start continue placing packages
into a new container. Once you finished placing the group of large packages, continue placing smaller packages into
the previous containers going backwards.

For further about FFD, you can check [here](https://en.wikipedia.org/wiki/Bin_packing_problem)

## Structure

I didn't use any specific structure to solve the problem. I tried to keep all the functionality withing very small
functions to increase the re-usability of the code and to make it more testable.

All information about the packages including dimensions and the amount to be placed in the containers are stored
in `PackageSample` objects and information about the container (_Bin_) is stored in `BinSample` object. 

### Placement Approach
Program starts looping all the `PackageSamples` and for each sample, it starts placing packages in to the current bin
that is created from the given BinSample.

It starts placing packages in `x:0, y:0, z:0` axises in the current bin and calculating remaining gap in the bin concerning
the direction of placement which is `y` axis. Once it completes placing in the first `column` in the `bin`, it continues 
placing _packages_ starting from the point right next the `first package` in the previous `column`. Once it gets to the point
where there is no more room for a new placement in 'x' axis, it creates a new layer in the bin and continues placing
packages starting from the axises of `x:0`, `y:0`, and `z: height of the first placed package in previous layer` and applies
the same _algorithm_ in the previous `layer`. Once it reaches to the point where there is no more room for `new layer` in 
the `currentBin`, it creates a `new bin` and applies exact same approach with the `previous bin`. It keeps doing this until
there no more `package` to be placed of the current `PackageSample`. Once there is no more `amount` to be placed for the _current_
_sample_, it starts placing the smaller package sample and applies exact same approach with the previous sample but before
start placing next sample, since we must go backwards, it reverses the bin order in bins array.

### Known Issues of the Approach and Concerns

- Since there is no rotation functionality in placement approach, you will be losing spaces where you can fit more
packages by rotating them accordingly.
- Before placing packages, FFD sorts the packages from largest to smallest, which means previous package will be
either larger that current one or same size with the current one. When starting a new column in a layer, if the package
you will place your current package next to is larger than current package and you already placed some of packages with
same size of your current package, then it will create a gap between two columns in the break point. 
- Similar to having gap between columns, there is also gap created in between layers due to exact same problem, which 
is the chance to place your package onto a larger package and there are packages in the same column in the lower layer
which are smaller than the package your are placing your current package onto.

### Roadmap

- To get the information about samples from user input.
- To turn functions into pure functions and immutable for implementing Functional Programming approach.
- Instead of having them in nested `if`s, to put the functionality of checking room in the bin in separate small and pure
functions to make the code even more clean.
- To rotate packages before start sorting and placing samples. Since the order of the the placement is y > x > z, and there
is the fact that we should position the packages as similar as possible to each other in terms of size of the sides, we should
be rotating packages according to the placement order. Mapping the axises is as follow: y:depth -> x:width -> z:height.
