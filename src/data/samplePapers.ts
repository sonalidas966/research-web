export interface SamplePaperData {
  title: string;
  authors: string;
  year: string;
  abstract: string;
  pageCount: number;
  text: string;
}

export const SAMPLE_PAPERS: SamplePaperData[] = [
  {
    title: 'Attention Is All You Need: Self-Attention Mechanisms in Sequence Modeling',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones',
    year: '2017',
    pageCount: 11,
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
    text: `[Page 1]
Attention Is All You Need: Self-Attention Mechanisms in Sequence Modeling
Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin
Google Brain and Google Research

Abstract
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less training time. On the WMT 2014 English-to-German translation task, our model achieves 28.4 BLEU, improving over the existing best results by over 2 BLEU.

[Page 2]
1 Introduction
Recurrent neural networks, long short-term memory (LSTM) and gated recurrent neural networks (GRUs) have been established as state-of-the-art approaches in sequence modeling. Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time generates a sequence of hidden states h_t, as a function of the previous hidden state h_{t-1} and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples.

[Page 3]
2 Background
The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU, ByteNet and ConvS2S, all of which use convolutional neural networks as basic building blocks. In these models, the number of operations required to relate signals from two arbitrary input or output positions grows in the distance between positions, linearly for ConvS2S and logarithmically for ByteNet. This makes it more difficult to learn dependencies between distant positions. In the Transformer this is reduced to a constant number of operations O(1).
Self-attention, sometimes called intra-attention, is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence.

[Page 4]
3 Model Architecture
Most competitive neural sequence transduction models have an encoder-decoder structure. The encoder maps an input sequence of symbol representations (x_1, ..., x_n) to a sequence of continuous representations z = (z_1, ..., z_n). Given z, the decoder then generates an output sequence (y_1, ..., y_m) of symbols one element at a time. At each step the model is auto-regressive, consuming the previously generated symbols as additional input when generating the next.
The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder.
The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers: a multi-head self-attention mechanism, and a simple, position-wise fully connected feed-forward network. We employ a residual connection around each of the two sub-layers, followed by layer normalization.

[Page 5]
3.2 Attention
An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.
Scaled Dot-Product Attention:
Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V
We compute the attention function on a set of queries simultaneously, packed together into a matrix Q. The keys and values are also packed into matrices K and V. We divide by sqrt(d_k) to counteract the vanishing gradients of the dot product in high dimensions.

[Page 6]
3.3 Multi-Head Attention
Instead of performing a single attention function with d_model-dimensional queries, keys and values, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections to d_k, d_k and d_v dimensions, respectively. On each of these projected versions of queries, keys and values we then perform the attention function in parallel, yielding d_v-dimensional output values. These are concatenated and once again projected, resulting in the final values. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.

[Page 7]
4 Why Self-Attention
In this section we compare various aspects of self-attention layers to recurrent and convolutional layers commonly used for mapping one variable-length sequence of symbol representations to another.
One is the total computational complexity per layer. Another is the amount of computation that can be parallelized, as measured by the minimum number of sequential operations required.
The third is the path length between long-range dependencies in the network. Learning long-range dependencies is a key challenge in many sequence transduction tasks. One key factor affecting the ability to learn such dependencies is the length of the paths forward and backward signals have to traverse in the network.

[Page 8]
5 Training
We trained on the standard WMT 2014 English-German dataset consisting of about 4.5 million sentence pairs. For English-French, we used the significantly larger WMT 2014 English-French dataset consisting of 36 million sentences.
We used the Adam optimizer with beta_1 = 0.9, beta_2 = 0.98 and epsilon = 10^-9. We varied the learning rate over the course of training according to the formula: lrate = d_model^(-0.5) * min(step_num^(-0.5), step_num * warmup_steps^(-1.5)). We used warmup_steps = 4000.
Regularization: We apply dropout to the output of each sub-layer before it is added to the sub-layer input and normalized. In addition, we apply dropout to the sums of the embeddings and the positional encodings in both the encoder and decoder stacks.

[Page 9]
6 Results
Machine Translation: On the WMT 2014 English-to-German translation task, the big transformer model (Transformer (big)) outperforms the best previously reported models (including ensembles) by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4. The training took 3.5 days on 8 P100 GPUs. Even our base model surpasses all previously published models and ensembles, at a fraction of the training cost.
On the WMT 2014 English-to-French translation task, our big model achieves a BLEU score of 41.0, outperforming all of the previously published single models, at less than 1/4 the training cost of the previous state-of-the-art model.

[Page 10]
7 Limitations and Discussion
While the Transformer exhibits substantial computational advantages and strong empirical translation results, several key limitations must be noted:
1. Computational and Memory Complexity with Sequence Length: The memory and computational complexity of full self-attention scales quadratically O(n^2) with sequence length n. For very long sequences (e.g. document-level translation or long-context reasoning beyond a few thousand tokens), naive self-attention becomes computationally prohibitive.
2. Positional Information: Because the architecture contains no recurrence and no convolution, the model does not possess an inherent inductive bias for sequence order. Order information must be injected entirely via additive sinusoidal positional encodings, which may struggle to extrapolate beyond the maximum sequence length observed during training.
3. Lack of Inductive Bias for Local Context: Unlike CNNs which enforce translation invariance and local neighborhood priors, self-attention treats all token pairs equally initially, requiring substantial training data to learn local structural relationships.

[Page 11]
8 Conclusion
In this work, we presented the Transformer, the first sequence transduction model based entirely on attention, replacing the recurrent layers most commonly used in encoder-decoder architectures with multi-headed self-attention.
For translation tasks, the Transformer can be trained significantly faster than architectures based on recurrent or convolutional layers. On both WMT 2014 English-to-German and WMT 2014 English-to-French translation tasks, we achieved a new state of the art.
We are excited about the future of attention-based models and plan to apply them to other tasks, including generation of non-textual data like images, audio, and video.`,
  },
  {
    title: 'Deep Residual Learning for Large-Scale Visual Recognition',
    authors: 'Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun',
    year: '2016',
    pageCount: 12,
    abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth.',
    text: `[Page 1]
Deep Residual Learning for Image Recognition
Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun
Microsoft Research

Abstract
Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet dataset we evaluate residual nets with a depth of up to 152 layers—8x deeper than VGG nets but still having lower complexity. An ensemble of these residual nets achieves 3.57% error on the ImageNet test set. This result won the 1st place on the ILSVRC 2015 classification task.

[Page 2]
1 Introduction
Deep convolutional neural networks have led to a series of breakthroughs for image classification. When deeper networks are able to start converging, a degradation problem has been exposed: with the network depth increasing, accuracy gets saturated and then degrades rapidly. Unexpectedly, such degradation is not caused by overfitting, and adding more layers to a suitably deep model leads to higher training error.
The degradation (of training accuracy) indicates that not all systems are similarly easy to optimize. Consider a shallower architecture and its deeper counterpart that adds more layers onto it. There exists a solution by construction to the deeper model: the added layers are identity mapping, and the other layers are copied from the learned shallower model. The existence of this constructed solution indicates that a deeper model should produce no higher training error than its shallower counterpart.

[Page 3]
2 Related Work
Residual Representations: In image processing, residual representations have been effectively utilized in VLAD and Fisher Vectors. In multigrid methods, subproblems are reformulated as residual equations.
Shortcut Connections: Practices and theories that lead to shortcut connections have been studied for a long time. Highway networks present shortcut connections with gating functions. These gates are data-dependent and have parameters, whereas our identity shortcuts are parameter-free and never closed.

[Page 4]
3 Deep Residual Learning
Residual Learning: Let us consider H(x) as an underlying mapping to be fit by a few stacked layers, with x denoting the inputs to the first of these layers. If one hypothesizes that multiple nonlinear layers can asymptotically approximate complicated functions, it is equivalent to hypothesize that they can asymptotically approximate the residual functions, i.e., F(x) := H(x) - x. So the original mapping is recast into F(x) + x.
Although both forms should be able to asymptotically approximate the desired functions, the ease of learning may be different. If an identity mapping were optimal, it would be easier to push the residual to zero than to fit an identity mapping by a stack of nonlinear layers.
Identity Mapping by Shortcuts: We adopt residual learning to every few stacked layers. A building block is defined as:
y = F(x, {W_i}) + x
Here x and y are the input and output vectors of the layers considered. The function F(x, {W_i}) represents the residual mapping to be learned.

[Page 5]
4 Network Architectures
We have tested various plain/residual networks.
Plain Network: Our plain baselines are mainly inspired by the philosophy of VGG nets. The convolutional layers mostly have 3x3 filters and follow two simple design rules: (i) for the same output feature map size, the layers have the same number of filters; and (ii) if the feature map size is halved, the number of filters is doubled so as to preserve the time complexity per layer.
Residual Network: Based on the above plain network, we insert shortcut connections which turn the network into its counterpart residual version. The identity shortcuts can be directly used when the input and output are of the same dimensions. When dimensions increase, we consider two options: (A) The shortcut still performs identity mapping, with extra zero entries padded for increasing dimensions; or (B) The projection shortcut is used to match dimensions using 1x1 convolutions.

[Page 6]
5 Experiments on ImageNet
We evaluate our method on the 1000-class ImageNet 2012 classification dataset.
Plain Networks: We first evaluate 18-layer and 34-layer plain nets. The 34-layer plain net has higher training error than the 18-layer plain net throughout the whole training procedure, even though the solution space of the 18-layer plain network is a subspace of that of the 34-layer one.
ResNets: On the 18-layer and 34-layer ResNets, the degradation problem is effectively addressed: the 34-layer ResNet achieves a 2.8% lower top-1 error than the 18-layer ResNet. Even more remarkably, the 34-layer ResNet exhibits much faster convergence in the early training stage.
Deeper Bottleneck Architectures: ResNet-50, ResNet-101, and ResNet-152 utilize bottleneck designs with 1x1, 3x3, and 1x1 convolutions to maintain low computational cost while reaching up to 152 layers. ResNet-152 achieves a single-model top-5 validation error of 4.49%.

[Page 7]
6 Limitations and Open Research Questions
Although deep residual networks resolve the vanishing gradient and optimization degradation problems, several notable limitations persist:
1. Feature Redundancy and Diminishing Returns: Empirical investigations reveal that many layers in very deep ResNets contribute only marginally to the final representation, suggesting that fixed identity shortcuts may lead to feature redundancy.
2. Inference Latency: While parameter count is manageable due to bottleneck designs, sequential depth still dictates inference latency, making deployment on ultra-low-power edge devices challenging.
3. Theoretical Understanding of Generalization: The exact mathematical mechanism behind why residual formulations smooth the optimization landscape remains partially empirical rather than comprehensively proven analytically.`,
  },
  {
    title: 'CRISPR-Cas9 Gene Editing: Fidelity, Off-Target Mechanics, and High-Fidelity Engineered Variants',
    authors: 'Jennifer A. Doudna, Emmanuelle Charpentier, Feng Zhang',
    year: '2020',
    pageCount: 14,
    abstract: 'Clustered Regularly Interspaced Short Palindromic Repeats (CRISPR) and the RNA-guided endonuclease Cas9 have revolutionized targeted genome editing in eukaryotic systems. While Cas9 enables precise double-strand breaks guided by a 20-nucleotide single guide RNA (sgRNA), non-specific cleavage at off-target genomic loci poses severe safety hurdles for clinical therapeutics. This review examines Cas9 cleavage kinetics, structural conformational states, strategies for engineering high-fidelity variants (eSpCas9, SpCas9-HF1, and HypaCas9), and emerging delivery vectors.',
    text: `[Page 1]
CRISPR-Cas9 Gene Editing: Fidelity, Off-Target Mechanics, and High-Fidelity Engineered Variants
Review of Molecular Therapeutics and Genome Engineering

Abstract
The microbial adaptive immune system CRISPR-Cas9 has been repurposed into a versatile platform for targeted genome editing across model organisms and human therapeutic contexts. The system comprises a single guide RNA (sgRNA) that directs the Streptococcus pyogenes Cas9 (SpCas9) endonuclease to cleave complementary 20-nucleotide target sites flanked by a 5'-NGG-3' protospacer adjacent motif (PAM). Despite exquisite specificity under native conditions, wild-type SpCas9 tolerates nucleotide mismatches between sgRNA and target DNA, inducing off-target double-strand breaks (DSBs) that risk oncogenic translocations, chromosomal rearrangements, and unintended genotoxicity. In this review, we examine the molecular thermodynamics of Cas9 cleavage, quantify the risks of off-target edits, and evaluate engineered high-fidelity variants.

[Page 2]
1 Structural Mechanics of Cas9-Mediated Cleavage
SpCas9 is a multi-domain endonuclease featuring two primary structural lobes: the recognition (REC) lobe and the catalytic nuclease (NUC) lobe. The NUC lobe contains the HNH and RuvC endonuclease domains, which respectively cleave the target strand (complementary to sgRNA) and non-target strand. Target interrogation begins with PAM recognition via the PAM-interacting domain. Upon encountering an NGG PAM, Cas9 initiates local DNA unwinding and directional R-loop propagation proceeding 3' to 5' from the seed region (nucleotides 1-10 proximal to the PAM).
Extensive biochemical profiling demonstrates that mismatches within the seed region destabilize R-loop formation and strongly inhibit cleavage, whereas mismatches in the distal non-seed region (nucleotides 11-20) are tolerated at substantially higher rates, fostering off-target cleavage.

[Page 3]
2 Off-Target Cleavage Quantification and Detection
Comprehensive genome-wide off-target profiling methodologies—such as GUIDE-seq, CIRCLE-seq, and Digenome-seq—reveal that wild-type SpCas9 can cleave genomic loci possessing up to 4 or 5 nucleotide mismatches relative to the on-target guide sequence. In clinical applications, persistent DSBs at off-target sites trigger non-homologous end joining (NHEJ), introducing random insertions and deletions (indels) that can disrupt tumor suppressor genes or produce large chromosomal structural variants.
Furthermore, prolonged intracellular exposure to Cas9 (e.g., via constitutive plasmid or viral vector expression) exacerbates off-target accumulation over time compared to transient ribonucleoprotein (RNP) electroporation.

[Page 4]
3 Engineering High-Fidelity Cas9 Variants
To mitigate off-target cleavage without crippling on-target catalytic velocity, several structural and rational protein design strategies have emerged:
1. Neutralization of Non-Specific DNA Contacts (eSpCas9): By mutating positively charged residues in the non-target strand groove (K848A, K1003A, R1060A), Slaymaker et al. weakened non-specific electrostatic interactions with the negatively charged DNA backbone, requiring complete sgRNA-target hybridization to drive catalytic conformation.
2. Disruption of Target Strand Contacts (SpCas9-HF1): Kleinstiver et al. targeted residues making contact with the target DNA strand (N497A, R661A, Q695A, Q926A), demonstrating genome-wide reduction of off-target cuts to undetectable levels via GUIDE-seq.
3. Proofreading Hyper-Accurate Variants (HypaCas9): Chen et al. targeted the REC3 domain, which acts as an allosteric sensor regulating HNH conformational activation, preventing activation if distal mismatches are detected.

[Page 5]
4 Limitations and Therapeutic Translational Barriers
Despite remarkable progress, translation to clinical in vivo applications faces severe bottlenecks:
1. On-Target Activity Trade-Offs: Several high-fidelity variants exhibit reduced on-target cleavage activity at challenging genomic loci with unfavorable chromatin accessibility or atypical GC-content.
2. In Vivo Delivery Vectors: Adeno-associated virus (AAV) packaging constraints (~4.7 kb) struggle to accommodate large Cas9 orthologs alongside regulatory elements, necessitating split-Cas9 or compact orthologs (e.g., SaCas9, Cas12a).
3. Immunogenicity: Pre-existing humoral and cell-mediated immunity against SpCas9 and SaCas9 exists in a significant portion of the human population, posing immunological clearance risks during systemic administration.`,
  },
];
