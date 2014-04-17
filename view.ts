module MOA {
    export class ViewBase {
        public $element: JQuery;
        $window: JQuery;

        public width: number;
        public height: number;

        windowTop: number;
        windowHeight: number;

        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;

        constructor(selector: any) {
            this.$element = $(selector);
            this.$window = $(window);

            this.paddingTop = parseInt(this.$element.css('padding-top'), 10);
            this.paddingBottom = parseInt(this.$element.css('padding-bottom'), 10);
            this.paddingLeft = parseInt(this.$element.css('padding-left'), 10);
            this.paddingRight = parseInt(this.$element.css('padding-right'), 10);

            this.windowTop = this.$element.offset().top;
            this.width = this.$element.width();

            this.baseCalculateSize();
        }

        public baseCalculateSize() {
            this.windowHeight = this.$window.height();
            this.windowTop = this.$element.offset().top;

            this.baseSetHeight(this.windowHeight - this.windowTop);
        }

        public baseResize(onlyHeight = false) {
            if (!onlyHeight)
                this.$element.width(this.width);

            this.$element.height(this.height);
        }

        public baseSetHeight(height: number) {
            this.height = height - this.paddingTop - this.paddingBottom;
        }

        public baseSetWidth(width: number) {
            this.width = width - this.paddingLeft - this.paddingRight;
        }

        public static runWithoutOverflow(func: () => any) {
            var body = $("body");
            var bodyOverflow = body.css("overflow-x");
            body.css('overflow', 'hidden');

            return func();

            body.css('overflow-x', bodyOverflow);
        }
    }

    export class ScrollableView extends ViewBase {
        constructor(selector: any, automaticResize = true) {
            super(selector);

            this.$element.addClass("scrollable-view");

            this.calculateSize();

            if (automaticResize) {
                $(window).resize(() => {
                    this.calculateSize();
                });
            }
        }

        public calculateSize() {
            ViewBase.runWithoutOverflow(() => {
                this.baseSetWidth(this.$window.width());
                this.baseCalculateSize();
                this.resize();
            });
        }

        public resize() {
            if (this.width == 0)
                this.$element.addClass("scrollable-view-hidden");
            else
                this.$element.removeClass("scrollable-view-hidden");

            this.baseResize();
        }
    }

    export class ResizableView extends ViewBase {
        scrollable: ScrollableView;
        public left: number;

        constructor(view: JQuery) {
            super(view);

            this.$element.addClass("resizable-view");
            this.scrollable = new MOA.ScrollableView(this.$element.children().first(), false);
        }

        public calculateSize() {
            this.baseCalculateSize();
            this.scrollable.baseCalculateSize();
        }

        public resize() {
            this.$element.css({ left: this.left });
            this.baseResize();
            this.scrollable.resize();
        }

        public setWidth(width: number) {
            if (width < 15)
                width = 0;

            this.baseSetWidth(width);
            this.scrollable.baseSetWidth(width);
        }
    }

    export class SplitView extends ViewBase {
        trad: ResizableView;
        main: ResizableView;
        initialTradWidth: number;
        previousTradWidth: number;

        constructor(selector: string, tradWidth: number) {
            super(selector);
            this.$element.addClass("split-view");

            this.initialTradWidth = tradWidth;
            this.trad = new ResizableView(this.$element.children().first());
            this.main = new ResizableView(this.$element.children().last());

            this.calculateChildrenSize(tradWidth);
        }

        public updateSize(width: number) {
            this.baseSetWidth(width);
            this.baseCalculateSize();
        }

        public calculateChildrenSize(tradWidth?: number) {
            if (!_.isUndefined(tradWidth)) {
                this.trad.setWidth(tradWidth);
                this.previousTradWidth = tradWidth;
            }

            this.main.setWidth(this.width - this.trad.width);
            this.main.left = this.trad.width;

            this.trad.calculateSize();
            this.main.calculateSize();
        }

        public resize() {
            this.baseResize();

            this.trad.resize();
            this.main.resize();
        }

        public toggle() {
            if (this.trad.width > 0) {
                var newWidth = this.trad.width;

                this.calculateChildrenSize(0);
                this.previousTradWidth = newWidth;
            }
            else {
                if (this.previousTradWidth == 0)
                    this.previousTradWidth = this.initialTradWidth;

                this.calculateChildrenSize(this.previousTradWidth);
                this.previousTradWidth = 0;
            }

            this.resize();
        }
    }

    export class ResizableGridView extends ViewBase {
        constructor(public grid: MOA.Mall.MallBas) {
            super(grid.slickGridContainerElementSelector);

            $(window).resize(
                <any>_.debounce(() => {
                    this.calculateSize();
                }, 100)
            );

            this.grid.onErrorMessageShow.subscribe((e, args) => {
                this.calculateSize();
            });

            this.grid.onErrorMessageHide.subscribe((e, args) => {
                this.calculateSize();
            });

            this.calculateSize();
        }

        public calculateSize() {
            ViewBase.runWithoutOverflow(() => {
                this.baseCalculateSize();
                this.resize();
            });
            
        }

        public resize() {
            this.baseResize(true);
            this.grid.resize();
        }
    }
} 