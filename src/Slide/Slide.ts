import {
  ISlideContext,
  SlideModule,
  VueInstance,
  IAssetsStorageAbility,
  IPublicSlide,
} from "dynamicscreen-sdk-js"

export default class Slide extends SlideModule {
  private nextSlideTimeout: NodeJS.Timeout | null = null;

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
        return slide.data.access_token;
      } else {
        return slide.data.access_token;
      }
    })

    this.context.onPrepare(async () => {
      type.value === 'media' && await this.context.assetsStorage().then(async (ability: IAssetsStorageAbility) => {
        imageUrl.value = ability.getDisplayableAsset(this.context.slide.data.media.url).then((asset) => asset.displayableUrl());
      });
    });

    this.context.onPlay(async () => {
      if (this.context.slide.data?.duration) {
        this.context.playbackManager.preventNextSlide(15);
        this.nextSlideTimeout = setTimeout(() => {
          this.context.playbackManager.next();
        }, this.context.slide.data?.duration);
      }
    });

    this.context.onReplay(async () => {
      this.nextSlideTimeout?.refresh();
    });

    this.context.onEnded(async () => {
      if (this.nextSlideTimeout) clearTimeout(this.nextSlideTimeout);
    });



    return () => [
      h('div', { class: "flex justify-center items-center w-full h-full" }, [
        type.value === 'url' && h('iframe', {
          class: "w-full h-full",
          src: iframeUrl.value
        }, []),
        type.value === 'media' && h('div', {
          class: "w-full h-full",
          style: { backgroundImage: 'url(\'' + imageUrl + '\')' }
        })
      ])
      ]
  }
}
