import {
  ISlideContext,
  SlideModule,
  VueInstance,
  IAssetsStorageAbility,
  IPublicSlide
} from "dynamicscreen-sdk-js"

// import * as PDFJSS from 'pdfjs-dist';
// import PDFJS from 'pdfjs-dist';
import url from "pdfjs-dist/build/pdf.worker";

const PDFJS = require('pdfjs-dist');
// PDFJS.GlobalWorkerOptions.workerSrc = 
//       "./../../node_modules/pdfjs-dist/build/pdf.worker.js";
export default class Doc extends SlideModule {
  protected pdf;

  async onReady() {
    console.log('on ready doc', PDFJS)
      try {
        console.log('url dist', url);
        PDFJS.GlobalWorkerOptions.workerSrc = 'app-google-dynamicscreen.slide.google-doc::0.1.0/./node_modules/dynamicscreen-sdk-js/dist/index.js?'
        // let loadingTask = PDFJS.getDocument(this.context.slide.data.url);
        // console.log(loadingTask)
        return true;
        // await loadingTask.promise.then((pdf) => {
        //   this.pdf = pdf;
        //   loadingTask.destroy()
        // }).catch(err => console.log('cannot ready doc slide', err));
        console.log('loadingTask complete')
      } catch (err) {
        console.log('cannot ready doc slide', err)
        return false;
      }
    console.log('IS ready doc')

      return true;

  };

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideContext) {
    //@ts-ignore

    const { h, ref, reactive, computed, watch } = vue;
    const slide = reactive(this.context.slide) as IPublicSlide;
    const imageUrl = ref(slide.data.media?.url)
    const googleDocUrl = ref(slide.data.url);

    let pdf = ref<any>(this.pdf);
    let canvasContainer = ref<any>(null);
    let canvasPdf = ref<any>(null);

    console.log(PDFJS, 's')


    this.context.onPrepare(async () => {
      console.log('on prepare doc')

      if (!pdf.value) initPdf();
        
      await initPdfPage();
    });


    const initPdf = async () => {
      console.log('START initpdf')
      let loadingTask = PDFJS.getDocument(this.context.slide.data.url);
      await loadingTask.promise.then((pdfDoc) => {
        console.log('pdf yo', pdfDoc)
        pdf.value = pdfDoc;
        loadingTask.destroy()
      }).catch(err => console.log('cannot ready doc slide', err));
    };

    watch(googleDocUrl.value, () => {
      initPdf();
    });


    const initPdfPage = () => {
        console.log('START init pdf page', this.pdf, pdf.value)

      pdf.getPage(slide.data.page).then((page) => {
        console.log('THEN init pdf page', page)

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
        console.log('ERROR init pdf page', err)
        // this.context.next()
      });
    };

    return () => [
      h('div', {
        class: "h-full w-full text-center items-center",
        ref: canvasContainer
      }, [
        h('canvas', { ref: canvasPdf }),
      ])
    ]
  }
}
