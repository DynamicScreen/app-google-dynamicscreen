import {
  ISlideContext,
  SlideModule, VueInstance,
} from "dynamicscreen-sdk-js";

export default class GoogleAccountOptions extends SlideModule {
  constructor(context: ISlideContext) {
    super(context);
  }

  async onReady() {
    return true;
  };

  setup(props: Record<string, any>, vue: VueInstance, context: ISlideContext) {
    const { h } = vue;

    return () =>
      h("div")
  }
}
