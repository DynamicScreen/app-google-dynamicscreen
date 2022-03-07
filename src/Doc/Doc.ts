import {
  ISlideContext,
  SlideModule,
  VueInstance,
  IAssetsStorageAbility,
  IPublicSlide
} from "dynamicscreen-sdk-js"

import { PDFJS } from 'pdfjs-dist/webpack';

export default class Doc extends SlideModule {
  protected initPdf;
  protected initPdfPage;

  async onReady() {
    console.log('on ready doc')
      this.context.slide.data.type === 'media' && await this.initPdf();

      return true;

  };

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideContext) {
    //@ts-ignore

    const { h, ref, reactive, computed, watch } = vue;
    const slide = reactive(this.context.slide) as IPublicSlide;
    const imageUrl = ref(slide.data.media?.url)
    const googleDocUrl = ref(slide.data.url);

    let pdf = ref<any>(null);
    let canvasContainer = ref<any>(null);
    let canvasPdf = ref<any>(null);


    this.context.onPrepare(async () => {
      console.log('on prepare doc')
      this.context.slide.data.type === 'media' && await this.initPdfPage();
    });


    this.initPdf = () => {
      PDFJS.getDocument(googleDocUrl.value).then((pdf) => {
          pdf.value = pdf;
          this.initPdfPage()
      })
    };

    watch(googleDocUrl.value, () => {
      this.initPdf();
    });


    this.initPdfPage = () => {
      pdf.value.getPage(slide.data.page).then((page) => {
        let canvas = canvasPdf.value
        let context = canvas.getContext('2d')
        let viewport = page.getViewport(1)
        let pdfHeight = viewport.height
        let pdfWidth = viewport.width
        let container = canvasContainer.value
        let scale = Math.min(container.offsetHeight/pdfHeight, container.offsetWidth/pdfWidth)
        let renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        viewport = page.getViewport(scale)
        canvas.height = viewport.height
        canvas.width = viewport.width
        page.render(renderContext);
      }).catch((err) => {
        // this.context.next()
      });
    };

    return () => [
      h('div', {
        class: "h-full w-full text-center items-center",
        ref: canvasContainer
      }, [
        h('canvas', { ref: canvasPdf }, () => []),
      ])
    ]
  }
}
