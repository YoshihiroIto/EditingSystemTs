<template>
    <div>
        <input type="number"
               :value="value"
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
    value: {type:Number, default: 0},
  },
  components: {
  },
  setup(props: Props, context: SetupContext) {

    console.log(props);

    const sliderMouseDown = () => context.emit("begin-continuous-editing");
    const sliderMouseUp = () => context.emit("end-continuous-editing");

    return {
        sliderMouseDown,
        sliderMouseUp
    };
  }
});
</script>
