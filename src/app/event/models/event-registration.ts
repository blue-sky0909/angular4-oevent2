import {EventFormFields} from "../../create/components/advanced/models/advanced-settings";
export interface IEventRegistration{
    ocode:string;
    promoterName:string;
    ocodeToggle:boolean;
    firstName:string;
    lastName:string;
    email:string;
    fields:EventFormFields;
    custom?:any[];
    eventRef:string;
    ticketRef:string;
    uid?:string;
    isParent:boolean;
    isChild:boolean;
    parentRef?:any;
    hasChildren:boolean;
    children:any[];
    requiresPayment:boolean;
    paid:boolean;
    total:number;
    ticketTitle:string;
    ticketQty:string;
    val?();
    exists?();
    createdAt?;
}

export class EventRegistration implements IEventRegistration{
    ocode:string = "";
    promoterName:string = "";
    ocodeToggle:boolean = false;
    firstName:string = "";
    lastName:string = "";
    email:string = "";
    fields:EventFormFields = new EventFormFields();
    doterra:string = "";
    custom:any[] = [];
    isChild:boolean = false;
    isParent:boolean = false;
    parentRef?:any;
    hasChildren:boolean = false;
    children:any[] = [];
    requiresPayment:boolean = false;
    paid:boolean = false;
    eventRef:string = "";
    ticketRef:string = "";
    uid:string = "";
    total:number = 0;
    ticketTitle:string = "";
    ticketQty:string = "";

    constructor(constructorObject?){
        if(typeof constructorObject !== "undefined"){
            if(typeof constructorObject.ocode !== "undefined"){
                this.ocode = constructorObject.ocode;
            }
            if(typeof constructorObject.ocodeToggle !== "undefined"){
                this.ocodeToggle = constructorObject.ocodeToggle;
            }
            if(typeof constructorObject.doterra !== "undefined"){
                this.doterra = constructorObject.doterra;
            }
            if(typeof constructorObject.custom !== "undefined"){
                this.custom = constructorObject.custom;
            }
            if(typeof constructorObject.isChild !== "undefined"){
                this.isChild = constructorObject.isChild;
            }
            if(typeof constructorObject.parentRef !== "undefined"){
                this.parentRef = constructorObject.parentRef;
            }
            if(typeof constructorObject.hasChildren !== "undefined"){
                this.hasChildren = constructorObject.hasChildren;
            }
            if(typeof constructorObject.children !== "undefined"){
                this.children = constructorObject.children;
            }
            if(typeof constructorObject.eventRef !== "undefined"){
                this.eventRef = constructorObject.eventRef;
            }
            if(typeof constructorObject.ticketRef !== "undefined"){
                this.ticketRef = constructorObject.ticketRef;
            }
        }
    }

    //ADD CHILD ALSO ASSIGNS AS A PARENT
    addChild(childRef){
        this.isChild = false;
        this.hasChildren = true;
        this.children.push(childRef);
    }

    //SPECIFY AS CHILD AND MAKE LOGICAL CHANGES
    assignAsChild(parentRef:string){
        this.hasChildren = false;
        this.children = [];
        this.isChild = true;
        this.parentRef = parentRef;
    }

}
