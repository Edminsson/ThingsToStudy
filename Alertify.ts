module MOA.UI {

    export class Alertify {
        private static _instance: Alertify = null;

        constructor() {
            if (Alertify._instance) {
                throw new Error("Error: Instantiation failed: Use Alertify.getInstance() instead of new.");
            }
            Alertify._instance = this;
            this.init();
        }

        public static getInstance(): Alertify {           
            if (Alertify._instance === null) {               
                Alertify._instance = new Alertify();
                
            }
            return Alertify._instance;
        }

        alert(value: string) {                         
            alertify.alert(value);            
        }

         confirm(value: string, callback?: any) {
            alertify.confirm(value, callback);
         }

        confirmWithAction(value: string, okCallBack: ()=> any) {
            alertify.confirm(value, (ok) => {
                if (ok) {
                    okCallBack();                   
                }
            });
        }

        success(message: string) {
            alertify.success(message);
        }

        error(message: string) {
            alertify.error(message);
        }

         set(options: Options) {
            alertify.set(options);
         }

        private init() {
            alertify.set(
                {
                    labels: {
                        ok: "Ok",
                        cancel: "Avbryt"
                    }
                }
                );

            alertify.init();
           
            //Måste lägga denna på ett annat ställe då den hamnar fel när progressbaren vid sparning körs
            $("#body").append($('#alertify-cover').detach());
        }
    }
    
} 