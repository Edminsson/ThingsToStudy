/// <reference path="base.ts" />

module MOA {
    export interface SearchBoxOptions {
        input: JQuery;
        controller: string;
        action: string;
        cache?: boolean;
        delay?: number;
        minLength?: number;
        onSearch?: (term) => any;
        onFocus?: (event: JQueryEventObject, item) => boolean;
        onSelect?: (event: JQueryEventObject, item) => boolean;
        onChange?: (event: JQueryEventObject, item) => boolean;
    }

    export class SearchBox {
        //private selector: string;
        private control: JQuery;
        private autocomplete: any;

        private lastXhr: JQueryXHR;
        private cache: any;

        public OnSearch: (term) => any;
        public OnFocus: (event: JQueryEventObject, item) => boolean;
        public OnSelect: (event: JQueryEventObject, item) => boolean;
        public OnChange: (event: JQueryEventObject, item) => boolean;

        public ItemIsSelected :boolean = false;

        private defaults: SearchBoxOptions = {
            input: undefined,
            controller: "",
            action: "",
            cache: false,
            minLength: 2,
            delay: 300,
            onSearch: undefined,
            onFocus: undefined,
            onSelect: undefined,
            onChange: undefined
        };


        constructor(options: SearchBoxOptions) {
            $.extend(this.defaults, options);

            this.OnSearch = this.defaults.onSearch;
            this.OnFocus = this.defaults.onFocus;
            this.OnSelect = this.defaults.onSelect;
            this.OnChange = this.defaults.onChange;
            this.ItemIsSelected = false;

            this.autocomplete = this.defaults.input.autocomplete({
                minLength: this.defaults.minLength,
                delay: this.defaults.delay,
                source: (request, response) => {

                    if (this.defaults.cache) {
                        if (request.term in this.cache) {
                            response(this.cache[request.term]);
                            return;
                        }
                    }

                    var searchData = (typeof this.OnSearch !== "undefined") ? this.OnSearch(request.term) : { term: request.term };
                    AjaxHelper.getJson(this.defaults.controller, this.defaults.action, searchData)
                        .done((data) => {
                            if (this.defaults.cache)
                                this.cache[request.term] = data;

                            response(data);
                        })
                        .fail((data) => {
                            Log.error("Fel vid sökning på " + request + ": " + data);
                            //console.log("Fel vid sökning på " + request + ": " + data);
                        });
                },
                focus: (event, ui) => {
                    if (typeof this.OnFocus !== "undefined")
                        return this.OnFocus(event, ui.item);
                    else
                        return true;
                },
                select: (event, ui) => {
                    if (typeof this.OnSelect !== "undefined") {
                        this.ItemIsSelected = true;                       
                        return this.OnSelect(event, ui.item);
                    }
                    else
                        return true;
                },
                change: (event, ui) => {
                    if (typeof this.OnChange !== "undefined")
                        return this.OnChange(event, ui.item);
                    else
                        return true;
                }
            }).keydown( (event) =>{                
                if (event.which === 13 && !this.ItemIsSelected) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            });
        }

    }

    
}

//(function ($) {
//    var cache = {}, lastXhr;

//    var defaults = {
//        sourceUrl: "",
//        targetUrl: "",
//        sokFilterElement: "",
//        noTab: false // disable autocomplete tab-select functionality
//    }

//    var methods = {
//        init: function (options) {

//            defaults = $.extend(defaults, options);

//            $(this).data('autocomplete-notab', defaults.noTab); // om du ändrar strängen måste du även ändra i jquery-ui-1.8.18.min.js samt jquery-ui-1.8.18.js

//            $(this).autocomplete({
//                minLength: 2,
//                delay: 500,
//                source: function (request, response) {
//                    var term = request.term + "|" + $(defaults.sokFilterElement).data("tDropDownList").value();
//                    if (term in cache) {
//                        response(cache[term]);
//                        return;
//                    }

//                    lastXhr = $.getJSON(defaults.sourceUrl,
//                        {
//                            term: encodeURIComponent(request.term),
//                            typ: $(defaults.sokFilterElement).val()
//                        },
//                        function (data, status, xhr) {
//                            cache[term] = data;
//                            if (xhr === lastXhr) {
//                                response(data);
//                            }
//                        });
//                },
//                focus: function (event, ui) {
//                    $(event.target).val(ui.item.label);
//                    return false;
//                },
//                select: function (event, ui) {
//                    $(event.target).val(ui.item.label);
//                    window.location.href = defaults.targetUrl + '/' + ui.item.value;
//                    return false;
//                }
//            });
//        }
//    }

//    $.fn.autosearch = function (method) {

//        if (methods[method]) {
//            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
//        } else if (typeof method === 'object' || !method) {
//            return methods.init.apply(this, arguments);
//        } else {
//            $.error('Method ' + method + ' does not exist on jQuery.autosearch');
//        }
//    };
//})(jQuery);

