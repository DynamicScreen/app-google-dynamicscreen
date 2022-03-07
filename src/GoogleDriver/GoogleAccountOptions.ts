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
        .value?.then(() => {
          isAuthConfirmed.value = true;
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
        });
    }

    const testButtonText = computed(() => {
      return isAuthConfirmed.value
        ? this.t('modules.google-driver.options.connected')
        : this.t('modules.google-driver.options.test_connection')
    })
    const connect = () => {
      console.log('inertia call to connect')
      return false;
    }

    getUserInfo();

    return () =>
      h("div", {}, [
        userInfo.value && h('div', {}, [
          h(Field, { label: this.t("modules.google-driver.options.connected_as") }, [
            h('div', {class: "flex items-center text-left mb-4 mt-2"}, [
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
          h('div', {class: "text-center items-center mt-10 mb-2" }, [
            h(Button, {
              class: 'action',
              rightIcon: isAuthConfirmed.value ? 'far fa-check' : '',
              onClick: testConnection,
              theme: 'secondary',
              disabled: isAuthConfirmed.value,
              size: 'lg'
            }, testButtonText.value)
          ]),
        ]),
        !userInfo.value && h(Field, {
          class: 'flex-1',
          label: this.t("modules.google-driver.options.unable_to_connect")
        }, [
          h(Button, {
            class: 'action',
            onClick: connect,
            theme: 'soft-danger',
            size: 'lg'
          }, this.t('modules.google-driver.options.connect_with_google'))
        ]),
      ])
  }
}
