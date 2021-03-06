import { getRegisterLoginComponent } from './../../../shared-module/modals/event/modals/get-register-login.component';
import { JoinComponent } from './../../../shared-module/components/join/join';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/pluck';

import {Component, OnInit, AfterViewInit, Input} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {AuthService} from '../../../auth/services/auth-service';
import {EventService} from '../../../shared-module/services/event-service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PromoteModalComponent} from '../../../shared-module/modals/event/modals/promote-modal-component';
import {AttendModalComponent} from '../../../shared-module/modals/event/modals/attend-modal-component';
import {AppService} from '../../../services/app-service';
import {BookmarkService} from '../../../shared-module/services/bookmark.service';
import {AngularFireDatabase} from 'angularfire2/database/database';
declare var Quill: any;

@Component({
    templateUrl: './event.html',
    selector: 'oevent',
    styleUrls: [
        './event.scss'
    ],
    providers: [NgbActiveModal]

})

export class EventComponent implements OnInit, AfterViewInit{

    @Input() eventId = '';

    id: string;
    description: any;
    // check if current use is a promoter
    promoter = false;

    // TRACK IF DATA HAS BEEN LOADED FROM FIREBASE
    set = false;

    promoters$: any;
    attendeesPresent = false;
    attendees$: any;

    bookmarkSet = false;
    featured = false;
    featuredKey = '';
    user:any;

    constructor(private auth: AuthService,
                private router: Router,
                private af: AngularFireDatabase,
                private route: ActivatedRoute,
                public eventService: EventService,
                private modalService: NgbModal,
                public activeModal: NgbActiveModal,
                public appService: AppService,
                public bookmarkService: BookmarkService) {
        this.promoters$ = this.eventService.getPromoters;
    }

    // -----------------------------------------------------------------------------------------------------------------------
    // GET ID PARAM AND SET THE SESSION DATA
    // -----------------------------------------------------------------------------------------------------------------------
    ngOnInit(): void{

        // COMING IN THROUGH ROUTE IF NOT SET
        if (this.eventId === '') {
            this.route.params.forEach((params: Params) => {

                this.route.params.forEach((params: Params) => {

                    if (!params['id']){

                    }

                    else{
                        this.id = params['id'];
                        this.eventService.setEvent(params['id']).then(() => {

                            this.checkBookmark();

                            // IF THEY HAVE AN OCODE CHECK TO SEE IF THEY ARE A PROMOTER
                            if (this.appService.ocodeSet){
                                this.checkPromoter();
                            }
                            else{
                                // WATCH TO SEE IF IT GETS SET
                                this.appService.ocodeService.ocodeEmitter.first().subscribe((data) => {
                                    this.checkPromoter();
                                });
                            }

                            this.attendees$ = this.eventService.getAttendeesRef();

                            this.attendees$.subscribe((data) => {
                                if (data.length){
                                    this.attendeesPresent = true;
                                }
                            });

                            // GRAB THE SHARE OCODE AND TAKE ACTION
                            if (params['ocode']){
                                if (params['ocode'].length > 5){
                                    this.eventService.refOcode = params['ocode'];
                                    this.eventService.refOcodeSet = true;
                                    this.setShareData();
                                }
                            }

                            // ADMIN INFO
                            if (this.appService.admin){
                                this.checkFeatured();
                            }

                        });
                    }
                });

            });
        }

        else{ // CALLED FROM ANOTHER COMPONENT (PREVIEW INITIALLY)

            this.id = this.eventId;
            this.eventService.setEvent(this.eventId, true).then(() => {

                this.checkBookmark();

                // IF THEY HAVE AN OCODE CHECK TO SEE IF THEY ARE A PROMOTER
                if (this.appService.ocodeSet){
                    this.checkPromoter();
                }
                else{
                    // WATCH TO SEE IF IT GETS SET
                    this.appService.ocodeService.ocodeEmitter.first().subscribe((data) => {
                        this.checkPromoter();
                    });
                }



                this.attendees$ = this.eventService.getAttendeesRef();

                this.attendees$.subscribe((data) => {
                    if (data.length){
                        this.attendeesPresent = true;
                    }
                });

                // GRAB THE SHARE OCODE AND TAKE ACTION
                /*if(params['ocode']){
                    if(params['ocode'].length > 5){
                        this.eventService.refOcode = params['ocode'];
                        this.eventService.refOcodeSet = true;
                        this.setShareData();
                    }
                }*/

            });
        }

        this.auth.authState$.subscribe(
            data => {
                this.user = data;
            }
        )

    }

