<script>
  import { Router, Link, Route } from 'svelte-routing';
  import { produce } from 'immer';

  import Home from './pages/Home.svelte';
  import Skills from './pages/Skills.svelte';
  import SpellsList from './pages/Spells.svelte';
  import { data } from './store';

  export let url = '';

  let isEditingProficiency = false;
  let editingProficiency;
  let isEditingHealth = false;
  let editingHealth;

  let health;
  let spellSlots;

  const updateProficiency = () => {
    data.update(data =>
      produce(data, draft => {
        const proficiency = draft.find(data => data.type === 'proficiency');
        proficiency.value = editingProficiency.value;
      })
    );

    editingProficiency = null;
    isEditingProficiency = false;
  };

  const updateHealth = () => {
    data.update(data =>
      produce(data, draft => {
        const health = draft.find(data => data.type === 'health');

        health.value = editingHealth.value;
        health.meta.current = editingHealth.meta.current;
        health.meta.tmp = editingHealth.meta.tmp;
      })
    );

    editingHealth = null;
    isEditingHealth = false;
  };

  $: health = $data.find(data => data.type === 'health');
  $: proficiency = $data.find(data => data.type === 'proficiency');
</script>

<Router {url}>
  <header>
    <div>
      <div
        class="health"
        title={`Max HP: ${health.value} + Temporary: ${health.meta.tmp}`}
        on:click={() => {
          editingHealth = health;
          isEditingHealth = true;
        }}>
        {`HP: ${health.meta.current}/${health.value + health.meta.tmp}`}
      </div>
      <div
        class="proficiency"
        on:click={() => {
          editingProficiency = proficiency;
          isEditingProficiency = true;
        }}>
        {`Proficiency: ${proficiency.value}`}
      </div>
    </div>
    <nav>
      <Link to="/">Home</Link>
      <Link to="/skills">Skills</Link>
      <Link to="/spells">Spells</Link>
    </nav>
  </header>

  {#if isEditingHealth}
    <form on:submit|preventDefault={updateHealth}>
      <div>
        <label for="max-hp">Maximum HP</label>
        <input type="number" id="max-hp" bind:value={editingHealth.value} />
      </div>
      <div>
        <label for="current-hp">Current HP</label>
        <input
          type="number"
          id="current-hp"
          bind:value={editingHealth.meta.current} />
      </div>
      <div>
        <label for="tmp-hp">Tmp HP</label>
        <input type="number" id="tmp-hp" bind:value={editingHealth.meta.tmp} />
      </div>
      <button>Update</button>
    </form>
  {/if}

  {#if isEditingProficiency}
    <form on:submit|preventDefault={updateProficiency}>
      <div>
        <label for="proficiency">Proficiency</label>
        <input
          type="number"
          id="proficiency"
          bind:value={editingProficiency.value} />
      </div>
      <button>Update</button>
    </form>
  {/if}

  <Route path="/" component={Home} />
  <Route path="/skills" component={Skills} />
  <Route path="/spells" component={SpellsList} />
</Router>
