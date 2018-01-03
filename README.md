# HIV Gene Sequences
[Analysis and visualization of HIV gene sequences](https://brettonw.github.io/gene-sequences.js/).

# Data Set
A [JSON-format data set](https://brettonw.github.io/gene-sequences.js/subjects.json) that represents the C2-V5 region of the *env* gene from HIV-1 samples taken from three different individuals (source: [Shankarappa](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC113104/)).

There are multiple sequences per subject time point (measured as months post sero-conversion), reflecting the quasispecies (cloud of related viruses) inside the patient. The quasispecies gets more diverse with time, though the most fit virus is thought to outgrow the rest of the viruses so you may get a decrease in viral diversity late in the infection.

Sequence data is:

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


# See Also
[Genome Browser](https://www.hiv.lanl.gov/content/index)
