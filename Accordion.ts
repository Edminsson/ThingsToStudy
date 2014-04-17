
module MOA.UI {

    export class AccordionStorage{
        private storageName: string ;
        private contentPartIndexes: number[] = [];
        public allIsCollapsed: boolean = false;
        private numOfAccrodionsPart: number;

        constructor(storageName: string) {
            this.storageName = storageName + "_storage";
            var data = localStorage.getItem(this.storageName);
            if (!_.isEmpty(data)) {
                var indexes = JSON.parse(data);
                if (indexes)
                    this.contentPartIndexes = indexes;
            } else {
                localStorage.setItem(this.storageName, JSON.stringify([]));           
            }
           
        }

        public Add(index: number):void {
            this.contentPartIndexes.push(index);
            localStorage.setItem(this.storageName, JSON.stringify(this.contentPartIndexes));
        }

        public Remove(index: number): void{     
            var data = localStorage.getItem(this.storageName);
            var indexes = JSON.parse(data);      
            var filterd = _.filter(indexes, (item) => { return item != index; });
            localStorage.setItem(this.storageName, JSON.stringify(filterd));    

              
        }

        public RemoveAll() {
            localStorage.setItem(this.storageName, JSON.stringify([-1]));      
            this.allIsCollapsed = true;     
        }

        public EnableAll(numberOfAccrodionParts: number) {
            for (var i = 0; i < numberOfAccrodionParts; i++){
                this.contentPartIndexes.push(i);
            }
            localStorage.setItem(this.storageName, JSON.stringify(this.contentPartIndexes));           
        }

        public IsAllCollapsed() {
            var data = localStorage.getItem(this.storageName);
            var indexes = JSON.parse(data);  
            var isCollapsed = _.any(indexes, (item) => { return item == -1 });
            return isCollapsed;
        }

        public GetStoredIndexes() :number[]{
            var data = localStorage.getItem(this.storageName);
            return JSON.parse(data);
            
        }
    }

    export class Accordion {
        $headers: any;
        $accordionContainer: any;
        $headerClassName: any;
        $accordingToggler: any;        
        private defaultExpandedParts: number[];
        private isCollapsed: boolean;
        private static iconPlusClassName: string = "ui-icon-plus";
        private static iconMinusClassName: string = "ui-icon-minus";
        private openAllLabelText: string = "Öppna avdelningar";
        private closeAllLabelText: string = "Stäng avdelningar";    
        private numOfAccrodionParts: number;
        private accordionStorage: AccordionStorage;
         

        constructor(accordionSelector: string, headerClassName: string, accordingTogglerSelector?: string, defaultExpandedParts?: number[]) {
            this.$headerClassName = "." + headerClassName;
            this.$accordionContainer = $(document.getElementById(accordionSelector));
            this.$accordingToggler = $(document.getElementById(accordingTogglerSelector));
            this.$headers = $(this.$headerClassName, this.$accordionContainer);
            this.defaultExpandedParts = defaultExpandedParts;
            this.accordionStorage = new AccordionStorage(accordionSelector);
            this.numOfAccrodionParts = $(this.$headerClassName).length;
            this.init();
           
        }

        init() {
            this.$accordingToggler.html(this.openAllLabelText);
            this.isCollapsed = true;
            this.$accordionContainer.hide();

            this.$accordionContainer.accordion({
                collapsible: true,
                autoHeight: true,
                heightStyle: "content",
                animate: false,
                header: ".accordion-content >" + this.$headerClassName,
                active: false,
                disabled: true,               
                icons: { "header": Accordion.iconPlusClassName, "activeHeader": Accordion.iconMinusClassName },                
            });

            
            $(this.$headerClassName, this.$accordionContainer).click((e) => {               
                this.OpenClosePart(e.delegateTarget);               
            });

           

            this.$accordingToggler.on("click", (e) => {
                e.preventDefault();
                var $headers = this.$headers;
                var $iconSelector = $("span", $headers);

                if (this.isCollapsed) {
                    this.ChangeToMinusIcon($iconSelector);
                    this.ShowHideGridButtons($headers, true);
                    $headers.next().show();
                    this.isCollapsed = false;
                    this.$accordingToggler.html(this.closeAllLabelText);
                    this.accordionStorage.EnableAll(this.numOfAccrodionParts);
                    this.HandleTextAreas();
                    this.ResizeMall();

                } else {
                    this.ChangeToPlusIcon($iconSelector);
                    this.ShowHideGridButtons($headers, false);
                    $(this.$headerClassName, this.$accordionContainer).next().hide();
                    this.isCollapsed = true;
                    this.$accordingToggler.html(this.openAllLabelText);
                    this.accordionStorage.RemoveAll();
                }
               
                
            });


            this.ExpandDefaultParts();
        }


