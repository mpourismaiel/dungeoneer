<script>
  import produce from 'immer';
  import { data, classes, schools, spells, spellCastingTimes } from '../store';
  import { capitalize } from '../utils/string';
  import { toggle } from '../utils/array';

  let mySpells = [];
  let filterSchool = [];
  let filterLevel = [];
  let filterCastingTimes = [];
  let filterClass = [];
  let activeSpell;

  let editingSpellSlot;
  let slotsRemaining;
  let slotsTotal;

  let maxSpellLevel = 0;
  let filterMySpells = true;
  let filterPreparedSpells = true;
  let query = '';
  let filteredSpells;
  let spellSlots;

  const updateMySpells = spell =>
    data.update(data =>
      produce(data, draft => {
        if (mySpells.some(data => data.name === spell.name)) {
          draft = data.filter(
            data => !(data.type === 'spell' && data.name === spell.name)
          );
          return draft;
        } else {
          draft.push(spell);
        }
      })
    );

  const updatePreparedSpells = spell =>
    data.update(data =>
      produce(data, draft => {
        spell = draft.find(
          data => data.type === 'spell' && data.name === spell.name
        );
        spell.meta.prepared = !spell.meta.prepared;
      })
    );

  const toggleActiveSpell = spell => () => {
    const key = `spell-level-${spell.value}-${spell.name}`;

    if (activeSpell === key) {
      activeSpell = null;
      return;
    }

    activeSpell = key;
  };

  const editSpellSlot = spellSlot => () => {
    if (editingSpellSlot === spellSlot.level) {
      editingSpellSlot = null;
    }

    editingSpellSlot = spellSlot.level;
    slotsRemaining = spellSlot.slot.meta.slotsRemaining;
    slotsTotal = spellSlot.slot.meta.slotsTotal;
  };

  const updateSpellSlot = () => {
    data.update(data =>
      produce(data, draft => {
        const spellSlot = draft.find(
          data => data.type === 'spell level' && data.value === editingSpellSlot
        );
        if (spellSlot.value > 0) {
          spellSlot.meta.slotsRemaining = slotsRemaining;
        }
        spellSlot.meta.slotsTotal = slotsTotal;
        return draft;
      })
    );
    editingSpellSlot = null;
  };

  $: mySpells = $data.filter(data => data.type === 'spell');

  $: spellSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    .filter(
      spellLevel =>
        filterLevel.length === 0 || filterLevel.indexOf(spellLevel) > -1
    )
    .map(level => ({
      level,
      slot: $data.find(
        data => data.type === 'spell level' && data.value === level
      ),
    }));

  $: filteredSpells = Object.keys($spells).reduce((tmp, spellLevel) => {
    tmp[spellLevel] = $spells[spellLevel].filter(
      spell =>
        (filterSchool.length === 0 ||
          filterSchool.indexOf(spell.meta.school) > -1) &&
        (filterCastingTimes.length === 0 ||
          filterCastingTimes.indexOf(spell.meta.casting_time) > -1) &&
        (filterClass.length === 0 ||
          filterClass.some(
            spellClass => spell.meta.classes.indexOf(spellClass) > -1
          )) &&
        (!filterMySpells || mySpells.some(data => data.name === spell.name)) &&
        (!filterPreparedSpells ||
          mySpells.some(
            data =>
              data.name === spell.name &&
              (data.value === 0 || data.meta.prepared)
          )) &&
        spell.name.indexOf(query) > -1
    );
    return tmp;
  }, {});

  $: maxSpellLevel = mySpells.reduce(
    (maxSpellLevel, spell) =>
      spell.value > maxSpellLevel ? spell.value : maxSpellLevel,
    0
  );
</script>

<style>
  .active {
    background-color: #ccc;
  }

  .disabled h4 {
    color: #aaa;
  }

  .disabled li {
    color: #ccc;
  }

  form {
    margin: 20px 0 10px;
  }

  .filters {
    margin-top: 20px;
  }

  .filters-type button {
    border-radius: 0;
    border-right: none;
  }

  .filters-type button:focus {
    border-color: #bbb;
  }

  .filters-type button:first-child {
    border-radius: 5px 0 0 5px;
    border-left: 1px solid #ccc;
  }

  .filters-type button:last-child {
    border-radius: 0 5px 5px 0;
    border-right: 1px solid #ccc;
  }

  .spells {
    list-style: none;
    padding: 0;
  }

  .spells li button {
    font-size: 12px;
  }

  .spell-slot-info {
    font-size: 14px;
    color: #666;
  }

  .spells label {
    display: inline-block;
  }

  .spells .info {
    cursor: pointer;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    font-size: 12px;
    border: 1px solid #bbb;
    color: #bbb;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .spell-info {
    margin-bottom: 10px;
    margin-left: 18px;
  }
</style>

