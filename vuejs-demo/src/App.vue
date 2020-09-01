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

    <br/>
    <br/>

    <NumberEditor @begin-continuous-editing="onBeginContinuousEditing"
                  @end-continuous-editing="onEndContinuousEditing"
                  :value.sync="testModel.valueA" />
    {{testModel.valueA}}
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import { TestModel } from './models/TestModel';
import { History } from '../../lib/src/History';
import hotkeys from 'hotkeys-js';

import NumberEditor from './components/NumberEditor.vue';

export default defineComponent({
  name: "App",
  components: {
    NumberEditor,
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

    const onBeginContinuousEditing = () => _history.beginBatch();
    const onEndContinuousEditing = () => _history.endBatch();

    // https://qiita.com/SotaSuzuki/items/1e060f0db0c61ec4f9d5
    const keyMaps = [
      {
        sequence: 'ctrl+z',
        handler: () => _history.undo()
      },
      {
        sequence: 'ctrl+y',
        handler: () => _history.redo()
      },
    ];

    const sequences = keyMaps.map(keyMap => keyMap.sequence)
    
    hotkeys(sequences.join(','), (keyboard, hotkey) => {
      const keyMap = keyMaps.find(({ sequence }) => sequence === hotkey.key);
      if (!keyMap){
       return;
      }

      //console.log("hotkey");

      keyMap.handler();
    });

    return {
      history,
      testModel,
      valueA,

      undo,
      redo,
      inc,
      dec,

      onBeginContinuousEditing,
      onEndContinuousEditing
    };
  }
});
</script>