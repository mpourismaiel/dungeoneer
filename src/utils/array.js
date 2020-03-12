export const toggle = (arr, item) =>
  arr.indexOf(item) === -1
    ? [...arr, item]
    : arr.filter(arrItem => arrItem !== item);
