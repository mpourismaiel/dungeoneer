<script>
  import produce from 'immer';
  import { data } from '../store';
  import { capitalize } from '../utils/string';

  let active = null;
  let skillModifier = null;
  let skillProficiency = null;

  const updateActiveSkill = () => {
    data.update(data =>
      produce(data, draft => {
        const skill = draft.find(data => data.id === active);
        skill.value = skillModifier;
      })
    );
    active = null;
  };

  const toggleProficiency = (proficiency, skill) => () => {
    data.update(data =>
      produce(data, draft => {
        const skill = draft.find(data => data.id === active);
        if (skill.meta.proficiency === proficiency) {
          skill.meta.proficiency = proficiency === 2 ? 1 : 0;
        } else {
          skill.meta.proficiency = proficiency;
        }

        const stat = draft.find(data => data.name === skill.meta.stat);
        skill.value =
          parseInt(stat.meta.modifier) +
          skill.meta.proficiency * stat.meta.modifier;
        return draft;
      })
    );
  };

  const closeEditor = () => (active = null);

  const setActive = skillId => {
    active = skillId;
    const skill = $data.find(stat => stat.id === active);
    skillModifier = skill.value;
  };
</script>

<style>
  ul {
    list-style: none;
    padding: 0;
  }
</style>

<ul>
  {#each $data.filter(data => data.type === 'stat' && data.name !== 'constitution') as stat (stat.id)}
    <h3>{stat.name[0].toUpperCase() + stat.name.slice(1)}</h3>
    <ul>
      {#each $data.filter(data => data.type === 'skill' && data.meta.stat === stat.name) as skill (skill.id)}
        <li title={skill.description} on:click={() => setActive(skill.id)}>
          <input
            type="checkbox"
            checked={skill.meta.proficiency === 2}
            on:change|stopPropagation|preventDefault={toggleProficiency(2, skill)} />
          <input
            type="checkbox"
            checked={skill.meta.proficiency >= 1}
            on:change|stopPropagation|preventDefault={toggleProficiency(1, skill)} />
          <b class="modifier">{skill.value}</b>
          <span class="name">{capitalize(skill.name)}</span>
        </li>
      {/each}
    </ul>
  {/each}
</ul>

{#if !!active}
  <form on:submit|preventDefault={updateActiveSkill}>
    <span on:click={closeEditor}>x</span>
    <div>
      <h4>{capitalize($data.find(data => data.id === active).name)}</h4>
    </div>
    <div>
      <label for="skill-modifier">Skill Modifier</label>
      <input id="skill-modifier" type="text" bind:value={skillModifier} />
    </div>
    <button>Update</button>
  </form>
{/if}
