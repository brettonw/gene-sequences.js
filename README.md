# gene-sequences.js
Analysis and visualization of HIV gene sequences

# Data Sets
Representing three different individuals from a very famous study on HIV sequence evolution:

The original paper by Shankarappa can be found at https://www.ncbi.nlm.nih.gov/pmc/articles/PMC113104/

It has been cited by close to 1000 other research papers on viral evolution particularly HIV.

Each text file is sequence data from a different individual, where there are multiple sequences per subject time point. The naming system is the patient number, then c or p (cells/plasma), then the month of sampling, then the clone. So P7c80 1075 means patient 7 sequence from cells 80 months post seroconversion clone #1075.

There are multiple sequences per subject time point.  The quasispecies (cloud of related viruses) inside a person gets more diverse with time.  Though very late in infection the most fit virus is thought to outgrow the rest of the viruses so you may get a decrease in viral diversity.

This is one line of research using HIV sequence data – the other is when you have one sequence per person and lots of different people.

Sequence data is all A, C, T & G….(and sometimes Y, really there are others if there are mixtures):

|IUPAC nucleotide code|Base|
|---|---|
|A| Adenine|
|C| Cytosine|
|G| Guanine|
|T (or U)|Thymine (or Uracil)|
|R| A or G|
|Y| C or T|
|S| G or C|
|W|A or T|
|K|G or T|
|M|A or C|
|B|C or G or T|
|D|A or G or T|
|H|A or C or T|
|V|A or C or G|
|N|any base|
|. or -|gap|

