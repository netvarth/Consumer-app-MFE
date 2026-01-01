import { Injectable, ElementRef, Renderer2, RendererFactory2 } from '@angular/core';
import { ToastService } from 'jconsumer-shared';
import { Observable, Subject } from 'rxjs';
import * as Video from 'twilio-video';
@Injectable({
    providedIn: 'any'
})
export class TwilioService {
    remoteVideo: ElementRef;
    localVideo: ElementRef;
    previewContainer: ElementRef;
    microphone = true;
    video = true;
    preview = true;
    roomParticipants;
    participantsCount = 0;
    showParticipant = false;
    previewTrack;
    camDeviceCount = 0;
    private renderer: Renderer2;
    cameraMode: string = 'user';
    previewTracks;
    timerSubject = new Subject<any>();
    errorSubject = new Subject<any>();
    public static signalStrength: any;
    selectedVideoId: string;
    selectedAudioId: string;
    activeCamIndex;
    cam1Device: string;
    cam2Device: string;
    activeRoom;
    btnClicked = false;
    loading = false;
    private deviceCachePromise: Promise<void>;
    constructor(public rendererFactory: RendererFactory2,
        private toastService: ToastService) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    activateTimer(timer: any) {
        this.timerSubject.next(timer);
    }
    getTimer(): Observable<any> {
        return this.timerSubject.asObservable();
    }

