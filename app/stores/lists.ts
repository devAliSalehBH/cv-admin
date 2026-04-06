import { defineStore } from "pinia";

export const useListsStore = defineStore("lists", {
  state: () => ({
    // companies: [],

  }),
  actions: {
    // async fetchCompanies(payload: any) {
    //   const query = Object.fromEntries(
    //     Object.entries(payload).filter(([key, value]) => !!value),
    //   );
    //   await useApi().get("companies", query).then((res) => {
    //     this.companies = res.data;
    //   });
    // },

    create() { },
    edit() { },
  },
  getters: {},
});
