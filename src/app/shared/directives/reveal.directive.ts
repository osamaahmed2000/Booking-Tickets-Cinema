import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[reveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit {
  @Input() delay = 0;
  private readonly el: HTMLElement;

  constructor(ref: ElementRef<HTMLElement>) {
    this.el = ref.nativeElement;
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.el.classList.add('is-in');
      return;
    }
    this.el.classList.add('reveal');
    this.el.style.transitionDelay = `${this.delay}ms`;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            this.el.classList.add('is-in');
            obs.disconnect();
          }
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(this.el);
  }
}