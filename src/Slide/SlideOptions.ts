import {
  ISlideOptionsContext,
  SlideOptionsModule,
  VueInstance,
} from "dynamicscreen-sdk-js"
import { usePage } from "@inertiajs/inertia-vue3";

export default class SlideOptions extends SlideOptionsModule {
  async onReady() {
    return true;
  };

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideOptionsContext) {
    //@ts-ignore
    const { h, ref, reactive, toRef, watch } = vue;
    const { update, components } = context;
    //@ts-ignore
    const { Field, GoogleDrivePicker, Toggle, TextInput, SegmentedRadio } = components;

    const account = toRef(props.modelValue, 'account');
    const type = toRef(props.modelValue, 'type') || ref('media');
    const use_share_account = toRef(props.modelValue, 'use_share_account');
    watch(use_share_account.value, (val) => {
      console.log('share acc changed', val)
    })
    context.setOption('use_share_account', false)
    // const use_share_account = toRef(props.modelValue, 'use_share_account') || (() => {
    //   context.setOption('use_share_account', false)
    //   return ref(false)
    // })();


    const remoteFiles = toRef(props.modelValue, 'remoteFiles') || ref([]);
    
    context.getAccountData?.("google-driver", null, {
      onChange: (accountId: number | undefined) => {
        if (accountId) account.value = accountId
      }
    });

    return () => [
      h(SegmentedRadio, {
        label: this.t('modules.slide.options.type.label'),
        ...update.option("type"),
        default: "media",
        options: [
          {
            value: "media",
            icon: "fab fa-google-drive",
            label: this.t('modules.slide.options.type.media_help'),
            text: this.t('modules.slide.options.type.media'),
          },
          {
            value: "url",
            icon: "fa fa-link",
            label: this.t('modules.slide.options.type.url_help'),
            text: this.t('modules.slide.options.type.url'),
          }
        ]
      }),
      type.value === 'media' && h('div', {}, [
        h(Field, {
          label: this.t('modules.slide.options.media.label')
         }, [
          //@ts-ignore
          h(GoogleDrivePicker, {
            type: 'g-slide',
            noAccountsSelect: true,
            account_id: account.value as Number,
            multiple: true,
            "modelValue:account_id": account.value,
            ...update.option('remoteFiles')
          })
        ]),
      ]),
      type.value === 'url' && h('div', {}, [
        h(Field, { 
          label: this.t('modules.slide.options.url.label'),
          help: this.t('modules.slide.options.url.help'),
        }, [
          //@ts-ignore
          h(TextInput, {
            placeholder: "https://",
            ...update.option('url')
          })
        ]),
        use_share_account.value && h('div', {}, [
          h('p', { class: "text-sm" }, () => this.t('modules.slide.options.url.must_be_shared_with')),
          h('a', {
            class: "text-xs text-primary-500",
            target: '_blank',
            href: this.t('modules.slide.options.share_link_doc_url')
          }, () => this.t('modules.slide.options.share_link_doc_label'))
        ]),
        !use_share_account.value && h('div', {}, [
          h('p', { class: "text-sm" }, () => this.t('modules.slide.options.url.must_be_accessible_with')),
        ]),
        h(Toggle, { class: 'flex-1 py-6', ...update.option("use_share_account") }, () => this.t('modules.slide.options.use_share_account'))
      ])
    ]
  }
}