    sendError(error: any) {
        this.errorSubject.next(error);
    }
    getError(): Observable<any> {
        return this.errorSubject.asObservable();
    }
    enableVideo() {
        const _this = this;
        const localParticipant = _this.activeRoom.localParticipant;
        const existingPub: any = Array.from(localParticipant.videoTracks.values())[0];
        const track: any = existingPub ? existingPub.track : null;
        const currentDeviceId = track?.mediaStreamTrack?.getSettings?.().deviceId || this.selectedVideoId;
        if (currentDeviceId) { this.selectedVideoId = currentDeviceId; }

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const restoreTrack = (useFacingExact: boolean) => {
            _this.recreateVideoTrackAfterSwitch(localParticipant, useFacingExact ? true : false, currentDeviceId || undefined, currentDeviceId);
        };

        if (isIOS) {
            _this.ensureVideoDevicesCached().then(() => {
                restoreTrack(false);
            }).catch(() => {
                console.log('enableVideo iOS path: device cache failed, falling back to exact facing');
                restoreTrack(true);
            });
            this.video = true;
            return;
        }

        restoreTrack(false);
        this.video = true;
    }
    disableVideo() {
        const _this = this;
        _this.activeRoom.localParticipant.videoTracks.forEach(publication => {
            publication.track.stop();
            publication.unpublish();
            if (_this.localVideo) {
                const localElement = _this.localVideo.nativeElement;
                while (localElement.firstChild) {
                    localElement.removeChild(localElement.firstChild);
                }
                // Show local avatar placeholder when video is disabled
                _this.addLocalParticipantDetails(localElement);
            }
        });
        this.video = false;
    }
    mute() {
        this.activeRoom.localParticipant.audioTracks.forEach(function (audioTrack) {
            audioTrack.track.disable();
        });
        this.microphone = false;
    }
    unmute() {
        this.activeRoom.localParticipant.audioTracks.forEach(function (audioTrack) {
            audioTrack.track.enable();
        });
        this.microphone = true;
    }
    private ensureVideoDevicesCached(forceRefresh: boolean = false) {
        if (this.deviceCachePromise && !forceRefresh && this.cam1Device && this.cam2Device) { return this.deviceCachePromise; }
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
            this.deviceCachePromise = Promise.resolve();
            return this.deviceCachePromise;
        }
        this.deviceCachePromise = navigator.mediaDevices.enumerateDevices().then((devices) => {
            const videoInputs = devices.filter(d => d.kind === 'videoinput');
            if (!videoInputs.length) { return; }
            const front = videoInputs.find(d => /front|user/i.test(d.label));
            const back = videoInputs.find(d => /back|rear|environment/i.test(d.label));
            // Fallback to first/second even if labels are empty (iOS before label unlock)
            this.cam1Device = (front || videoInputs[0])?.deviceId;
            this.cam2Device = (back || videoInputs.find(d => d.deviceId !== this.cam1Device))?.deviceId;
            console.log('ensureVideoDevicesCached', {
                count: videoInputs.length,
                cam1Device: this.cam1Device,
                cam2Device: this.cam2Device,
                labels: videoInputs.map(v => ({ id: v.deviceId, label: v.label }))
            });
        }).catch(err => {
            console.warn('Failed to cache video devices', err);
        });
        return this.deviceCachePromise;
    }
    private getAlternateVideoDeviceId(currentDeviceId?: string) {
        if (!this.cam1Device && !this.cam2Device) { return null; }
        if (currentDeviceId && currentDeviceId === this.cam1Device && this.cam2Device) { return this.cam2Device; }
        if (currentDeviceId && currentDeviceId === this.cam2Device && this.cam1Device) { return this.cam1Device; }
        // If we don't know current, return the opposite of selectedVideoId when possible
        if (!currentDeviceId && this.selectedVideoId) {
            if (this.selectedVideoId === this.cam1Device && this.cam2Device) { return this.cam2Device; }
            if (this.selectedVideoId === this.cam2Device && this.cam1Device) { return this.cam1Device; }
        }
        return this.cam2Device || this.cam1Device || null;
    }

    private recreateVideoTrackAfterSwitch(localParticipant, forceFacingExact: boolean = false, deviceId?: string, prevDeviceId?: string, attemptedFallback?: boolean) {
        const _this = this;
        const facingMode = this.cameraMode || 'user';
        const facingConstraint: any = forceFacingExact ? { exact: facingMode } : facingMode;

        const tracks = Array.from(localParticipant.videoTracks.values()).map(
            function (trackPublication) {
                return trackPublication['track'];
            }
        ).filter(Boolean);
        if (tracks.length) {
            localParticipant.unpublishTracks(tracks);
            console.log(localParticipant.identity + ' removed track: ' + tracks[0].kind);
            this.detachTracks(tracks);
            this.stopTracks(tracks);
        }
        if (_this.localVideo) {
            _this.removeLocalParticipantDetails(_this.localVideo.nativeElement);
        }

        Video.createLocalVideoTrack({
            facingMode: deviceId ? undefined : facingConstraint,
            deviceId: deviceId ? { exact: deviceId } : undefined
        }).then(function (localVideoTrack) {
            const settings = localVideoTrack.mediaStreamTrack?.getSettings?.();
            if (settings?.deviceId) {
                _this.selectedVideoId = settings.deviceId;
            }
            localParticipant.publishTrack(localVideoTrack);
            console.log(localParticipant.identity + ' added track: ' + localVideoTrack.kind);
            _this.attachTracks([localVideoTrack], _this.localVideo.nativeElement, _this.activeRoom);
        }).catch(err => {
            console.warn('Failed to create video track with exact facing mode on iOS, retrying without constraint', err);
            // Fallback: retry without exact constraint
            Video.createLocalVideoTrack({ facingMode: this.cameraMode }).then(function (localVideoTrack) {
                const settings = localVideoTrack.mediaStreamTrack?.getSettings?.();
                if (settings?.deviceId) {
                    _this.selectedVideoId = settings.deviceId;
                }
                localParticipant.publishTrack(localVideoTrack);
                _this.attachTracks([localVideoTrack], _this.localVideo.nativeElement, _this.activeRoom);
            }).catch(err2 => {
                console.warn('Failed to create video track', err2);
            });
        });

    }
    switchAudioDevice(localParticipant, deviceId: string) {
        if (!this.microphone) {
            console.log('Audio is off, skipping audio switch');
            return;
        }

        const tracks = Array.from(localParticipant.audioTracks.values()).map(
            function (trackPublication) {
                return trackPublication['track'];
            }
        ).filter(Boolean);

        if (tracks.length) {
            localParticipant.unpublishTracks(tracks);
            tracks.forEach(track => track.stop());
        }

        Video.createLocalAudioTrack({ deviceId: { exact: deviceId } })
            .then(localAudioTrack => {
                this.selectedAudioId = deviceId;
                localParticipant.publishTrack(localAudioTrack);
                console.log('Switched audio to device:', deviceId);
            })
            .catch(err => console.warn('Failed to switch audio device', err));
    }
    switchCamera(videoDevices) {
        const _this = this;
        if (!this.video) {
            return;
        }

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        _this.cameraMode = _this.cameraMode === 'user' ? 'environment' : 'user';
        const localParticipant = _this.activeRoom.localParticipant;
        const existingPub: any = Array.from(localParticipant.videoTracks.values())[0];
        const track: any = existingPub ? existingPub.track : null;
        const currentDeviceId = track?.mediaStreamTrack?.getSettings?.().deviceId || this.selectedVideoId;
        if (currentDeviceId) { this.selectedVideoId = currentDeviceId; }


        // iOS specific: try with exact constraint first for better reliability
        let videoConstraints: any = { facingMode: this.cameraMode };
        if (isIOS) {
            videoConstraints = { facingMode: { exact: this.cameraMode } };
            _this.ensureVideoDevicesCached().then(() => {
                const nextDeviceId = _this.getAlternateVideoDeviceId(currentDeviceId);
                console.log('switchCamera iOS path', { nextDeviceId });
                _this.recreateVideoTrackAfterSwitch(localParticipant, !nextDeviceId, nextDeviceId || undefined, currentDeviceId);
            }).catch(() => {
                console.log('switchCamera iOS path: cache devices failed, falling back to facing exact');
                _this.recreateVideoTrackAfterSwitch(localParticipant, true, undefined, currentDeviceId);
            });
            return;
        }
    }
    connectToRoom(accessToken, options, tracks?) {
        const _this = this;
        console.log("In Connect Room");
        console.log(tracks);
        if (tracks) {
            _this.previewTracks = tracks;
        }
        if (_this.previewTracks) {
            options['tracks'] = _this.previewTracks;
        }
        console.log(_this.previewTracks);
        Video.connect(accessToken, options).then(
            (room: any) => {
                room.localParticipant.setNetworkQualityConfiguration({
                    local: 2,
                    remote: 1
                });
                _this.preview = false;
                _this.loading = false;
                _this.activeRoom = room;
                if (options['video']) {
                    if (!_this.localVideo.nativeElement.querySelector('video')) {
                        console.log("in connect method");
                        _this.attachParticipantTracks(room.localParticipant, _this.localVideo.nativeElement, room);
                    }
                }
                _this.btnClicked = false;
                _this.roomJoined(room);
            }, (error) => {
                _this.loading = false;
                _this.toastService.showInfo(error);
                _this.disconnect();
                // reject(error);
            }
        );
    }
    networkQualityChanged(networkQualityLevel, networkQualityStats) {
        TwilioService.signalStrength = networkQualityLevel;
        console.log({
            1: '▃',
            2: '▃▄',
            3: '▃▄▅',
            4: '▃▄▅▆',
            5: '▃▄▅▆▇'
        }[networkQualityLevel] || '');
        if (networkQualityStats) {
            // Print in console the networkQualityStats, which is non-null only if Network Quality
            // verbosity is 2 (moderate) or greater
            console.log('Network Quality statistics:', networkQualityStats);

        }
    }
    // Attach the Tracks to the DOM.
    attachTracks(tracks, container, room) {
        const _this = this;
        console.log("attachTracks");
        tracks.forEach(function (track) {
            if (track) {
                console.log(track);
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const element = track.attach();
                element.setAttribute('data-track-sid', track.sid);
                if (element instanceof HTMLElement) {
                    // Remove all controls for seamless playback
                    element.removeAttribute('controls');
                    element.style.pointerEvents = 'auto';
                    // Ensure autoplay and inline playback
                    if ('autoplay' in element) {
                        element.autoplay = true;
                    }
                    if ('playsInline' in element) {
                        element.playsInline = true;
                    }
                    // Disable picture-in-picture mode especially for iOS
                    if ('disablePictureInPicture' in element) {
                        (element as any).disablePictureInPicture = true;
                    }
                    // Disable context menu on video
                    element.oncontextmenu = () => false;
                    // Ensure no controls attribute exists
                    if (element.hasAttribute('controls')) {
                        element.removeAttribute('controls');
                    }
                    // Additional iOS specific handling
                    if (isIOS) {
                        element.setAttribute('webkit-playsinline', 'webkit-playsinline');
                        element.setAttribute('playsinline', 'playsinline');
                    }
                }
                _this.renderer.data['id'] = track.sid;
                _this.renderer.addClass(element, 'rem-video');
                _this.renderer.appendChild(container, element);
            }
        });
    }
    // Attach the Participant's Tracks to the DOM.
    attachParticipantTracks(participant, container, room) {
        const _this = this;
        var tracks = Array.from(participant.tracks.values()).map(function (trackPublication) {
            return trackPublication['track'];
        });
        console.log("attachParticipantTracks");
        _this.attachTracks(tracks, container, room);
    }
    // Detach the Tracks from the DOM.
    detachTracks(tracks) {
        console.log("detachTracks");
        tracks.forEach(function (track) {
            if (track) {
                track.detach().forEach(function (detachedElement) {
                    detachedElement.remove();
                });
            }
        });
    }
    // Detach the Participant's Tracks from the DOM.
    detachParticipantTracks(participant, room, _this) {
        console.log("detachParticipantTracks");
        var tracks = Array.from(participant.tracks.values()).map(function (trackPublication) {
            return trackPublication['track'];
        });
        _this.detachTracks(tracks, room);
    }
    // 
    stopTracks(tracks) {
        console.log("stopTracks");
        tracks.forEach(function (track) {
            if (track) { track.stop(); }
        })
    }
    // Successfully connected!
    roomJoined(room) {
        const _this = this;
        // Attach the Tracks of the Room's Participants.
        if (!_this.video) {
            _this.disableVideo();
        }
        if (!_this.microphone) {
            _this.mute();
        }
        room.localParticipant.on('networkQualityLevelChanged', this.networkQualityChanged);
        room.participants.forEach((participant) => {
            console.log("Participant:", participant);
            console.log("Already in Room: '" + participant.identity + "'");
            _this.attachParticipantTracks(participant, _this.remoteVideo.nativeElement, room);
            _this.participantsCount = room.participants.size;
            console.log('first:participantsCount:' + _this.participantsCount);
        });
        // If provider joins first, start the idle timer immediately
        if (room.participants.size === 0) {
            _this.activateTimer(true);
        } else {
            _this.activateTimer(false);
        }
        // When a Participant joins the Room, log the event.
        room.on('participantConnected', function (participant) {
            console.log("Participant:", participant);
            console.log("Joining: '" + participant.identity + "'");
            _this.toastService.showInfo(participant.identity + " Joined");
            _this.participantsCount = room.participants.size;
            console.log("connected - Participants:" + room.participants.size);
            if (_this.participantsCount === 0) {
                _this.activateTimer(true);
            } else {
                _this.activateTimer(false);
            }
        });
        // When a Participant adds a Track, attach it to the DOM.
        room.on('trackSubscribed', function (track, trackPublication, participant) {
            console.log("Local Participant:", room.localParticipant);
            console.log("Remote Participant:", room.remoteParticipant);
            console.log(participant.identity + ' added track: ' + track.kind);
            _this.participantsCount = room.participants.size;
            console.log("Participants:" + _this.participantsCount);
            // var previewContainer = document.getElementById('remoteVideo');
            _this.attachTracks([track], _this.remoteVideo.nativeElement, room);
            console.log('tracksubscribed');
            if (track.kind === 'audio') {
                track.on('disabled', function () {
                    _this.toastService.showInfo(participant.identity + ' muted audio');
                });

                track.on('enabled', function () {
                    _this.toastService.showInfo(participant.identity + ' unmuted audio');
                });
            }
            if (track.kind === 'video') {
                _this.toastService.showInfo(participant.identity + ' enabled video');
                _this.removeRemoteParticipantDetails(_this.remoteVideo.nativeElement);
            }
            if (_this.participantsCount === 0) {
                _this.activateTimer(true);
            } else {
                _this.activateTimer(false);
            }
        });
        // When a Participant removes a Track, detach it from the DOM.
        room.on('trackUnsubscribed', function (track, trackPublication, participant) {
            console.log(participant.identity + ' removed track: ' + track.kind);
            _this.detachTracks([track]);
            console.log('trackUnsubscribed');
            if (track.kind === 'video') {
                _this.toastService.showInfo(participant.identity + ' disabled/switched video');
                _this.addRemoteParticipantDetails(_this.remoteVideo.nativeElement, participant);
            }
        });
        room.on('participantReconnecting', remoteParticipant => {
            console.log(remoteParticipant.state, 'reconnecting');
            console.log(`${remoteParticipant.identity} is reconnecting the signaling connection to the Room!`);
            _this.toastService.showInfo(`${remoteParticipant.identity} is reconnecting the signaling connection to the Room!`);
            /* Update the RemoteParticipant UI here */
        });
        room.on('participantReconnected', remoteParticipant => {
            console.log(remoteParticipant.state, 'connected');
            console.log(`${remoteParticipant.identity} has reconnected the signaling connection to the Room!`);
            /* Update the RemoteParticipant UI here */
        });
        // When a Participant leaves the Room, detach its Tracks.
        room.on('participantDisconnected', function (participant) {
            console.log("Participant '" + participant.identity + "' left the room");
            _this.toastService.showInfo("Participant '" + participant.identity + "' left the room");
            _this.detachParticipantTracks(participant, room, _this);
            _this.participantsCount = room.participants.size;
            console.log("disConnected - Participants Size:" + room.participants.size);
            _this.removeRemoteParticipantDetails(_this.remoteVideo.nativeElement);
            _this.activateTimer(true);
        });

        room.on('reconnecting', error => {
            console.log(room.state, 'reconnecting');
            _this.toastService.showInfo('Reconnecting your signaling and media connections!');
            _this.sendError(error);
            _this.participantsCount = room.participants.size;
            console.log("connected - Participants:" + room.participants.size);
            if (_this.participantsCount === 0) {
                _this.activateTimer(true);
            } else {
                _this.activateTimer(false);
            }
            /* Update the application UI here */
        });
        room.on('reconnected', () => {
            console.log(room.state, 'connected');
            console.log('Reconnected your signaling and media connections!');
            _this.toastService.showInfo('Reconnected your signaling and media connections!');
            _this.participantsCount = room.participants.size;
            console.log("connected - Participants:" + room.participants.size);
            if (_this.participantsCount === 0) {
                _this.activateTimer(true);
            } else {
                _this.activateTimer(false);
            }
            /* Update the application UI here */
        });

        // Once the LocalParticipant leaves the room, detach the Tracks
        // of all Participants, including that of the LocalParticipant.
        room.on('disconnected', function (room, error) {
            console.log('Left');
            console.log(room.state, 'disconnected');
            console.log("Error:", error);
            _this.sendError(error);
            room.localParticipant.tracks.forEach(publication => {
                publication.track.stop();
                publication.unpublish();
                const attachedElements = publication.track.detach();
                attachedElements.forEach(element => element.remove());
            });
            if (_this.localVideo) {
                const localElement = _this.localVideo.nativeElement;
                while (localElement.firstChild) {
                    localElement.removeChild(localElement.firstChild);
                }
            }
            if (_this.remoteVideo) {
                const remoteElement = _this.remoteVideo.nativeElement;
                while (remoteElement.firstChild) {
                    remoteElement.removeChild(remoteElement.firstChild);
                }
            }
            _this.participantsCount = room.participants.size;
            _this.disconnect();
        });
    }
    removeRemoteParticipantDetails(container) {
        const div = document.getElementById('remoteImg');
        if (div) {
            this.renderer.removeChild(container, div);
        }
    }
    removeLocalParticipantDetails(container) {
        const div = document.getElementById('localImg');
        if (div) {
            this.renderer.removeChild(container, div);
        }
    }
    addRemoteParticipantDetails(container, participant) {
        const div = document.createElement('div');
        div.setAttribute('id', 'remoteImg');
        // Center avatar container
        this.renderer.setStyle(div, 'display', 'flex');
        this.renderer.setStyle(div, 'flexDirection', 'column');
        this.renderer.setStyle(div, 'alignItems', 'center');
        this.renderer.setStyle(div, 'justifyContent', 'center');
        this.renderer.setStyle(div, 'height', '100%');

        // Avatar image (initials in a circle)
        const div1 = document.createElement('div');
        div1.setAttribute('class', 'avatar-img');
        const initials = (participant && participant.identity ? participant.identity.trim().charAt(0) : '?').toUpperCase();
        div1.textContent = initials;
        this.renderer.setStyle(div1, 'width', '120px');
        this.renderer.setStyle(div1, 'height', '120px');
        this.renderer.setStyle(div1, 'borderRadius', '50%');
        this.renderer.setStyle(div1, 'background', 'linear-gradient(135deg, #6c757d, #495057)');
        this.renderer.setStyle(div1, 'color', '#fff');
        this.renderer.setStyle(div1, 'display', 'flex');
        this.renderer.setStyle(div1, 'alignItems', 'center');
        this.renderer.setStyle(div1, 'justifyContent', 'center');
        this.renderer.setStyle(div1, 'fontWeight', '700');
        this.renderer.setStyle(div1, 'fontSize', '48px');
        this.renderer.setStyle(div1, 'boxShadow', '0 4px 18px rgba(0,0,0,0.25)');
        this.renderer.setStyle(div1, 'userSelect', 'none');
        div.appendChild(div1);

        // Avatar text (full identity)
        const div2 = document.createElement('div');
        div2.setAttribute('class', 'avatar-text');
        // Ensure visibility regardless of component style encapsulation
        this.renderer.setStyle(div2, 'color', '#fff');
        this.renderer.setStyle(div2, 'fontWeight', '600');
        this.renderer.setStyle(div2, 'textAlign', 'center');
        this.renderer.setStyle(div2, 'marginTop', '8px');
        const contentDiv = document.createTextNode(participant.identity);
        div2.appendChild(contentDiv);
        div.appendChild(div2);
        this.renderer.appendChild(container, div);
    }
    addLocalParticipantDetails(container) {
        const div = document.createElement('div');
        div.setAttribute('id', 'localImg');
        // Center avatar container
        this.renderer.setStyle(div, 'display', 'flex');
        this.renderer.setStyle(div, 'flexDirection', 'column');
        this.renderer.setStyle(div, 'alignItems', 'center');
        this.renderer.setStyle(div, 'justifyContent', 'center');
        this.renderer.setStyle(div, 'height', '100%');

        const div1 = document.createElement('div');
        div1.setAttribute('class', 'avatar-img');
        const identity = (this.activeRoom && this.activeRoom.localParticipant && this.activeRoom.localParticipant.identity) ? this.activeRoom.localParticipant.identity : 'You';
        const initials = identity.trim().charAt(0).toUpperCase();
        div1.textContent = initials;
        this.renderer.setStyle(div1, 'width', '120px');
        this.renderer.setStyle(div1, 'height', '120px');
        this.renderer.setStyle(div1, 'borderRadius', '50%');
        this.renderer.setStyle(div1, 'background', 'linear-gradient(135deg, #6c757d, #495057)');
        this.renderer.setStyle(div1, 'color', '#fff');
        this.renderer.setStyle(div1, 'display', 'flex');
        this.renderer.setStyle(div1, 'alignItems', 'center');
        this.renderer.setStyle(div1, 'justifyContent', 'center');
        this.renderer.setStyle(div1, 'fontWeight', '700');
        this.renderer.setStyle(div1, 'fontSize', '48px');
        this.renderer.setStyle(div1, 'boxShadow', '0 4px 18px rgba(0,0,0,0.25)');
        this.renderer.setStyle(div1, 'userSelect', 'none');
        this.renderer.appendChild(div, div1);

        const div2 = document.createElement('div');
        div2.setAttribute('class', 'avatar-text');
        this.renderer.setStyle(div2, 'color', '#fff');
        this.renderer.setStyle(div2, 'fontWeight', '600');
        this.renderer.setStyle(div2, 'textAlign', 'center');
        this.renderer.setStyle(div2, 'marginTop', '8px');
        div2.appendChild(document.createTextNode(identity));
        this.renderer.appendChild(div, div2);

        this.renderer.appendChild(container, div);
    }

    disconnect() {
        const _this = this;

        // Stop and clear preview tracks
        if (_this.previewTracks) {
            _this.previewTracks.forEach(localTrack => {
                try { localTrack.stop(); } catch (e) { console.warn(e); }
            });
        }
        _this.previewTracks = null;

        // Disconnect active room if exists
        if (_this.activeRoom) {
            _this.activeRoom.localParticipant.tracks.forEach(publication => {
                try {
                    publication.track.stop();
                    publication.unpublish();
                    const attachedElements = publication.track.detach();
                    attachedElements.forEach(el => el.remove());
                } catch (e) { console.warn(e); }
            });

            // Detach remote participants’ tracks
            _this.activeRoom.participants.forEach(participant => {
                participant.tracks.forEach(publication => {
                    try {
                        const track = publication.track;
                        if (track) {
                            track.stop();
                            track.detach().forEach(el => el.remove());
                        }
                    } catch (e) { console.warn(e); }
                });
            });

            // Finally disconnect the room
            try { _this.activeRoom.disconnect(); } catch (e) { console.warn(e); }
        }

        // Clear DOM containers
        if (_this.localVideo) {
            const localElement = _this.localVideo.nativeElement;
            while (localElement.firstChild) {
                localElement.removeChild(localElement.firstChild);
            }
        }
        if (_this.remoteVideo) {
            const remoteElement = _this.remoteVideo.nativeElement;
            while (remoteElement.firstChild) {
                remoteElement.removeChild(remoteElement.firstChild);
            }
        }

        // Reset state
        _this.activeRoom = null;
        _this.participantsCount = 0;
        _this.cam1Device = null;
        _this.cam2Device = null;
        _this.selectedVideoId = null;
        _this.selectedAudioId = null;
        _this.deviceCachePromise = null;
        _this.preview = true;
        _this.video = false;
        _this.microphone = false;
        _this.loading = false;
    }
}