    // -----------------------------------------------------------------------------------------------------------------------
    // RENDER DELTA GENERATED BY QUILL EDITOR AFTER CONTENT IS AVAILABLE AND ANY TIME IS CHANGES
    // -----------------------------------------------------------------------------------------------------------------------
    ngAfterViewInit() {

        // USING SET INTERVAL UNTIL THE DATA IS SET SINCE THE PROPER CONTAINER IS NOT LOADED UNTIL SET IT SET
        const doCheck = setInterval(() => {

            if (this.eventService.set){

                // ALLOW TIME FOR ANG2 TO REACT
                setTimeout(() => {

                    // INSTANTIATE BASED ON ID
                    this.description = new Quill('#description', {
                        readOnly: true
                    });

                    this.description.setContents(this.eventService.event.description);

                    clearInterval(doCheck);

                }, 150);
            }

        }, 100);
    }

    checkPromoter(){
        if (this.appService.ocodeSet){

            this.eventService.checkPromoter().subscribe((data) => {

                if (data.$exists()){
                    this.promoter = true;
                }
                else{
                    this.promoter = false;
                }

            });

        }
    }

    checkFeatured(){
        this.eventService.getFeaturedEvents().subscribe((data) => {
            for (const event of data){
                if (event.$value == this.id){
                    this.featured = true;
                    this.featuredKey = event.$key;
                }
            }
        });
    }

    addFeatured(){
        this.eventService.getFeaturedEvents().push(this.id);
    }

    removeFeatured(){
        this.eventService.getFeaturedEvents().remove(this.featuredKey).then(() => {
            this.featured = false;
            this.featuredKey = '';
        });
    }

    gotoProfile(){
        this.router.navigateByUrl(`/${this.eventService.eventOwnerOcode }`);
    }

    openPromoter(){
        this.activeModal.dismiss();
        const signInRef = this.modalService.open(PromoteModalComponent);
        signInRef.componentInstance.name = 'Promote';
    }

    openAttend(){
        this.activeModal.dismiss();
        if(this.user){
            const signInRef = this.modalService.open(AttendModalComponent);
            signInRef.componentInstance.name = 'Attend';
        } else{
            const signInRef = this.modalService.open(getRegisterLoginComponent);
            signInRef.componentInstance.name = 'RegisterLogin';
        }
    }

    setShareData(){

        const link = `http://oevent.jb5.co/event/${this.eventService.eventId}?ocode=${this.eventService.refOcode}`;

        const appendHtml = function(element, html) {
            const div = document.createElement('div');
            div.innerHTML = html;
            while (div.children.length > 0) {
                element.appendChild(div.children[0]);
            }
        };

        // TODO USE AND SDK TO DO THIS RIGHT, FACEBOOK AT THE VERY LEAST HAS ONE
        const appendToHead = `

        <!-- Schema.org markup for Google+ -->
        <meta itemprop="name" content="${this.eventService.event.title}">
        <meta itemprop="description" content="${this.eventService.event.descriptionText}">
        <meta itemprop="image" content="${this.eventService.event.imagePath}">

            <!-- Twitter Card data -->
        <meta name="twitter:title" content="${this.eventService.event.title}">
        <meta name="twitter:description" content="${this.eventService.event.descriptionText}">
        <!-- <meta name="twitter:creator" content="@author_handle"> -->
            <!-- Twitter summary card with large image must be at least 280x150px -->
        <meta name="twitter:image:src" content="${this.eventService.event.imagePath}">

            <!-- Open Graph data -->
        <meta property="og:title" content="${this.eventService.event.title}" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="${link}" />
        <meta property="og:image" content="${this.eventService.event.imagePath}" />
        <meta property="og:description" content="${this.eventService.event.descriptionText}" />
        <meta property="og:site_name" content="oevent" />`;

        appendHtml(document.head, appendToHead);
    }

    checkBookmark(){
        this.bookmarkService.checkBookmark(this.id).subscribe((data) => {
            if (data.$exists()){
                this.bookmarkSet = true;
            } else{
                this.bookmarkSet = false;
            }
        });
    }

    toggleBookmark(){

        if (!this.bookmarkSet){
            this.bookmarkService.setBookmark(this.id).then(() => {
                this.bookmarkSet = true;
            });
        } else{
            this.bookmarkService.removeBookmark(this.id).then(() => {
                this.bookmarkSet = false;
            });
        }

    }

}
