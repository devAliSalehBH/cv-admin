import { defineStore } from "pinia";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    showAlert: false,
    alertData: {
      message: "",
      success: false,
    },
    authToken: null as string | null,
    profile: null as any,
  }),
  actions: {
    setAlertData(res: any = { message: "", success: false }) {
      this.alertData.message = res?.message;
      this.alertData.success = res?.success;
      this.showAlert = true;
      setTimeout(() => {
        this.showAlert = false;
      }, 4000);
    }
  },
});
