import { ViewChild, OnInit, OnDestroy, ElementRef, Component, AfterViewInit, Renderer2, RendererFactory2, ChangeDetectorRef, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { interval as observableInterval, Subscription } from 'rxjs';
import { SubSink } from 'subsink';
import { TeleBookingService } from '../../services/tele-bookings-service';
import * as Video from 'twilio-video';
import { MatDialog } from '@angular/material/dialog';
import { AccountService } from '../../services/account-service';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { MediaService } from 'jaldee-framework/media';
import { RequestDialogComponent } from 'jaldee-framework/request-dialog';
import { projectConstantsLocal } from 'jaldee-framework/constants';
import { TwilioService } from '../../services/twilio-service';
import { ToastService } from '../../services/toast.service';
import { ConsumerService } from '../../services/consumer-service';
@Component({
    selector: 'app-live-chat',
    templateUrl: './live-chat.component.html',
    styleUrls: ['./live-chat.component.css']
})
/**
 * Class for Meeting Room for a consumer
 */
export class LiveChatComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('localVideo') localVideo: ElementRef;  // To show the local participant video
    @ViewChild('previewContainer') previewContainer: ElementRef;
    @ViewChild('remoteVideo') remoteVideo: ElementRef; // To show the remote participant video
    room_name;
    access_token;
    app_id;
    screenWidth: number;
    screenHeight: number;
    videoId: any;
    cameraMode = 'user';
    loading = true;
    providerReady = false;
    cronHandle: Subscription;
    private renderer: Renderer2;
    uuid: any;
    result;
    meetObj;
    type: any;
    status: string;
    refreshTime = 10;
    booking;
    subs = new SubSink();
    source;
    account;
    recordingFlag = false;
    btnClicked = false;
    reqDialogRef: any;
    media: any;
    timerSub: Subscription;
    errorSub: Subscription;
    exitFromMeeting = false;
    timer;
    audioTrack;
    videoTrack;
    previewTracks = [];
    previewTracksClone = [];
    theme: any;
    accountProfile: any;
    accountConfig: any;
    twilioMainClass = TwilioService;
    @HostListener('window:beforeunload', ['$event'])
    public doSomething($event) {
        this.ngOnDestroy();
        return false;
    }
    constructor(
        private location: Location,
        private activateroute: ActivatedRoute,
        public twilioService: TwilioService,
        public rendererFactory: RendererFactory2,
        private snackbarService: SnackbarService,
        private router: Router,
        private cd: ChangeDetectorRef,
        private teleService: TeleBookingService,
        private dialog: MatDialog,
        private consumerService: ConsumerService,
        private accountService: AccountService,
        private toastService: ToastService
    ) {
        const _this = this;
        console.log("In LiveChat Component");
        _this.twilioService.loading = false;
        _this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        _this.renderer = rendererFactory.createRenderer(null, null);
        console.log(_this.renderer);
    }

    getTeleBooking(uuid, type, account?) {
        const _this = this;
        if (type === 'appt') {
            _this.teleService.getTeleBookingFromAppt(uuid, 'consumer', account).then(
                (booking: any) => {
                    _this.booking = booking;
                }, (error) => {
                    console.log(error);
                }
            )
        } else {
            _this.teleService.getTeleBookingFromCheckIn(uuid, 'consumer', account).then(
                (booking: any) => {
                    _this.booking = booking;
                }, (error) => {
                    console.log(error);
                }
            )
        }
    }
    /**
         * Method for Preview Camera before entering to the meeting room
        */
    getAudioStatus() {
        const _this = this;
        return new Promise((resolve, reject) => {
            Video.createLocalAudioTrack().then(track => {
                console.log(track);
                _this.addPreviewTrackToDom(track);
                _this.audioTrack = track;
                _this.twilioService.microphone = true;
                _this.previewTracks.push(track);
                resolve(true);
            }).catch(error => {
                console.log("No Audio");
                console.log(error);
                _this.twilioService.microphone = false;
                resolve(false);
            });
        });
    }
    getVideoStatus() {
        const _this = this;
        return new Promise((resolve, reject) => {
            // Video.createLocalVideoTrack().then(track => {
            Video.createLocalVideoTrack({ deviceId: _this.twilioService.selectedVideoId }).then(track => {
                _this.addPreviewTrackToDom(track);
                _this.videoTrack = track;
                _this.twilioService.video = true;
                _this.previewTracks.push(track);
                resolve(true);
            }).catch(error => {
                console.log("No Video");
                console.log(error);
                _this.twilioService.video = false;
                resolve(false);
            });
        });
    }
    removePreviewTrackToDom(track, type) {
        const _this = this;
        if (_this.previewContainer) {
            track.stop();
            const localElement = _this.previewContainer.nativeElement;
            if (localElement.getElementsByTagName(type)[0]) {
                localElement.getElementsByTagName(type)[0].remove();
            }
        }
        _this.previewTracks.slice(track, 1);
    }
    addPreviewTrackToDom(previewTrack) {
        const _this = this;
        const element = previewTrack.attach();
        _this.renderer.addClass(element, 'rem-video');
        _this.renderer.appendChild(_this.previewContainer.nativeElement, element);
    }
    generateType(media) {
        const _this = this;
        let mode = '';
        return new Promise((resolve, reject) => {
            if (media['audioDevices'].length === 0 && media['videoDevices'].length === 0) {
                mode = 'sys-both';
                resolve(mode);
            } else if (media['audioDevices'].length === 0 && media['videoDevices'].length !== 0) {
                mode = 'sys-mic';
                resolve(mode);
            } else if (media['audioDevices'].length !== 0 && media['videoDevices'].length === 0) {
                mode = 'sys-cam';
                resolve(mode);
            } else {
                _this.getVideoStatus().then(
                    (videoStatus) => {
                        _this.getAudioStatus().then(
                            (audioStatus) => {
                                if (!audioStatus && !videoStatus) {
                                    mode = 'b-both';
                                    resolve(mode);
                                } else if (audioStatus && !videoStatus) {
                                    mode = 'b-cam';
                                    resolve(mode);
                                } else if (!audioStatus && videoStatus) {
                                    mode = 'b-mic';
                                    resolve(mode);
                                } else {
                                    resolve('none');
                                }
                            }
                        )
                    }
                )

            }
        });
    }
    openRequestDialog(mode) {
        this.reqDialogRef = this.dialog.open(RequestDialogComponent, {
            width: '100%',
            panelClass: ['commonpopupmainclass', 'popup-class'],
            disableClose: true,
            autoFocus: true,
            data: {
                mode: mode
            }
        });
        this.reqDialogRef.afterClosed().subscribe(result => {
            if (result === 'success') {
                this.disconnect();
            }
        });
    }
    /**
     * Calls after the view initialization
     */
    ngAfterViewInit() {
        const _this = this;
        this.account = this.accountService.getAccountInfo();
        this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
        this.accountConfig = this.accountService.getAccountConfig();
        if (this.accountConfig && this.accountConfig['theme']) {
            this.theme = this.accountConfig['theme'];
        }
        this.subs.sink = this.activateroute.queryParams.subscribe(
            (qParams) => {
                if (qParams['src']) {
                    this.source = qParams['src'];
                }
            }
        )
        this.subs.sink = this.activateroute.params.subscribe(
            (params) => {
                console.log("Params: ", params);
                this.uuid = params['id'];
                this.type = this.uuid.substring((this.uuid.lastIndexOf('_') + 1), this.uuid.length);
                this.getTeleBooking(this.uuid, this.type, this.accountProfile.id);
                this.twilioService.preview = true;
            }
        );
        _this.errorSub = this.twilioService.getError().subscribe(
            (error) => {
                if (error) {
                    if (error.code === 53001) {
                        console.log('Reconnecting your signaling connection!', error.message);
                        _this.toastService.showInfo('Reconnecting your signaling connection!');
                    } else if (error.code === 53405) {
                        _this.toastService.showInfo('Reconnecting your media connection!');
                        console.log('Reconnecting your media connection!', error.message);
                    } else if (error.code === 20104) {
                        _this.toastService.showInfo('Signaling reconnection failed due to expired AccessToken!');
                        console.log('Signaling reconnection failed due to expired AccessToken!');
                    } else if (error.code === 53000) {
                        _this.toastService.showInfo('Signaling reconnection attempts exhausted!');
                        console.log('Signaling reconnection attempts exhausted!');
                    } else if (error.code === 53002) {
                        _this.toastService.showInfo('Signaling reconnection took too long!');
                        console.log('Signaling reconnection took too long!');
                    } else {
                        console.log("ErrorCode: ", error.code);
                    }
                }
            }
        )
        this.timerSub = this.twilioService.getTimer().subscribe(
            (timerStatus) => {
                if (timerStatus) {
                    console.log("Timer Status: true");
                    _this.exitFromMeeting = true;
                    clearTimeout(this.timer);
                    this.timer = setTimeout(() => {
                        _this.exitMeeting();
                    }, projectConstantsLocal.TIMEOUT_MEETING);
                } else {
                    _this.exitFromMeeting = false;
                }
            }
        )
        _this.cronHandle = observableInterval(_this.refreshTime * 500).subscribe(() => {
            _this.isProviderReady();
        });
        _this.cd.detectChanges();
        _this.requestPermissionAndFetchDevices();
    }
    async getMediaDevices() {
        const _this = this;
        const devices = await _this.enumerateDevicesWithDelay();
        const videoDevices = [];
        const audioDevices = [];
        for(let deviceIndex = 0; deviceIndex < devices.length; deviceIndex++) {
            if (devices[deviceIndex].kind === 'videoinput') {
                videoDevices.push(devices[deviceIndex]);
            } else if (devices[deviceIndex].kind === 'audioinput') {
                audioDevices.push(devices[deviceIndex]);
            }
        }
        // devices.forEach(device => {
        //     if (device.kind === 'videoinput') {
        //         videoDevices.push(device);
        //     } else if (device.kind === 'audioinput') {
        //         audioDevices.push(device);
        //     }
        // });
        return {
            videoDevices: videoDevices,
            audioDevices: audioDevices
        };
    }
    async requestPermissionAndFetchDevices() {
        const _this = this;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            // Permission granted, handle the stream (e.g., display video/audio)          
            // Now call your getMediaDevices function to enumerate devices
            const mediaDevices = await _this.getMediaDevices();
            console.log(mediaDevices);
            // ... continue with handling the stream or other actions
            _this.media = mediaDevices;
            if (mediaDevices['videoDevices'].length > 0) {
                const defaultVideoDevice = mediaDevices['videoDevices'][0];
                _this.twilioService.selectedVideoId = mediaDevices['videoDevices'][0].deviceId;
                _this.twilioService.cameraMode = defaultVideoDevice.label.includes('front') ? 'user' : 'environment';
            }
            console.log("System Media Devices");
            console.log(mediaDevices);
            _this.twilioService.camDeviceCount = mediaDevices['videoDevices'].length;
            _this.generateType(mediaDevices).then(
                (mode) => {
                    console.log(mode);
                    if (mode !== 'none') {
                        _this.openRequestDialog(mode);
                    } else {
                        console.log("Csite Media:", mediaDevices);
                        
                        // _this.twilioService.activeCamIndex = 0;
                        // _this.twilioService.selectedVideoId = media['videoDevices'][0].deviceId;
                    }
                }
            )
        } catch (error) {
            // Permission denied or error occurred
            console.error('Permission denied or error:', error);
            _this.openRequestDialog('b-both');
        }
    }
    exitMeeting() {
        if (this.exitFromMeeting) {
            this.disconnect();
        }
    }

    async enumerateDevicesWithDelay() {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices;
    }



    /**
     * Method which marks the consumer readiness and returns the token 
     * to connect to the meeting room if provider is ready
     */
    isProviderReadyforJoining() {
        const _this = this;
        return new Promise(function (resolve) {

            const post_data = {
                uuid: _this.uuid
            };
            _this.subs.sink = _this.consumerService.isProviderReady(post_data)
                .subscribe(data => {
                    if (data) {
                        _this.meetObj = data;
                        _this.loading = false;
                        _this.providerReady = true;
                        _this.recordingFlag = _this.meetObj.recordingFlag;
                        _this.status = 'Ready..'
                        resolve(true);
                    } else {
                        _this.loading = false;
                        _this.providerReady = false;
                        _this.meetObj = null;
                        if (_this.booking.userName) {
                            _this.status = 'Waiting for "' + _this.booking.userName + '" to start';
                        } else {
                            _this.status = 'Waiting for "' + _this.booking.businessName + '" to start'
                        }
                        resolve(false);
                    }
                }, error => {
                    _this.loading = false;
                    _this.providerReady = false;
                    _this.meetObj = null;
                    if (_this.booking.userName) {
                        _this.status = 'Waiting for "' + _this.booking.userName + '" to start';
                    } else {
                        _this.status = 'Waiting for "' + _this.booking.businessName + '" to start'
                    }
                    _this.snackbarService.openSnackBar(error.error, { 'panelClass': 'snackbarerror' });
                    resolve(false);                    
                });
        })
    }

    /**
     * Method which marks the consumer readiness and returns the token 
     * to connect to the meeting room if provider is ready
     */
    isProviderReady() {
        const _this = this;
        const post_data = {
            uuid: _this.uuid
        };
        _this.subs.sink = _this.consumerService.isProviderReady(post_data)
            .subscribe(data => {
                if (data) {
                    _this.meetObj = data;
                    _this.loading = false;
                    _this.providerReady = true;
                    _this.recordingFlag = _this.meetObj.recordingFlag;
                    _this.status = 'Ready..'
                    // if (_this.cronHandle) {
                    //     _this.cronHandle.unsubscribe();
                    // }
                } else {
                    _this.loading = false;
                    _this.providerReady = false;
                    _this.meetObj = null;
                    if (_this.booking.userName) {
                        _this.status = 'Waiting for "' + _this.booking.userName + '" to start';
                    } else {
                        _this.status = 'Waiting for "' + _this.booking.businessName + '" to start'
                    }

                }
            }, error => {
                _this.loading = false;
                _this.snackbarService.openSnackBar(error.error, { 'panelClass': 'snackbarerror' });
                _this.cronHandle.unsubscribe();
                setTimeout(() => {
                    _this.location.back();
                }, 3000);
            });
    }
    /**
     * Init method
     */
    ngOnInit() {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        const isMobile = {
            Android: function () {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function () {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function () {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function () {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function () {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any: function () {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
            }
        };
    }
    /**
     * Method to exit from the video call
     */
    disconnect() {
        const _this = this;
        _this.twilioService.loading = true;
        _this.btnClicked = true;
        _this.twilioService.disconnect();
        _this.previewTracks.forEach(track => {
            _this.removePreviewTrackToDom(track, track.kind);
        })
        if (_this.source && _this.source == 'room') {
            setTimeout(() => {
                _this.location.back();
            }, 3000);
        } else {
            _this.router.navigate([this.accountService.getCustomId(), 'dashboard']);
        }
    }
    /**
     * Method to start the video
     */
    connect(tokenObj) {
        const _this = this;
        _this.twilioService.connectToRoom(tokenObj.tokenId, {
            name: tokenObj.roomName,
            audio: true,
            video: { height: '100%', frameRate: 24, width: '100%', facingMode: 'user' },

            bandwidthProfile: {
                video: {
                    mode: 'collaboration',
                    maxTracks: 10,
                    dominantSpeakerPriority: 'standard',
                    renderDimensions: {
                        high: { height: 1080, width: 1980 },
                        standard: { height: 720, width: 1280 },
                        low: { height: 176, width: 144 }
                    }
                }
            },
            dominantSpeaker: true,
            maxAudioBitrate: 16000,
            preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
            networkQuality: { local: 1, remote: 1 }
        }, [_this.audioTrack, _this.videoTrack]);
    }
    /**
     * Mute Local Audio
     */
    mute() {
        this.twilioService.mute();
    }
    /**
     * Unmute Local Audio
     */
    unmute() {
        this.twilioService.unmute();
    }
    /**
     * Stop Local Video
     */
    stopVideo() {
        this.twilioService.disableVideo();
    }
    /**
     * Start Local Video
     */
    startVideo() {
        this.twilioService.enableVideo();
    }
    /**
     * Method to switch from and back cameras
     */
    switchCamera(videoDevices) {
        this.twilioService.switchCamera(videoDevices);
    }
    /**
     * Method to enter to a room. which will invoke the connect method
     */
    joinRoom() {
        const _this = this;
        _this.btnClicked = true;
        _this.loading = true;
        _this.twilioService.localVideo = _this.localVideo;
        _this.twilioService.remoteVideo = _this.remoteVideo;
        _this.twilioService.loading = true;
        _this.isProviderReadyforJoining().then(
            (status) => {
                if (status) {
                    _this.connect(_this.meetObj);
                    _this.subs.unsubscribe();
                } else {
                    _this.loading = false;
                }
            }
        )
    }
    /**
     * called when the page destroyed
     */
    ngOnDestroy() {
        const _this = this;
        if (_this.cronHandle) {
            _this.cronHandle.unsubscribe();
        }
        _this.subs.unsubscribe();
        _this.timerSub.unsubscribe();
        _this.errorSub.unsubscribe();
        _this.disconnect();
    }
}

