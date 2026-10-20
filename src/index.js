export { version } from "./version.js";
export { EULER_GAMMA } from "./constants.js";
export { quadratic } from "./quadratic.js";

export { cross, dot, norm, normalize } from "./linalg/vector.js";
export { determinant, inverse, multiply, solve, transpose } from "./linalg/matrix.js";
export { solveTridiagonal } from "./linalg/tridiagonal.js";
export { eigen } from "./linalg/eigen.js";

export { iqr, mean, median, modes, quantile, quantiles, standardDeviation, variance } from "./stats/summary.js";
export { erf, erfc } from "./stats/erf.js";
export { normal } from "./stats/normal.js";
export { distances } from "./stats/distances.js";
export { kernels } from "./stats/kernels.js";
export { bandwidths } from "./stats/bandwidths.js";
export { kde } from "./stats/kde.js";
export { kmeans } from "./stats/kmeans.js";
export { hcluster } from "./stats/hcluster.js";
export { loess } from "./stats/loess.js";