        private ResizeMall() {            
            setTimeout(() => {
               $(this.$accordionContainer).trigger("OnResizeMall");
            }, 100);
        }
        private HandleTextAreas() {
            var slidingTextareaList = [];
            $('.innehall textarea').each((index, element) => {
                var textarea = new SlidingTextarea(element);
                slidingTextareaList.push(textarea);
            });
        }

        public Show() {
            this.$accordionContainer.show();
            this.ResizeMall();
        }


        private contentPartsClass: string = ".ui-accordion-content";

        public ExpandAll() {
            var $contentParts = $(this.contentPartsClass);
            _.each($contentParts, (contentPart: any, index: number) => {
                var $contentPart = (<HTMLDivElement>contentPart);
                var header = $($contentPart).prev();
                var $iconSelector = $("span", header);
                $contentPart.style.display = "block";
                this.ChangeToMinusIcon($iconSelector);
                this.accordionStorage.Add(index);  
            });
        }

        public ExpandDefaultParts() {            
            var loadedFromStoredIndex = false;
            var $contentParts = $(this.contentPartsClass);
            var storedPartIndexes = this.accordionStorage.GetStoredIndexes();
            if (storedPartIndexes && storedPartIndexes.length)
                loadedFromStoredIndex = true;
           
            _.each($contentParts, (contentPart: any, index: number) => {  
                var $contentPart = (<HTMLDivElement>contentPart);
                var header = $($contentPart).prev();
                var $iconSelector = $("span", header);
                if (loadedFromStoredIndex) {
                    if (_.contains(storedPartIndexes, index)) {                           
                        $contentPart.style.display = "block";                           
                        this.ChangeToMinusIcon($iconSelector);                            
                    } else {
                        this.ShowHideGridButtons(header, false);
                        this.ChangeToPlusIcon($iconSelector);
                    }
                } else {                        
                    $contentPart.style.display = "block";                       
                    this.ChangeToMinusIcon($iconSelector);
                    this.accordionStorage.Add(index);                          
                }
                
            });              
              
            if (this.accordionStorage.IsAllCollapsed()) {
                this.isCollapsed = true;
                this.$accordingToggler.html(this.openAllLabelText);           
            } else {
                this.isCollapsed = false;
                this.$accordingToggler.html(this.closeAllLabelText);           
            }
            
        }

        public ShowHideGridButtons(element: any, show: boolean) {
            var $gridButtons = $(".grid-buttons", element);
            if (show) {
                $gridButtons.show();
            } else {
                $gridButtons.hide();
            }
            
        }

        private OpenClosePart(element: any) {            
            var $iconSelector = $("span", element);
            var hasPlusIcon = $iconSelector.hasClass(Accordion.iconPlusClassName);
            var partIndex = this.GetContentPartIndex(element);          
            // var contentPart = (<HTMLDivElement>element).nextSibling;
            var contentPart = $(element).next();
            if (hasPlusIcon) {
                this.ChangeToMinusIcon($iconSelector);
                this.ShowHideGridButtons(element, true);
                this.accordionStorage.Add(partIndex);   
                contentPart.show();
             
               
            } else {
                this.ChangeToPlusIcon($iconSelector);               
                this.ShowHideGridButtons(element, false);
                this.accordionStorage.Remove(partIndex);                
                contentPart.hide();               
            }
            
            //$(element).next().slideToggle();

            if (hasPlusIcon) {
                this.HandleTextAreas();
                this.ResizeMall();               
            }
            
        }

        private GetContentPartIndex(element: HTMLDivElement):number {
            var elementId = element.id;
            var parts = elementId.split("-");            
            var index = parts[parts.length - 1];
            return parseInt(index);          
        }

        private  ChangeToPlusIcon(element: any) {
            element.removeClass(Accordion.iconMinusClassName);
            element.addClass(Accordion.iconPlusClassName);
        }

        private  ChangeToMinusIcon(element: any) {
            element.removeClass(Accordion.iconPlusClassName);
            element.addClass(Accordion.iconMinusClassName);
        }
    }

} 