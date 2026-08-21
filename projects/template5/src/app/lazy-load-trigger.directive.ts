import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[lazyLoadTrigger]',
  standalone: true
})
export class LazyLoadTriggerDirective implements OnInit, OnChanges, OnDestroy {
  @Input() lazyLoadEnabled: boolean = true;
  @Input() lazyLoadRootMargin: string = '200px 0px';
  @Input() lazyLoadThreshold: number = 0.1;
  @Output() lazyLoadTrigger = new EventEmitter<void>();

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.setupObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lazyLoadEnabled'] || changes['lazyLoadRootMargin'] || changes['lazyLoadThreshold']) {
      this.setupObserver();
    }
  }

  ngOnDestroy(): void {
    this.disconnectObserver();
  }

  private setupObserver(): void {
    this.disconnectObserver();
    if (!this.lazyLoadEnabled || typeof window === 'undefined') {
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.lazyLoadTrigger.emit();
          }
        });
      },
      { threshold: this.lazyLoadThreshold, rootMargin: this.lazyLoadRootMargin }
    );
    this.observer.observe(this.el.nativeElement);
  }

  private disconnectObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
