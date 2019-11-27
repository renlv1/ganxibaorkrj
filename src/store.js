import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    buttonStatus: Boolean,
    inputOpen: false,
    device: Number,
    collectionStatus: Boolean,
    detailObj: {}
  },
  getters: {},
  actions: {},
  mutations: {
    SET_BUTTON_STATUS(state, data) {
      state.buttonStatus = data
    },
    SET_INPUT_OPEN(state, data) {
      state.inputOpen = data
    },
    SET_DEVICE(state, data) {
      state.device = data
    },
    SET_COLLECTION_STATUS(state, data) {
      state.collectionStatus = data
    },
    SET_DETAILS(state, data) {
      state.detailObj = data
    }
  }
})
