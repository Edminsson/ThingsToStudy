/// <reference path="arkivbas.ts" />

module MOA {
    export class SlidingTextarea {
        constructor(selector: any, lineHeight: number = 10, maxRows: number = 15) {            
            this.input = $(selector);
            this.lineHeight = lineHeight;
            this.maxRows = maxRows;
            this.calculateHeight();
            this.registerEvents();
        }

        private input: JQuery;
        private lineHeight: number;
        private maxRows: number;

        private registerEvents() {
            this.input.on("keyup", () => {                
                this.calculateHeight();
            });
        }

        private oldRows = 1;
        private calculateHeight() {            
            var oldHeight = this.input.height();

            this.input.height(this.lineHeight-1);
            var height = this.input[0].scrollHeight;
            this.input.height(oldHeight);

            var rows = Math.floor(height / this.lineHeight);
            if (rows == 0)
                rows = 1;
           
            this.setScrollbar(rows);
            this.setTextareaHeight(rows);
        }

        private setTextareaHeight(rows) {
            if (this.oldRows != rows) {
                if (this.maxRows < rows)
                    rows = this.maxRows;
                var newHeight;
                if (rows > 2) {
                    newHeight = this.lineHeight * rows + 2;
                }
                else {                    
                    newHeight = this.lineHeight * rows - 1;
                }

                this.input.animate({ height: newHeight}, 'fast');
                this.oldRows = rows;
            }
        }
                
        private setScrollbar(rows) {            
            this.input[0].style.overflow = (rows > this.maxRows ? 'visible' : 'hidden');
        }
    }
}