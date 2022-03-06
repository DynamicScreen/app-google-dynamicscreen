import {
  ISlideOptionsContext,
  SlideOptionsModule,
  VueInstance,
} from "dynamicscreen-sdk-js"
import { usePage } from "@inertiajs/inertia-vue3";

export default class SheetOptions extends SlideOptionsModule {
  async onReady() {
    return true;
  };

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideOptionsContext) {
    //@ts-ignore
    const { h, ref, reactive, toRef, watch, computed } = vue;
    const { update, components } = context;
    //@ts-ignore
    const { Field, GoogleDrivePicker, Toggle, TextInput, SegmentedRadio, Select, FieldsRow } = components;

    const account = toRef(props.modelValue, 'account');
    const type = toRef(props.modelValue, 'type') || ref('media');
    const h_align = toRef(props.modelValue, 'type') || ref('CENTER');

    const h_align_options = [
      { id: "CENTER", name: this.t('modules.sheet.options.alignement.centered') },
      { id: "LEFT", name: this.t('modules.sheet.options.alignement.left') },
      { id: "RIGHT", name: this.t('modules.sheet.options.alignement.right') }
    ];

    const v_align_options = [
      { id: "CENTER", name: this.t('modules.sheet.options.alignement.centered') },
      { id: "BOTTOM", name: this.t('modules.sheet.options.alignement.bottom') },
      { id: "TOP", name: this.t('modules.sheet.options.alignement.top') }
    ];

    
    const use_share_account = toRef(props.modelValue, 'use_share_account') || ref(false);
    const remoteFiles = toRef(props.modelValue, 'remoteFiles') || ref([]);

    const url_help = computed(() => {
      return use_share_account.value
        ? this.t('modules.sheet.options.url.must_be_shared_with')
        : this.t('modules.sheet.options.url.must_be_accessible_with')
    });

    console.log('account: ', account.value)

    this.context.getAccountData?.("google-driver", null, {
      onChange: (accountId: number | undefined) => {
        console.log('account changed')
        if (accountId) account.value = accountId
      }
    });

    return () => [
      h(SegmentedRadio, {
        label: this.t('modules.sheet.options.type.label'),
        ...update.option("type"),
        default: "media",
        options: [
          {
            value: "media",
            icon: "fab fa-google-drive",
            label: this.t('modules.sheet.options.type.media_help'),
            text: this.t('modules.sheet.options.type.media'),
          },
          {
            value: "url",
            icon: "fa fa-link",
            label: this.t('modules.sheet.options.type.url_help'),
            text: this.t('modules.sheet.options.type.url'),
          }
        ]
      }),
      type.value === 'media' && h('div', {}, [
        h(Field, {
          label: this.t('modules.sheet.options.media.label')
         }, [
          //@ts-ignore
          h(GoogleDrivePicker, {
            type: 'g-sheet',
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
          label: this.t('modules.sheet.options.url.label'),
          help: url_help.value,
        }, [
          //@ts-ignore
          h(TextInput, {
            placeholder: "https://",
            ...update.option('url')
          })
        ]),
        use_share_account.value && h('div', {}, [
          h('p', { class: "text-sm" }, () => this.t('modules.sheet.options.url.must_be_shared_with')),
          h('a', {
            class: "text-xs text-primary-500",
            target: '_blank',
            href: this.t('modules.sheet.options.share_link_doc_url')
          }, () => this.t('modules.sheet.options.share_link_doc_label'))
        ]),
        !use_share_account.value && h('div', {}, [
          h('p', { class: "text-sm" }, () => this.t('modules.sheet.options.url.must_be_accessible_with')),
        ]),
        h(Toggle, { class: 'mt-6', ...update.option("use_share_account") }, () => this.t('modules.sheet.options.use_share_account'))
      ]),
      h(FieldsRow, { class: 'py-2' }, [
        h(Toggle, { class: 'flex-1', ...update.option("grid_lines") }, () => this.t('modules.sheet.options.show_grid_lines')),
        h(Toggle, { class: 'flex-1', ...update.option("sheetnames") }, () => this.t('modules.sheet.options.show_sheetname')),
      ]),
      h(Field, { label: this.t("modules.sheet.options.orientation.label") }, [
        h(Select, {
          default: {id: "true", name: this.t('modules.sheet.options.orientation.portrait') },
          options: [
            { id: "true", name: this.t('modules.sheet.options.orientation.portrait') },
            { id: "false", name: this.t('modules.sheet.options.orientation.landscape') }
          ],
          ...update.option('portrait')
        }),
      ]),
      h(FieldsRow, { }, [
        h(Field, { class: 'flex-1', label: this.t("modules.sheet.options.alignement.h_align") }, [
          h(Select, {
            default: "CENTER",
            options: h_align_options,
            ...update.option('h_align')
          }),
        ]),
        h(Field, { class: 'flex-1', label: this.t("modules.sheet.options.alignement.v_align") }, [
          h(Select, {
            default: { id: "CENTER", name: this.t('modules.sheet.options.alignement.centered') },
            options: v_align_options,
            ...update.option('v_align')
          }),
        ])
      ]),

    ]
  }
}
