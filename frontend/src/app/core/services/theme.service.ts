import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkModeSubject: BehaviorSubject<boolean>;
  public isDarkMode$: Observable<boolean>;

  constructor() {
    const saved = localStorage.getItem('iem_dark_theme') === 'true';
    this.isDarkModeSubject = new BehaviorSubject<boolean>(saved);
    this.isDarkMode$ = this.isDarkModeSubject.asObservable();
    this.applyTheme(saved);
  }

  toggleTheme(): void {
    const nextState = !this.isDarkModeSubject.value;
    this.isDarkModeSubject.next(nextState);
    localStorage.setItem('iem_dark_theme', String(nextState));
    this.applyTheme(nextState);
  }

  private applyTheme(dark: boolean): void {
    if (dark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }
}
