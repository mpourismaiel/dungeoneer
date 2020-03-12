export const getSchools = spells => [
  ...new Set(spells.map(spell => spell.meta.school)),
];

export const getSpellsByLevel = spells =>
  spells.reduce((tmp, spell) => {
    if (!tmp[spell.value]) {
      tmp[spell.value] = [];
    }

    tmp[spell.value].push(spell);
    return tmp;
  }, {});

export const getSpellCastingTime = spells => [
  ...new Set(spells.map(spell => spell.meta.casting_time)),
];
