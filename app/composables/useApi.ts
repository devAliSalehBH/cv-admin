export const useApi = () => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public.apiBaseURL;

  const sendRequest = async (
    url: string,
    payload: any = {},
    method: any = "GET",
    body: any = null
  ) => {
    const token = useCookie("token").value;
    const { $i18n } = useNuxtApp();
    const locale = $i18n.locale.value;
    const query = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => !!value)
    );

    try {
      const response = await $fetch(url, {
        baseURL: baseURL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ...query,
          locale: locale,
        },
        method,
        body: method == "POST" ? body.formData : undefined,
      });

      return response || {};
    } catch (error: any) {
      const err = error?.response?._data;
      console.error(error);

      if (err?.code === 401) {
        // delete Auth Data
        const authToken = useCookie("token");
        authToken.value = null;
        refreshCookie("token");
        const authProfile = useCookie("profile");
        authProfile.value = null;
        refreshCookie("profile");
      }

      return err;
    }
  };

  const get = (url: string, payload: any = {}) => sendRequest(url, payload);

  const post = (url: string, payload: any = {}, body: any = {}) =>
    sendRequest(url, payload, "POST", body);

  const del = (url: string, payload: any = {}) =>
    sendRequest(url, payload, "DELETE");

  const downloadFile = async (url: string, fileName: string) => {
    const token = useCookie("token").value;
    try {
      const response = await fetch(`${baseURL}${url}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error downloading file");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      a.click();
      a.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  };

  return {
    get,
    post,
    delete: del,
    downloadFile,
  };
};
