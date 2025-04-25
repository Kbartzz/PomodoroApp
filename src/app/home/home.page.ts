import { Component, OnInit, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['.home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  currentTime: string = '';
  countdown: number = 0;
  timerRunning = false;
  isBreak = false;
  interval: any;

  constructor(private zone: NgZone, private platform: Platform) {}

  ngOnInit() {
    setInterval(() => {
      this.zone.run(() => {
        this.currentTime = new Date().toLocaleTimeString();
      });
    }, 1000);
  }

  startPomodoro() {
    if (this.timerRunning) return;
    this.isBreak = false;
    this.timerRunning = true;
    this.countdown = 25 * 60; 
    this.startCountdown();
  }

  startBreak() {
    this.isBreak = true;
    this.countdown = 5 * 60; 
    this.startCountdown();
  }

  startCountdown() {
    this.interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  }
}