<svelte:options immutable />
<div class="filters">
  <div class="filters-type">
    <input
      type="text"
      bind:value={query}
      placeholder="Search for spells/cantrips..." />
  </div>
  <div class="filters-type">
    <button
      class:active={filterMySpells}
      on:click|preventDefault={() => (filterMySpells = !filterMySpells)}>
      My Spells
    </button>

    <button
      class:active={filterPreparedSpells}
      on:click|preventDefault={() => (filterPreparedSpells = !filterPreparedSpells)}>
      Prepared Spells
    </button>
  </div>

  <div class="filters-type">
    {#each $classes as spellClass}
      <button
        class:active={filterClass.indexOf(spellClass) > -1}
        on:click|preventDefault={() => (filterClass = toggle(filterClass, spellClass))}>
        {capitalize(spellClass)}
      </button>
    {/each}
  </div>

  <div class="filters-type">
    {#each $schools as school}
      <button
        class:active={filterSchool.indexOf(school) > -1}
        on:click|preventDefault={() => (filterSchool = toggle(filterSchool, school))}>
        {school}
      </button>
    {/each}
  </div>

  <div class="filters-type">
    {#each $spellCastingTimes as spellCastingTime}
      <button
        class:active={filterCastingTimes.indexOf(spellCastingTime) > -1}
        on:click|preventDefault={() => (filterCastingTimes = toggle(filterCastingTimes, spellCastingTime))}>
        {spellCastingTime}
      </button>
    {/each}
  </div>

  <div class="filters-type">
    {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as spellLevel}
      <button
        class:active={filterLevel.indexOf(spellLevel) > -1}
        on:click|preventDefault={() => (filterLevel = toggle(filterLevel, spellLevel))}>
        {#if spellLevel === 0}Cantrips{:else}{`Level ${spellLevel}`}{/if}
      </button>
    {/each}
  </div>
</div>

{#if filterMySpells && mySpells.length === 0}
  <p class="empty">No spells were found</p>
{:else}
  {#each spellSlots.filter(spellSlot => spellSlot.level <= (filterMySpells ? maxSpellLevel : 10)) as spellSlot (`spellslot-${spellSlot.level}`)}
    <div
      class:disabled={spellSlot.slot.meta.slotsTotal === 0 || spellSlot.slot.meta.slotsRemaining === 0}>
      <h4 on:click={editSpellSlot(spellSlot)}>
        {#if spellSlot.level === 0}
          Cantrips
        {:else}{`Level ${spellSlot.level}`}{/if}
        <span class="spell-slot-info">
          (
          <b class="known">
            {#if spellSlot.level !== 0}
              {`${spellSlot.slot.meta.slotsRemaining} /`}
            {/if}
            {spellSlot.slot.meta.slotsTotal}
          </b>
          )
        </span>
      </h4>
      {#if editingSpellSlot === spellSlot.level}
        <form on:submit|preventDefault={updateSpellSlot}>
          {#if spellSlot.level !== 0}
            <div>
              <label for="total-slots">Total slots:</label>
              <input type="number" id="total-slots" bind:value={slotsTotal} />
            </div>
          {/if}
          <div>
            <label for="remaining-slots">Remaining slots:</label>
            <input
              type="number"
              id="remaining-slots"
              bind:value={slotsRemaining} />
          </div>
          <button>Update</button>
        </form>
      {/if}
      <ul class="spells">
        {#each filteredSpells[spellSlot.level] as spell (spell.name)}
          <li>
            <div>
              {#if filterMySpells && spellSlot.level > 0}
                <input
                  type="checkbox"
                  id={`spell-level-${spellSlot.level}-${spell.name}`}
                  checked={$data.some(data => data.name === spell.name && data.meta.prepared)}
                  on:change={updatePreparedSpells(spell)} />
              {/if}
              <label for={`spell-level-${spellSlot.level}-${spell.name}`}>
                {capitalize(spell.name)}
              </label>
              {#if mySpells.some(data => data.name === spell.name)}
                <button
                  title="Are you sure?"
                  on:click|stopPropagation={updateMySpells(spell)}>
                  Forget
                </button>
              {:else if spellSlot.slot.meta.slotsTotal > 0}
                <button on:click|stopPropagation={updateMySpells(spell)}>
                  Learn
                </button>
              {/if}
              <span
                class="info"
                on:click|stopPropagation={toggleActiveSpell(spell)}>
                i
              </span>
            </div>
            {#if activeSpell === `spell-level-${spellSlot.level}-${spell.name}`}
              <div class="spell-info">
                <div>
                  <b>{`Description: `}</b>
                  <p>
                    {@html spell.description.join('<br>')}
                  </p>
                </div>
                {#each Object.keys(spell.meta) as field (`spell-${spell.value}-info-${spell.name}-field-${field}`)}
                  <div>
                    <b>{`${capitalize(field.replace(/_/g, ' '))}: `}</b>
                    {#if Array.isArray(spell.meta[field])}
                      <span>
                        {spell.meta[field].join(field === 'higher_level' ? '\n' : ', ')}
                      </span>
                    {:else}
                      <span>{spell.meta[field]}</span>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {/each}
{/if}
