// Type definitions for science 2.0.0.

export type Vector = ArrayLike<number>;
export type Matrix = ArrayLike<ArrayLike<number>>;
export type DistanceFunction = (a: Vector, b: Vector) => number;
export type KernelFunction = (u: number) => number;
export type BandwidthFunction = (sample: number[]) => number;
export type RandomSource = () => number;

/** The version of science, such as "2.0.0". */
export const version: string;
/** The Euler–Mascheroni constant, γ ≈ 0.5772156649015329. */
export const EULER_GAMMA: number;

export interface Complex {
  re: number;
  im: number;
}
/** Returns the real roots of a x² + b x + c = 0 in ascending order. */
export function quadratic(a: number, b: number, c: number, options?: {complex?: false}): number[];
/** Returns all roots of a x² + b x + c = 0, in ascending order of their imaginary parts. */
export function quadratic(a: number, b: number, c: number, options: {complex: true}): Complex[];
export function quadratic(a: number, b: number, c: number, options?: {complex?: boolean}): number[] | Complex[];

// Linear algebra.

export function dot(a: Vector, b: Vector): number;
export function cross(a: Vector, b: Vector): [number, number, number];
export function norm(a: Vector): number;
export function normalize(a: Vector): number[];
export function transpose(a: Matrix): number[][];
export function multiply(a: Matrix, b: Vector): number[];
export function multiply(a: Matrix, b: Matrix): number[][];
export function determinant(a: Matrix): number;
export function inverse(a: Matrix): number[][];
export function solve(a: Matrix, b: Vector): number[];
export function solve(a: Matrix, b: Matrix): number[][];
export function solveTridiagonal(lower: Vector, diagonal: Vector, upper: Vector, rhs: Vector): number[];

export interface Eigendecomposition {
  /** The real parts of the eigenvalues. */
  values: number[];
  /** The imaginary parts of the eigenvalues. */
  imaginary: number[];
  /**
   * A matrix whose columns are the eigenvectors, each of unit length; for a
   * complex pair, the two columns holding its real and imaginary parts have
   * unit length together.
   */
  vectors: number[][];
}
export function eigen(a: Matrix): Eigendecomposition;

// Summary statistics.

export function mean(values: Vector): number;
export function median(values: Vector): number;
export function quantile(values: Vector, p: number): number;
export function quantiles(values: Vector, probabilities: ArrayLike<number>): number[];
export function iqr(values: Vector): number;
export function variance(values: Vector): number;
export function standardDeviation(values: Vector): number;
export function modes<T>(values: ArrayLike<T>): T[];

// Distributions.

export function erf(x: number): number;
export function erfc(x: number): number;

export interface NormalDistribution {
  readonly mean: number;
  readonly sd: number;
  pdf(x: number): number;
  cdf(x: number): number;
  quantile(p: number): number;
  sample(random?: RandomSource): number;
}
export function normal(options?: {mean?: number; sd?: number}): NormalDistribution;

// Distances.

export const distances: {
  readonly euclidean: DistanceFunction;
  readonly manhattan: DistanceFunction;
  readonly chebyshev: DistanceFunction;
  readonly minkowski: (p: number) => DistanceFunction;
  readonly hamming: (a: ArrayLike<unknown>, b: ArrayLike<unknown>) => number;
  readonly jaccard: (a: ArrayLike<unknown>, b: ArrayLike<unknown>) => number;
  readonly braycurtis: DistanceFunction;
};

// Kernel density estimation.

export const kernels: {
  readonly uniform: KernelFunction;
  readonly triangular: KernelFunction;
  readonly epanechnikov: KernelFunction;
  readonly quartic: KernelFunction;
  readonly triweight: KernelFunction;
  readonly gaussian: KernelFunction;
  readonly cosine: KernelFunction;
};

export const bandwidths: {
  readonly nrd0: (x: Vector) => number;
  readonly nrd: (x: Vector) => number;
};

export interface Density {
  (x: number): number;
  /** The bandwidth used. */
  readonly bandwidth: number;
}
export function kde(sample: Vector, options?: {kernel?: KernelFunction; bandwidth?: number | BandwidthFunction}): Density;

// Clustering.

export interface KMeansResult {
  /** The index of the cluster of each vector. */
  assignments: number[];
  /** The mean of the vectors in each cluster. */
  centroids: number[][];
  /** The number of iterations performed. */
  iterations: number;
}
export function kmeans(vectors: Matrix, options: {
  k: number;
  distance?: DistanceFunction;
  maxIterations?: number;
  random?: RandomSource;
}): KMeansResult;

export interface ClusterNode {
  /** The merged child clusters, or null for a leaf. */
  left: ClusterNode | null;
  right: ClusterNode | null;
  /** The linkage distance between the children, or 0 for a leaf. */
  height: number;
  /** The number of vectors in the cluster. */
  size: number;
  /** The height of the node above the leaves, in merges. */
  depth: number;
  /** For a leaf, the index of its vector; merged clusters are numbered from n in merge order. */
  index: number;
  /** The mean of the vectors in the cluster, or null unless every value is a finite number. */
  centroid: number[] | null;
}
/**
 * Clusters vectors of any values that the distance function accepts, such as
 * booleans with distances.jaccard. The distance function must be symmetric.
 */
export function hcluster<T = number>(vectors: ArrayLike<ArrayLike<T>>, options?: {
  linkage?: "single" | "complete" | "average";
  distance?: (a: ArrayLike<T>, b: ArrayLike<T>) => number;
}): ClusterNode;

// Smoothing.

export function loess(x: Vector, y: Vector, options?: {
  bandwidth?: number;
  robustnessIterations?: number;
  accuracy?: number;
  weights?: Vector | null;
}): number[];
