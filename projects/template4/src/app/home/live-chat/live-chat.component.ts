import { ViewChild, OnInit, OnDestroy, ElementRef, Component, AfterViewInit, Renderer2, RendererFactory2, ChangeDetectorRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { firstValueFrom, interval as observableInterval, Subscription } from 'rxjs';
import Video from 'twilio-video';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, ConsumerService, GroupStorageService, projectConstantsLocal, RequestDialogComponent, SharedService, SubscriptionService, ToastService } from 'jconsumer-shared';
import { TwilioService } from './twilio-service';
import { TeleBookingService } from '../../shared/tele-bookings-service';
import { imageConstants } from '../../shared/image-constants';

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
    private subscriptions: Subscription = new Subscription();
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
    accountID: any;
    accountConfig: any;
    twilioMainClass = TwilioService;
    // Simple click-guard to avoid double-triggering actions
    private actionLocks: { [key: string]: boolean } = {};
    isLoggedIn: boolean;
    phone: any;
    countryCode: string;
    loggedUser;
    linkExpired: boolean = false;
    @HostListener('window:beforeunload', ['$event'])
    public doSomething($event) {
        this.ngOnDestroy();
        return false;
    }
    constructor(
        private location: Location,
        private activateRoute: ActivatedRoute,
        public twilioService: TwilioService,
        private consumerService: ConsumerService,
        public rendererFactory: RendererFactory2,
        private router: Router,
        private cd: ChangeDetectorRef,
        private teleService: TeleBookingService,
        private dialog: MatDialog,
        private sharedService: SharedService,
        private toastService: ToastService,
        private subscriptionService: SubscriptionService,
        private authService: AuthService,
        private groupService: GroupStorageService
    ) {
        const _this = this;
        console.log("In LiveChat Component");
        _this.twilioService.loading = false;
        _this.renderer = rendererFactory.createRenderer(null, null);
        this.subscriptionService.sendMessage({ ttype: 'hideHeader' });
    }
    async getTeleBooking(encID: string, account?: string): Promise<void> {
        const isAppointment = encID.startsWith('a-');
        try {
            let booking;
            if (isAppointment) {
                booking = await this.teleService.getTeleBookingFromAppt(encID, 'consumer', account);
            } else {
                booking = await this.teleService.getTeleBookingFromCheckIn(encID, 'consumer', account);
            }
            this.booking = booking;
            this.uuid = booking['id'];
        } catch (error) {
            console.error('Error fetching tele booking:', error);
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
        if (element instanceof HTMLVideoElement) {
            // Remove controls
            element.removeAttribute('controls');
            element.style.pointerEvents = 'auto';

            // Ensure autoplay and inline playback
            element.autoplay = true;
            element.playsInline = true;

            // Disable picture-in-picture
            (element as any).disablePictureInPicture = true;

            // Prevent context menu
            element.oncontextmenu = () => false;

            // iOS specific attributes
            element.setAttribute('webkit-playsinline', 'webkit-playsinline');
            element.setAttribute('playsinline', 'playsinline');
        }
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
            panelClass: ['commonpopupmainclass', 'popup-class', this.theme].filter(Boolean),
            disableClose: true,
            autoFocus: true,
            data: {
                mode: mode,
                theme: this.theme
            }
        });
        this.reqDialogRef.afterClosed().subscribe(result => {
            if (result === 'success') {
                this.disconnect();
            }
        });
    }
    actionPerformed(status) {
        if (status) {
            this.isLoggedIn = true;
        }
        this.initMeeting();
    }
    /**
     * Calls after the view initialization
     */
    ngAfterViewInit() {
        const _this = this;
        this.accountConfig = this.sharedService.getAccountConfig();
        this.accountID = this.sharedService.getAccountID();
        if (this.accountConfig && this.accountConfig['theme']) {
            this.theme = this.accountConfig['theme'];
        }
        let subs = this.activateRoute.queryParams.subscribe(
            (qParams) => {
                if (qParams['src']) {
                    this.source = qParams['src'];
                }
                if (qParams['phonenumber'] !== 'new') {
                    this.authService.goThroughLogin().then(
                        (status) => {
                            if (status) {
                                const activeUser = this.groupService.getitemFromGroupStorage('jld_scon');
                                this.isLoggedIn = true;
                                this.loggedUser = activeUser;
                                this.initMeeting();
                            } else {
                                this.isLoggedIn = false;
                            }
                        }
                    )
                }
            }
        )
        this.subscriptions.add(subs);
    }
    
    getImageUrl(key: string): string {
        return this.sharedService.getCDNPath() + imageConstants[key];
    }

    initMeeting() {
        const _this = this;
        let subs1 = this.activateRoute.params.subscribe(async (params) => {
            console.log("Params: ", params);
            await this.getTeleBooking(params['id'], this.accountID);
            if (this.booking?.bookingStatus !== 'Completed' && this.booking?.bookingStatus !== 'Done') {
                this.twilioService.preview = true
                // ✅ Add any other logic here that should run when booking is active
                this.performMeeting();
            } else {
                console.log("Booking is completed. Skipping preview setup.");
                // this.toastService.showError("Meeting link is expired");
                this.linkExpired = true;
                // this.subscriptionService.sendMessage({ ttype: 'showHeader' });
            }
            // this.twilioService.preview = true;
        }
        );
        this.subscriptions.add(subs1);
    }

    performMeeting() {
        const _this = this;
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

    // Guard any UI action from double click; default delay ~400ms
    guardAction(key: string, action: () => void | Promise<void>, delay: number = 400) {
        if (this.actionLocks[key]) { return; }
        this.actionLocks[key] = true;
        try {
            const result = action && action();
            if (result && (result as any).then) {
                (result as Promise<void>).finally(() => {
                    setTimeout(() => { this.actionLocks[key] = false; }, delay);
                });
                return;
            }
        } finally {
            setTimeout(() => { this.actionLocks[key] = false; }, delay);
        }
    }
    onAudioDeviceSelect(deviceId: string) {
        this.guardAction('audioSwitch', () =>
            this.twilioService.switchAudioDevice(this.twilioService.activeRoom.localParticipant, deviceId),
            800
        );
    }
    // Wrappers for template (avoid arrow functions in template)
    onMuteClick() { this.guardAction('mute', () => this.mute()); }
    onUnmuteClick() { this.guardAction('unmute', () => this.unmute()); }
    // onVideoToggleClick() {
    //     this.guardAction('videoToggle', () => (this.twilioService.video ? this.stopVideo() : this.startVideo()));
    // }
    onVideoToggleClick() {
        this.guardAction('videoToggle', () => {
            if (this.twilioService.video) {
                this.stopVideo();
            } else {
                this.startVideo();
            }
        }, 800); // 600ms timeout between toggles
    }
    onSwitchCameraClick() {
        this.guardAction('switchCamera', () => this.switchCamera(this.media && this.media['videoDevices']));
    }
    onDisconnectClick() { this.guardAction('disconnect', () => this.disconnect()); }
    onJoinClick() {
        if (!this.btnClicked && this.providerReady) {
            this.guardAction('joinRoom', () => this.joinRoom());
        }
    }
    onExitClick() {
        if (!this.btnClicked) {
            this.guardAction('exit', () => this.disconnect());
        }
    }

    async getMediaDevices() {
        const _this = this;
        const devices = await _this.enumerateDevicesWithDelay();
        const videoDevices = [];
        const audioDevices = [];
        for (let deviceIndex = 0; deviceIndex < devices.length; deviceIndex++) {
            if (devices[deviceIndex].kind === 'videoinput') {
                videoDevices.push(devices[deviceIndex]);
            } else if (devices[deviceIndex].kind === 'audioinput') {
                audioDevices.push(devices[deviceIndex]);
            }
        }
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
            console.log("Permission Granted");
            const mediaDevices = await _this.getMediaDevices();
            console.log("Your devices", mediaDevices);
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
            let subs = _this.consumerService.isProviderReady(post_data)
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
                            // _this.status = 'Waiting for "' + _this.booking.businessName + '" to start'
                            _this.status = 'Waiting for Provider to Start'
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
                        // _this.status = 'Waiting for "' + _this.booking.businessName + '" to start'
                        _this.status = 'Waiting for Provider to Start'
                    }
                    _this.toastService.showError(error.error);
                    resolve(false);
                });
            _this.subscriptions.add(subs);
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
        let subs = _this.consumerService.isProviderReady(post_data)
            .subscribe(data => {
                if (data && data["providerReady"]) {
                    _this.meetObj = data;
                    _this.loading = false;
                    _this.providerReady = true;
                    _this.recordingFlag = _this.meetObj.recordingFlag;
                    _this.status = 'Ready..'
                    if (_this.cronHandle) {
                        _this.cronHandle.unsubscribe();
                    }
                } else {
                    _this.loading = false;
                    _this.providerReady = false;
                    _this.meetObj = null;
                    if (_this.booking.userName) {
                        _this.status = 'Waiting for "' + _this.booking.userName + '" to start';
                    } else {
                        // _this.status = 'Waiting for "' + _this.booking.businessName + '" to start'
                        _this.status = 'Waiting for Provider to Start'
                    }
                }
            }, error => {
                _this.loading = false;
                _this.toastService.showError(error.error);
                _this.cronHandle.unsubscribe();
                setTimeout(() => {
                    _this.location.back();
                }, 3000);
            });
        _this.subscriptions.add(subs);
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
    async disconnect() {
        const _this = this;
        await this.updateConsumerReadyStateOnExit();
        _this.twilioService.loading = true;
        _this.btnClicked = true;
        this.stopLocalPreviewTracks();
        _this.twilioService.disconnect();
        if (_this.source && _this.source == 'room') {
            setTimeout(() => {
                _this.location.back();
            }, 3000);
        } else {
            _this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
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
                    _this.subscriptions.unsubscribe();
                } else {
                    _this.loading = false;
                    _this.providerReady = false;
                    _this.meetObj = null;
                    _this.btnClicked = false;
                    _this.twilioService.loading = false;
                    if (_this.booking.userName) {
                        _this.status = 'Waiting for "' + _this.booking.userName + '" to start';
                    } else {
                        // _this.status = 'Waiting for "' + _this.booking.businessName + '" to start'
                        _this.status = 'Waiting for Provider to Start'
                    }

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
        _this.subscriptions?.unsubscribe();
        _this.timerSub?.unsubscribe();
        _this.errorSub?.unsubscribe();
        void _this.disconnect();
        _this.subscriptionService.sendMessage({ ttype: 'showHeader' });
    }

    /**
     * Inform backend that consumer is no longer ready/active in the meeting.
     */
    private async updateConsumerReadyStateOnExit() {
        if (!this.uuid) { return; }
        try {
            await firstValueFrom(this.teleService.setReadyState(this.uuid));
        } catch (err) {
            console.warn('Failed to update consumer ready state:', err);
        }
    }

    private stopLocalPreviewTracks() {
        // Stop and clear any local preview tracks (audio/video) and DOM nodes
        this.previewTracks.forEach(track => {
            try {
                track.stop();
            } catch { }
            try {
                this.removePreviewTrackToDom(track, track.kind);
            } catch { }
        });
        this.previewTracks = [];
        this.previewTracksClone = [];
        this.audioTrack = null;
        this.videoTrack = null;
        if (this.previewContainer?.nativeElement) {
            const localElement = this.previewContainer.nativeElement;
            while (localElement.firstChild) {
                localElement.removeChild(localElement.firstChild);
            }
        }
    }
}