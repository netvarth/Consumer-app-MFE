import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';

export type ImageVideoViewerMediaType = 'image' | 'video';

export interface ImageVideoViewerMedia {
  type: ImageVideoViewerMediaType;
  src: string;
  poster?: string;
  alt?: string;
}

@Component({
  selector: 'app-image-video-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-video-viewer.component.html',
  styleUrl: './image-video-viewer.component.scss'
})
export class ImageVideoViewerComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() media: ImageVideoViewerMedia[] = [];
  @Input() initialIndex = 0;
  @Input() visible = true;
  @Input() animationDuration = 220;
  @Input() enableZoom = true;
  @Input() enableVideoAutoplay = false;
  @Output() closed = new EventEmitter<void>();

  @ViewChildren('viewerVideo') private videos!: QueryList<ElementRef<HTMLVideoElement>>;

  activeIndex = 0;
  scale = 1;
  translateX = 0;
  translateY = 0;
  dragOffset = 0;
  isDragging = false;

  private startX = 0;
  private startY = 0;
  private lastTranslateX = 0;
  private lastTranslateY = 0;
  private pinchStartDistance = 0;
  private pinchStartScale = 1;
  private lastTapAt = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialIndex'] || changes['media']) {
      this.activeIndex = this.clampIndex(this.initialIndex || 0);
      this.resetZoom();
      this.preloadAdjacent();
    }
  }

  ngAfterViewInit(): void {
    this.pauseInactiveVideos();
  }

  ngOnDestroy(): void {
    this.pauseAllVideos();
  }

  get activeMedia(): ImageVideoViewerMedia | null {
    return this.media?.[this.activeIndex] || null;
  }

  get canZoom(): boolean {
    return this.enableZoom && this.activeMedia?.type === 'image';
  }

  get trackTransform(): string {
    return `translateX(calc(${-this.activeIndex * 100}% + ${this.dragOffset}px))`;
  }

  close(): void {
    this.pauseAllVideos();
    this.closed.emit();
  }

  prev(): void {
    this.goTo(this.activeIndex - 1);
  }

  next(): void {
    this.goTo(this.activeIndex + 1);
  }

  goTo(index: number): void {
    const nextIndex = this.clampIndex(index);
    if (nextIndex === this.activeIndex) {
      return;
    }
    this.pauseAllVideos();
    this.activeIndex = nextIndex;
    this.resetZoom();
    this.preloadAdjacent();
    setTimeout(() => this.pauseInactiveVideos());
  }

  shouldRender(index: number): boolean {
    return Math.abs(index - this.activeIndex) <= 1;
  }

  onWheel(event: WheelEvent): void {
    if (!this.canZoom) {
      return;
    }
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.18 : -0.18;
    this.setScale(this.scale + delta);
  }

  onStagePointerDown(event: PointerEvent): void {
    if ((event.target as HTMLElement).closest('video, button')) {
      return;
    }
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.lastTranslateX = this.translateX;
    this.lastTranslateY = this.translateY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  onStagePointerMove(event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }
    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;
    if (this.scale > 1 && this.canZoom) {
      this.translateX = this.lastTranslateX + deltaX;
      this.translateY = this.lastTranslateY + deltaY;
      return;
    }
    this.dragOffset = deltaX;
  }

  onStagePointerUp(event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }
    this.isDragging = false;
    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;
    this.dragOffset = 0;
    if (this.scale <= 1 && Math.abs(deltaX) > 56 && Math.abs(deltaX) > Math.abs(deltaY)) {
      deltaX < 0 ? this.next() : this.prev();
    }
  }

  onTouchStart(event: TouchEvent): void {
    if (!this.canZoom || event.touches.length !== 2) {
      return;
    }
    this.pinchStartDistance = this.getTouchDistance(event);
    this.pinchStartScale = this.scale;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.canZoom || event.touches.length !== 2 || !this.pinchStartDistance) {
      return;
    }
    event.preventDefault();
    const distance = this.getTouchDistance(event);
    this.setScale(this.pinchStartScale * (distance / this.pinchStartDistance));
  }

  onImageDoubleClick(): void {
    if (!this.canZoom) {
      return;
    }
    this.scale > 1 ? this.resetZoom() : this.setScale(2);
  }

  onImageTap(): void {
    const now = Date.now();
    if (now - this.lastTapAt < 280) {
      this.onImageDoubleClick();
    }
    this.lastTapAt = now;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!this.visible) {
      return;
    }
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowLeft') {
      this.prev();
    } else if (event.key === 'ArrowRight') {
      this.next();
    }
  }

  private clampIndex(index: number): number {
    return Math.max(0, Math.min(index, Math.max((this.media?.length || 1) - 1, 0)));
  }

  private resetZoom(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.dragOffset = 0;
  }

  private setScale(value: number): void {
    this.scale = Math.max(1, Math.min(value, 4));
    if (this.scale === 1) {
      this.translateX = 0;
      this.translateY = 0;
    }
  }

  private getTouchDistance(event: TouchEvent): number {
    const first = event.touches.item(0);
    const second = event.touches.item(1);
    if (!first || !second) {
      return 0;
    }
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  }

  private pauseInactiveVideos(): void {
    this.videos?.forEach((videoRef) => {
      const video = videoRef.nativeElement;
      const index = Number(video.dataset['index']);
      if (index !== this.activeIndex) {
        video.pause();
        return;
      }
      if (this.enableVideoAutoplay) {
        const play = video.play();
        if (play && typeof play.catch === 'function') {
          play.catch(() => { });
        }
      }
    });
  }

  private pauseAllVideos(): void {
    this.videos?.forEach((videoRef) => videoRef.nativeElement.pause());
  }

  private preloadAdjacent(): void {
    [this.activeIndex - 1, this.activeIndex + 1].forEach((index) => {
      const item = this.media?.[index];
      if (!item || item.type !== 'image' || !item.src) {
        return;
      }
      const image = new Image();
      image.src = item.src;
    });
  }
}
