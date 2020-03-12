export const capitalize = text =>
  text
    .split(' ')
    .map(split => split[0].toUpperCase() + split.slice(1))
    .join(' ');
