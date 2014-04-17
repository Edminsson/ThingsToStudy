module MOA {
    export interface SplitterOptions {
        initialTradWidth: number;
        maxTradWidth: number;
        minDocumentWidth: number;
    }

    export class Splitter {
        container: SplitView;
        isDragging = false;
        minDocumentWidth: number;
        $body: JQuery;

        constructor(selector: string, options: SplitterOptions) {
            this.$body = $("body");
            this.minDocumentWidth = options.minDocumentWidth;
            this.container = new SplitView(selector, options.initialTradWidth);

            this.container.trad.$element.resizable({
                autoHide: false,
                handles: 'e',
                maxWidth: options.maxTradWidth,
                ghost: false,
                resize: (e, ui: JQueryUI.ResizableUIParams) => {
                    this.container.calculateChildrenSize(ui.element.width());
                    this.container.resize();
                },
                create: (e, ui: JQueryUI.ResizableUIParams) => {
                    this.refresh();

                    $(".ui-resizable-handle").dblclick(() => {
                        this.container.toggle();
                        $(window).trigger("OnResizeMall");
                    });
                },
                start: (e, ui) => {
                    this.isDragging = true;
                },
                stop: (e, ui) => {
                    this.isDragging = false;
                    this.container.calculateChildrenSize(ui.element.width());
                    this.container.resize();

                    $(window).trigger("OnResizeMall");
                }
            });

            $(window).resize(
                <any>_.debounce(() => {
                    if (!this.isDragging)
                        this.refresh();
                }, 100)
                );
        }

        public refresh() {
            ViewBase.runWithoutOverflow(() => {
                var width = $(window).width()

                if (width < this.minDocumentWidth)
                    width = this.minDocumentWidth;

                this.container.updateSize(width)
                this.container.calculateChildrenSize();
                this.container.resize();
            });
        }
    }
} 