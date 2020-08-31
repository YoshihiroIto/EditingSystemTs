import Vue from 'vue'
import App from './App.vue'
import VueCompositionApi from "@vue/composition-api";
Vue.use(VueCompositionApi);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')


document.body.onkeydown = function(e:KeyboardEvent) {

  if (e.ctrlKey && e.key.toLowerCase() == "z" || 
      e.ctrlKey && e.key.toLowerCase() == "y"){
      e.preventDefault();
      return false;
    }

    return true;
}