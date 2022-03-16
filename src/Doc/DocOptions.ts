import {
  ISlideOptionsContext,
  SlideOptionsModule,
  VueInstance,
} from "dynamicscreen-sdk-js"
import { usePage } from "@inertiajs/inertia-vue3";

export default class DocOptions extends SlideOptionsModule {
  async onReady() {
    return true;
  };

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideOptionsContext) {
    //@ts-ignore
    const { h, ref, reactive, toRef, watch, computed } = vue;
    const { update, components } = context;
    //@ts-ignore
    const { Field, GoogleDrivePicker, Toggle, TextInput, SegmentedRadio } = components;

    const account = toRef(props.modelValue, 'account');
    const type = toRef(props.modelValue, 'type') || ref('media');
    const use_share_account = toRef(props.modelValue, 'use_share_account') || ref(false);
    const remoteFiles = toRef(props.modelValue, 'remoteFiles') || ref([]);
    const url_help = computed(() => {
      return use_share_account.value
        ? this.t('modules.doc.options.url.must_be_shared_with')
        : this.t('modules.doc.options.url.must_be_accessible_with')
    });

    const formatRemoteFiles = {
      get: (val) => Array.isArray(val) && val.length ? val[0] : val,
      set: (val) => !Array.isArray(val) ? [val] : val,
    }

    this.context.getAccountData?.("google-driver", null, {
      onChange: (accountId: number | undefined) => {
        if (accountId) account.value = accountId
      }
    });

    return () => [
      h(SegmentedRadio, {
        label: this.t('modules.doc.options.type.label'),
        ...update.option("type"),
        default: "media",
        options: [
          {
            value: "media",
            icon: "fab fa-google-drive",
            label: this.t('modules.doc.options.type.media_help'),
            text: this.t('modules.doc.options.type.media'),
          },
          {
            value: "url",
            icon: "fa fa-link",
            label: this.t('modules.doc.options.type.url_help'),
            text: this.t('modules.doc.options.type.url'),
          }
        ]
      }),
      type.value === 'media' && h('div', {}, [
        h(Field, {
          label: this.t('modules.doc.options.media.label')
         }, [
          //@ts-ignore
          h(GoogleDrivePicker, {
            type: 'g-doc',
            noAccountsSelect: true,
            account_id: account.value as Number,
            multiple: true,
            "modelValue:account_id": account.value,
            //@ts-ignore
            ...update.option('remoteFiles', formatRemoteFiles)
          })
        ]),
      ]),
      type.value === 'url' && h('div', {}, [
        h(Field, { 
          label: this.t('modules.doc.options.url.label'),
          help: url_help.value,
        }, [
          //@ts-ignore
          h(TextInput, {
            placeholder: "https://",
            ...update.option('url')
          })
        ]),
        use_share_account.value && h('div', {}, [
          h('p', { class: "text-sm" }, () => this.t('modules.doc.options.url.must_be_shared_with')),
          h('a', {
            class: "text-xs text-primary-500",
            target: '_blank',
            href: this.t('modules.doc.options.share_link_doc_url')
          }, () => this.t('modules.doc.options.share_link_doc_label'))
        ]),
        !use_share_account.value && h('div', {}, [
          h('p', { class: "text-sm" }, () => this.t('modules.doc.options.url.must_be_accessible_with')),
        ]),
        h(Toggle, { class: 'flex-1 py-6', ...update.option("use_share_account") }, () => this.t('modules.doc.options.use_share_account'))
      ])
    ]
  }
}
