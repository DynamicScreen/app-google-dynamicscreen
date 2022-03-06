import {
  ISlideContext,
  SlideModule,
  VueInstance,
  IAssetsStorageAbility,
  IPublicSlide
} from "dynamicscreen-sdk-js"

export default class Doc extends SlideModule {
  async onReady() {
    await this.context.assetsStorage().then(async (ability: IAssetsStorageAbility) => {
        if (this.context.slide.data.type === 'media') {
          await ability.downloadAndGet(this.context.slide.data.media.url);
        }
      });

      return true
  };

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideContext) {
    const { h, ref, reactive, computed } = vue;
    const slide = reactive(this.context.slide) as IPublicSlide;
    const type = ref(slide.data.type);
    const imageUrl = ref(slide.data.media?.url)
    const iframeUrl = computed(() => {
      return slide.data.url + accessToken.value
    })

    const accessToken = computed(() => {
      if (slide.data.use_share_account) {
        // return share acces token ?
      } else {
        return slide.data.access_token;
      }
    })

    this.context.onPrepare(async () => {
      type.value === 'media' && await this.context.assetsStorage().then(async (ability: IAssetsStorageAbility) => {
        imageUrl.value = ability.getDisplayableAsset(this.context.slide.data.media.url).then((asset) => asset.displayableUrl());
      });
    });

    return () => [
      h('div', {}, [
        type.value === 'url' && h('iframe', {
          src: iframeUrl
        }, []),
        type.value === 'media' && h('div', {
          style: { backgroundImage: 'url(\'' + imageUrl + '\')' }
        })
      ])
      ]
  }
}
