import { Component, OnInit, NgZone } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentTime: string = '';
  countdown: number = 0;
  pausedCountdown: number | null = null;
  timerRunning = false;
  isBreak = false;
  interval: any;
  breakCount = 0;

  // Set test durations (30s). Change to 25*60 and 5*60 for real usage
  pomodoroDuration = 30; // 25 * 60
  breakDuration = 30;    // 5 * 60

  constructor(private zone: NgZone) {}

  ngOnInit() {
    // Start real-time clock
    setInterval(() => {
      this.zone.run(() => {
        this.currentTime = new Date().toLocaleTimeString();
      });
    }, 1000);

    this.requestPermissions();
  }

  async requestPermissions() {
    await LocalNotifications.requestPermissions();
  }

  async sendNotification(title: string, body: string) {
    await Haptics.impact({ style: ImpactStyle.Heavy });

    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: new Date().getTime(),
          schedule: { at: new Date(Date.now() + 100) },
          sound: 'beep',
        },
      ],
    });
  }

  resetTimer() {
    clearInterval(this.interval);
    this.countdown = 0;
    this.pausedCountdown = null;
    this.timerRunning = false;
    this.isBreak = false;
  }

  startPomodoro() {
    if (this.timerRunning) return;
    this.isBreak = false;
    this.timerRunning = true;
    this.countdown = this.pausedCountdown ?? this.pomodoroDuration;
    this.pausedCountdown = null;
    this.startCountdown();
  }

  startManualBreak() {
    if (this.timerRunning) return;
    this.isBreak = true;
    this.timerRunning = true;
    this.countdown = this.breakDuration;
    this.pausedCountdown = null;
    this.startCountdown();
  }

  startBreak() {
    this.isBreak = true;
    this.countdown = this.breakDuration;
    this.timerRunning = true;
    this.startCountdown();
  }

  startCountdown() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.interval);
        this.timerRunning = false;

        const title = this.isBreak ? 'Break finished' : 'Pomodoro done';
        const body = this.isBreak ? 'Back to work!' : 'Take a break!';
        this.sendNotification(title, body);

        if (this.isBreak) {
          this.breakCount++;
          this.resetApp();
        } else {
          this.startBreak();
        }
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.interval);
    this.pausedCountdown = this.countdown;
    this.timerRunning = false;
  }

  resetApp() {
    this.countdown = 0;
    this.pausedCountdown = null;
    this.timerRunning = false;
    this.isBreak = false;
  }

  formatTime(sec: number): string {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  get displayTime(): number {
    if (this.countdown > 0) return this.countdown;
    if (this.pausedCountdown !== null) return this.pausedCountdown;
    return this.isBreak ? this.breakDuration : this.pomodoroDuration;
  }
}
