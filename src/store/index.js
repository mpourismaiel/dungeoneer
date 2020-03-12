import { readable, writable } from 'svelte/store';

import { characterInitialData, spellbook } from './data';
import {
  getSchools,
  getSpellsByLevel,
  getSpellCastingTime,
  getClasses,
} from '../utils/spells';

const characterDataKey = 'dungeoneer__character_data';
const createData = () => {
  const characterData = localStorage.getItem(characterDataKey);

  let data;
  try {
    data = characterData
      ? JSON.parse(characterData)
      : characterInitialData.map((data, i) => ({
          id: `${data.type}_${i}`,
          ...data,
        }));
  } catch (err) {
    alert(
      'Data stored in your localStorage is not valid JSON. Please check it out.'
    );
    console.error(err);
    data = characterInitialData.map((data, i) => ({
      id: `${data.type}_${i}`,
      ...data,
    }));
  }

  const store = writable(data);
  const { subscribe, set, update } = store;

  store.subscribe(data => {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(characterDataKey, jsonData);
  });

  return {
    subscribe,
    update,
    set,
  };
};

export const spells = readable(getSpellsByLevel(spellbook));
export const spellCastingTimes = readable(getSpellCastingTime(spellbook));
export const schools = readable(getSchools(spellbook));
export const classes = readable(getClasses(spellbook));
export const data = createData();
