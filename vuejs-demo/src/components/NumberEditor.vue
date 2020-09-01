<template>
    <div>
        <input type="number"
               :value="value"
               @mousedown="textMouseDown"
               @mouseup="textMouseUp"
               @keydown="textKeyDown"
               @keyup="textKeyUp"
               @input="$emit('update:value', parseInt($event.target.value))"
         />

        <input type="range"
               min="0"
               max="1000"
               step="1"
               :value="value"
               @mousedown="sliderMouseDown"
               @mouseup="sliderMouseUp"
               @input="$emit('update:value', parseInt($event.target.value))"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api';

type Props = {
  value: number;
}

export default defineComponent({
  props: {
    value: {type: Number, default: 0},
  },
  setup(props: Props, context: SetupContext) {

    const emitBeginContinuousEditing = () => context.emit("begin-continuous-editing");
    const emitEndContinuousEditing = () => context.emit("end-continuous-editing");

    const sliderMouseDown = emitBeginContinuousEditing;
    const sliderMouseUp   = emitEndContinuousEditing;
    const textMouseDown   = emitBeginContinuousEditing;
    const textMouseUp     = emitEndContinuousEditing;

    const textKeyDown = (e:KeyboardEvent) => {
      if (e.repeat == false) {
        if (e.key == "ArrowUp" || e.key == "ArrowDown") {
          emitBeginContinuousEditing();
        }
      }
    };

    const textKeyUp = (e:KeyboardEvent) => {
      if (e.key == "ArrowUp" || e.key == "ArrowDown") {
        emitEndContinuousEditing();
      }
    };

    return {
        sliderMouseDown,
        sliderMouseUp,
        //
        textMouseDown,
        textMouseUp,
        textKeyDown,
        textKeyUp,
    };
  }
});
</script>
