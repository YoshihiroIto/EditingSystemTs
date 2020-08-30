<template>
  <div id="app">
    {{testModel.valueA}}
    <br/>
    (undo:{{history.undoRedoCount[0]}}, redo:{{history.undoRedoCount[1]}})
    <br/>

    <button @click="undo">undo</button>
    <button @click="redo">redo</button>

    <button @click="inc">inc</button>
    <button @click="dec">dec</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import { TestModel } from './models/TestModel';
import { History } from '../../lib/src/History';

export default defineComponent({
  name: "App",
  components: {
  },
  setup() {
    const _history = new History();
    const _testModel = new TestModel(_history);

    const history = ref(_history);
    const testModel = ref(_testModel);
    const valueA = ref(_testModel.valueA);

    const undo = () => _history.undo();
    const redo = () => _history.redo();
    const inc = () => ++ _testModel.valueA;
    const dec = () => -- _testModel.valueA;

    return {
      history,
      testModel,
      valueA,

      undo,
      redo,
      inc,
      dec
    };
  }
});
</script>