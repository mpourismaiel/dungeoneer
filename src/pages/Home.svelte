<script>
  import produce from 'immer';
  import { data } from '../store';
  import { capitalize } from '../utils/string';

  let active = null;
  let activeStatValue = null;
  let activeStatModifierValue = null;

  const updateActiveStat = () => {
    data.update(data =>
      produce(data, draft => {
        const stat = draft.find(data => data.id === active);
        stat.value = activeStatValue;
        stat.meta.modifier = activeStatModifierValue;

        const proficiency = draft.find(data => data.type === 'proficiency')
          .value;
        const skills = draft.filter(
          data => data.type === 'skill' && data.meta.stat === stat.name
        );

        skills.forEach(skill => {
          skill.value =
            parseInt(stat.meta.modifier) +
            skill.meta.proficiency * stat.meta.modifier;
        });
      })
    );
    active = null;
  };

  const closeEditor = () => (active = null);

  const setActive = statName => {
    active = statName;
    const stat = $data.find(stat => stat.id === active);
    activeStatValue = stat.value;
    activeStatModifierValue = stat.meta.modifier;
  };
</script>

<ul>
  {#each $data.filter(data => data.type === 'stat') as stat (stat.id)}
    <li title={stat.description.join('\n')} on:click={() => setActive(stat.id)}>
      {`${capitalize(stat.name)} - ${stat.value} - ${stat.meta.modifier > 0 ? '+' : ''}${stat.meta.modifier}`}
    </li>
  {/each}
</ul>

{#if !!active}
  <form on:submit|preventDefault={updateActiveStat}>
    <span on:click={closeEditor}>x</span>
    <div>
      <h4>{capitalize($data.find(data => data.id === active).name)}</h4>
    </div>
    <div>
      <label for="base-input">Base</label>
      <input id="base-input" type="text" bind:value={activeStatValue} />
    </div>
    <div>
      <label for="modifier-input">Modifier</label>
      <input
        id="modifier-input"
        type="text"
        bind:value={activeStatModifierValue} />
    </div>
    <button on:click={updateActiveStat}>Update</button>
  </form>
{/if}
