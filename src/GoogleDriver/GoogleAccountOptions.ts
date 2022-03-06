import {
  ISlideContext, ISlideOptionsContext,
  SlideOptionsModule, VueInstance,
} from "dynamicscreen-sdk-js";

export default class GoogleAccountOptions extends SlideOptionsModule {
  async onReady() {
    return true;
  };

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideOptionsContext) {
    //@ts-ignore
    const { h, ref, reactive, watch, toRef, computed } = vue;
    //@ts-ignore
    const { Field, FieldsRow, TextInput, Button, Avatar } = this.context.components;

    const isAuthConfirmed = ref(false); 
    const userInfo = ref<any>(null);
    const testConnection = () => {
      this.context.getAccountData?.('google-driver', 'test-auth', {})
        .value?.then((data: any) => {
          isAuthConfirmed.value = true;
          console.log('account data successfully fetched', data)
        }).catch((err) => {
          console.log('error while fetching account data: ', err)
          isAuthConfirmed.value = false;
          userInfo.value = null;
        });
    }

    const getUserInfo = () => {
      this.context.getAccountData?.('google-driver', 'me', {})
        .value?.then((data: any) => {
          userInfo.value = data;
          console.log('account data successfully fetched', data)
        }).catch((err) => {
          console.log('error while fetching account data: ', err)
          userInfo.value = null;
          isAuthConfirmed.value = false;
        });
    }

    getUserInfo();

    return () =>
      h("div", {}, [
        userInfo.value && h('div', {}, [
          h(Field, { label: this.t("modules.google_driver.options.connected_as") }, [
            h('div', {class: "flex items-center text-left mb-4"}, [
              h(Avatar, {
                image: userInfo.value.picture,
                circular: true,
                label: userInfo.value.name,
                size: "xl"
              }),
              h('div', {class: "flex-1 ml-3 font-medium" }, [
                h('p', { }, userInfo.value.name),
                h('p', { class: "font-normal text-sm" }, userInfo.value.email),
              ]),
            ]),
          ]),
          h(Field, { class: 'flex-1', label: this.t("modules.google_driver.options.test_connection") }, [
            h(Button, { class: 'action', onClick: testConnection }, this.t('modules.google_driver.options.test'))
          ]),
          isAuthConfirmed && h('p', { class: "text-green-500" }, this.t('modules.google_driver.options.connected')),
          !isAuthConfirmed && h('p', { class: "text-red-500" }, this.t('modules.google_driver.options.not_connected')),
        ]),
        !userInfo.value && h('div', {}, [
          h(Field, { class: 'flex-1', label: this.t("modules.google_driver.options.unable_to_connect") }, [
            h(Button, { class: 'action', onClick: testConnection }, this.t('modules.google_driver.options.connect_with_google'))
          ]),
        ])
      ])
  }
}
