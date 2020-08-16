'use strict';

function randomId(length) {
  return randomString(length);
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

const symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
function randomString(length) {
  const str = [];
  for (let i = 0; i < length; i++) {
    str.push(symbols.charAt(randomInt(0, symbols.length)));
  }
  return str.join('');
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    swap(arr, i, randomInt(0, i));
  }
}

function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

module.exports = {
  randomId,
  randomInt,
  shuffle
}
